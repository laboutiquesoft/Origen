import { pool } from '../config/db.js';
import tenantRepository from '../repositories/tenant.repository.js';
import userRepository from '../repositories/user.repository.js';
import roleRepository from '../repositories/role.repository.js';
import bcrypt from 'bcrypt';
import { AppError } from '@origen/common';

class TenantService {
    async createTenant(tenantData, adminUserData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create Tenant
            // Mapping 'name' to 'tenant_name' if needed, or assuming repository receives correct fields
            const tenant = await tenantRepository.create({
                tenant_name: tenantData.name,
                slug: tenantData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                initials: tenantData.initials,
                nit: tenantData.nit,
                verification_code: tenantData.verification_code,
                habilitation_code: tenantData.habilitation_code,
                territorial_code: tenantData.territorial_code,
                logoUrl: tenantData.logoUrl,
                country: tenantData.country,
                city: tenantData.city,
                address: tenantData.address,
                phone: tenantData.phone,
                email: tenantData.email,
                status: true
            });

            // 2. Find Admin Role (Global Admin role)
            const adminRoles = await roleRepository.findAll({
                role_name: 'Admin',
                id_tenant: null,
                id_site: null
            });

            console.log('Lookup Admin Role result:', JSON.stringify(adminRoles));

            const adminRole = adminRoles[0];

            if (!adminRole) {
                console.error('All roles in DB:', JSON.stringify(await roleRepository.findAll({})));
                throw new AppError('Admin role not found with criteria {role_name: Admin, id_tenant: null, id_site: null}. Please check seed.', 500);
            }

            // 3. Create Admin User
            const hashedPassword = await bcrypt.hash(adminUserData.password, 10);

            const user = await userRepository.create({
                email: adminUserData.email,
                password: hashedPassword,
                first_name: adminUserData.first_name,
                last_name: adminUserData.last_name,
                id_tenant: tenant.id_tenant,
                status: true,
                roles: [adminRole.id_role] // UserRepository.create handles role insertion
            });

            await client.query('COMMIT');
            return { tenant, adminUser: user };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getAllTenants(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { tenant_name: { contains: search } },
                { initials: { contains: search } },
                { nit: { contains: search } }
            ]
        } : {};

        const tenants = await tenantRepository.findAll(skip, limit, where);
        const total = await tenantRepository.count(where);

        return {
            data: tenants,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getTenantById(id) {
        const tenant = await tenantRepository.findById(id);
        if (!tenant) {
            throw new AppError('Tenant not found', 404);
        }
        return tenant;
    }

    async updateTenant(id, data) {
        const tenant = await tenantRepository.findById(id);
        if (!tenant) {
            throw new AppError('Tenant not found', 404);
        }
        return await tenantRepository.update(id, data);
    }

    async deleteTenant(id) {
        const tenant = await tenantRepository.findById(id);
        if (!tenant) {
            throw new AppError('Tenant not found', 404);
        }
        await tenantRepository.delete(id);
        return { message: 'Tenant deleted successfully' };
    }

    async updateMicroservices(tenantId, microserviceIds) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Delete existing
            await client.query('DELETE FROM tenant_microservices WHERE id_tenant = $1', [tenantId]);

            // Create new ones
            if (microserviceIds && microserviceIds.length > 0) {
                for (const msId of microserviceIds) {
                    await client.query(
                        'INSERT INTO tenant_microservices (id_tenant, id_microservice) VALUES ($1, $2)',
                        [tenantId, msId]
                    );
                }
            }

            await client.query('COMMIT');
            return { message: 'Microservices updated' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getDashboardStats(tenantId) {
        return await tenantRepository.getStats(tenantId);
    }
}

export default new TenantService();