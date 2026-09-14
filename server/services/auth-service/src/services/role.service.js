import roleRepository from '../repositories/role.repository.js';
import { AppError } from '@origen/common';

class RoleService {
    async createRole(data, user) {
        // Enforce scoping based on user role
        const userRoles = user.user_roles.map(ur => ur.role.name);

        if (userRoles.includes('AllMighty')) {
            // Can create anything
        } else if (userRoles.includes('Admin')) {
            data.id_tenant = user.id_tenant;
            data.is_system = false;
        } else if (userRoles.includes('SiteAdmin')) {
            data.id_tenant = user.id_tenant;
            data.id_site = user.id_site || (user.user_sites[0]?.id_site);
            data.is_system = false;
        }

        // Check for duplicate name in scope
        const existing = await roleRepository.findByName(data.name, data.id_tenant, data.id_site);
        if (existing) {
            throw new AppError('A role with this name already exists in this scope', 400);
        }

        return await roleRepository.create(data);
    }

    async getRoles(user, filters = {}) {
        const userRoles = user.user_roles.map(ur => ur.role.name);
        const { id_tenant, id_site } = filters;

        if (userRoles.includes('AllMighty')) {
            if (!id_tenant && !id_site) {
                return await roleRepository.findAll({});
            }

            // Fetch roles from different scopes
            const siteRoles = id_site ? await roleRepository.findAll({ id_site }) : [];
            const tenantRoles = id_tenant ? await roleRepository.findAll({ id_tenant, id_site: null }) : [];
            const systemRoles = await roleRepository.findAll({ is_system: true });
            const globalRoles = await roleRepository.findAll({ id_tenant: null, id_site: null });

            // Merge and dedup
            const allRoles = [...systemRoles, ...globalRoles, ...tenantRoles, ...siteRoles];
            return allRoles.filter((role, index, self) =>
                index === self.findIndex((t) => t.id_role === role.id_role)
            );
        }

        // Any user belonging to a tenant (Admin, SiteAdmin, Custom)
        if (user.id_tenant) {
            const tId = user.id_tenant;

            // Determine Site Context
            // 1. Filter passed in query (e.g. Admin selects a context)
            // 2. User's assigned site (e.g. SiteAdmin/Custom scoped to site)
            const sId = id_site || user.id_site || user.user_sites?.[0]?.id_site;

            // Fetch roles
            const siteRoles = sId ? await roleRepository.findAll({ id_site: sId }) : [];
            const tenantRoles = await roleRepository.findAll({ id_tenant: tId, id_site: null });
            const systemRoles = await roleRepository.findAll({ is_system: true });
            const globalRoles = await roleRepository.findAll({ id_tenant: null, id_site: null });

            // Merge and dedup
            const allRoles = [...systemRoles, ...globalRoles, ...tenantRoles, ...siteRoles];
            const uniqueRoles = allRoles.filter((role, index, self) =>
                index === self.findIndex((t) => t.id_role === role.id_role)
            );

            // === SECURITY: Filter restricted roles based on user permissions ===
            return uniqueRoles.filter(role => {
                // 1. AllMighty is NEVER visible to non-AllMighty users
                if (role.name === 'AllMighty') return false;

                // 2. Admin can create SiteAdmin but NOT other Admins
                if (userRoles.includes('Admin')) {
                    if (role.name === 'Admin') return false;
                    return true;
                }

                // 3. SiteAdmin cannot create AllMighty, Admin, or SiteAdmin
                if (userRoles.includes('SiteAdmin')) {
                    if (['Admin', 'SiteAdmin'].includes(role.name)) return false;
                    return true;
                }

                // 4. Any other user cannot see administrative roles
                if (['Admin', 'SiteAdmin'].includes(role.name)) return false;

                return true;
            });
        }

        return [];
    }

    async updateRole(id, data, user) {
        const role = await roleRepository.findById(id);
        if (!role) {
            throw new AppError('Role not found', 404);
        }

        if (role.is_system && !user.user_roles.some(ur => ur.role.name === 'AllMighty')) {
            throw new AppError('Cannot modify system roles', 403);
        }

        // Verify scope access
        this.verifyScopeAccess(role, user);

        return await roleRepository.update(id, data);
    }

    async deleteRole(id, user) {
        const role = await roleRepository.findById(id);
        if (!role) {
            throw new AppError('Role not found', 404);
        }

        if (role.is_system && !user.user_roles.some(ur => ur.role.name === 'AllMighty')) {
            throw new AppError('Cannot delete system roles', 403);
        }

        // Verify scope access
        this.verifyScopeAccess(role, user);

        return await roleRepository.delete(id);
    }

    verifyScopeAccess(role, user) {
        const userRoles = user.user_roles.map(ur => ur.role.name);
        if (userRoles.includes('AllMighty')) return;

        if (userRoles.includes('Admin')) {
            if (role.id_tenant !== user.id_tenant) {
                throw new AppError('You do not have permission to manage roles outside your tenant', 403);
            }
            return;
        }

        if (userRoles.includes('SiteAdmin')) {
            const siteId = user.id_site || user.user_sites[0]?.id_site;
            if (role.id_site !== siteId) {
                throw new AppError('You do not have permission to manage roles outside your site', 403);
            }
            return;
        }

        throw new AppError('Unauthorized role management', 403);
    }
}

export default new RoleService();