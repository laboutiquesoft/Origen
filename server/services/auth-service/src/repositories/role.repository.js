import pool from '../config/db.js';

class RoleRepository {
    async create(data) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { permissions, name, ...roleData } = data;

            // Map name to role_name for database compatibility
            if (name) roleData.role_name = name;

            const fields = Object.keys(roleData);
            const values = Object.values(roleData);
            const placeholders = fields.map((_, i) => `$${i + 1}`);

            if (fields.length === 0) {
                throw new Error("Cannot create role without data");
            }

            const roleResult = await client.query(
                `INSERT INTO roles (${fields.join(',')})
                 VALUES (${placeholders.join(',')})
                 RETURNING *`,
                values
            );

            const role = roleResult.rows[0];

            if (permissions && permissions.length > 0) {
                const uniquePermissions = [...new Set(permissions)];
                for (const permissionId of uniquePermissions) {
                    await client.query(
                        `INSERT INTO role_permissions (id_role, id_permission)
                         VALUES ($1, $2)`,
                        [role.id_role, permissionId]
                    );
                }
            }

            await client.query('COMMIT');
            return this.findById(role.id_role);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findAll(where = {}) {
        const client = await pool.connect();
        try {
            let query = `
                SELECT 
                    r.*, r.role_name as name,
                    rp.id_role_permission,
                    p.id_permission, p.permission_resource as resource, p.permission_action as action
                FROM roles r
                LEFT JOIN role_permissions rp ON rp.id_role = r.id_role
                LEFT JOIN permissions p ON p.id_permission = rp.id_permission
            `;
            const values = [];
            const conditions = [];

            Object.entries(where).forEach(([key, value]) => {
                const dbKey = key === 'name' ? 'role_name' : key;
                if (value === null) {
                    conditions.push(`r.${dbKey} IS NULL`);
                } else {
                    values.push(value);
                    conditions.push(`r.${dbKey} = $${values.length}`);
                }
            });

            if (conditions.length) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ` ORDER BY r.role_name ASC`;

            const result = await client.query(query, values);
            return this._groupRoles(result.rows);
        } finally {
            client.release();
        }
    }

    async findById(id) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT 
                    r.*, r.role_name as name,
                    rp.id_role_permission,
                    p.id_permission, p.permission_resource as resource, p.permission_action as action
                FROM roles r
                LEFT JOIN role_permissions rp ON rp.id_role = r.id_role
                LEFT JOIN permissions p ON p.id_permission = rp.id_permission
                WHERE r.id_role = $1`,
                [id]
            );

            const grouped = this._groupRoles(result.rows);
            return grouped[0] || null;
        } finally {
            client.release();
        }
    }

    async findByName(name, id_tenant = null, id_site = null) {
        let query = `SELECT * FROM roles WHERE role_name = $1`;
        const values = [name];

        if (id_tenant) {
            query += ` AND id_tenant = $2`;
            values.push(id_tenant);
        } else {
            query += ` AND id_tenant IS NULL`;
        }

        if (id_site) {
            query += ` AND id_site = $${values.length + 1}`;
            values.push(id_site);
        } else {
            query += ` AND id_site IS NULL`;
        }

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    async update(id, data) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { permissions, name, ...roleData } = data;

            if (name) roleData.role_name = name;

            if (Object.keys(roleData).length > 0) {
                const fields = Object.keys(roleData);
                const values = Object.values(roleData);
                const setClause = fields.map((field, i) => `${field} = $${i + 1}`);

                await client.query(
                    `UPDATE roles
                     SET ${setClause.join(',')}
                     WHERE id_role = $${fields.length + 1}`,
                    [...values, id]
                );
            }

            if (permissions) {
                await client.query(`DELETE FROM role_permissions WHERE id_role = $1`, [id]);
                const uniquePermissions = [...new Set(permissions)];
                for (const permissionId of uniquePermissions) {
                    await client.query(
                        `INSERT INTO role_permissions (id_role, id_permission)
                         VALUES ($1, $2)`,
                        [id, permissionId]
                    );
                }
            }

            await client.query('COMMIT');
            return this.findById(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(id) {
        await pool.query(`DELETE FROM roles WHERE id_role = $1`, [id]);
    }

    _groupRoles(rows) {
        const rolesMap = new Map();

        rows.forEach(row => {
            if (!rolesMap.has(row.id_role)) {
                rolesMap.set(row.id_role, {
                    ...row,
                    name: row.role_name, // Alias for frontend
                    role_permissions: []
                });
            }

            if (row.id_permission) {
                const role = rolesMap.get(row.id_role);
                role.role_permissions.push({
                    id_role_permission: row.id_role_permission,
                    permission: {
                        id_permission: row.id_permission,
                        resource: row.resource,
                        action: row.action
                    }
                });
            }
        });

        return Array.from(rolesMap.values());
    }
}

export default new RoleRepository();