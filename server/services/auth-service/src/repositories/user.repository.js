import { pool } from "../config/db.js";
import User from "../entities/user.js";

class UserRepository {

    async findByEmail(email) {
        // 🟢 DIAGNÓSTICO DE CONEXIÓN
        console.log("🔍 [UserRepository] Intentando conectar a la Base de Datos...");
        console.log("🔍 DATABASE_URL activa:", process.env.DATABASE_URL);
        console.log("🔍 Pool Options Host:", pool.options?.host || pool.options?.connectionString);

        const client = await pool.connect();
        try {
            console.log("✅ [UserRepository] Conexión establecida con éxito!");
            const userResult = await client.query(
                `SELECT * FROM users WHERE email = $1`,
                [email]
            );

            if (!userResult.rows.length) return null;
            return await this._getUserWithRelations(client, userResult.rows[0]);
        } catch (error) {
            console.error("🔥 [UserRepository] Error en la consulta o conexión:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    async findById(id) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT * FROM users WHERE id_user = $1`,
                [id]
            );
            if (!result.rows.length) return null;
            return await this._getUserWithRelations(client, result.rows[0]);
        } finally {
            client.release();
        }
    }

    async findByResetToken(token) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT * FROM users 
                 WHERE reset_password_token = $1 
                 AND reset_password_expires > NOW()`,
                [token]
            );
            if (!result.rows.length) return null;
            return await this._getUserWithRelations(client, result.rows[0]);
        } finally {
            client.release();
        }
    }

    async _getUserWithRelations(client, user) {
        // Get Roles and Permissions
        const rolesResult = await client.query(`
            SELECT 
                r.id_role, r.role_name, r.description as role_description,
                p.id_permission, p.permission_resource, p.permission_action, p.description as perm_description
            FROM user_roles ur
            JOIN roles r ON ur.id_role = r.id_role
            LEFT JOIN role_permissions rp ON rp.id_role = r.id_role
            LEFT JOIN permissions p ON p.id_permission = rp.id_permission
            WHERE ur.id_user = $1
        `, [user.id_user]);

        // Group roles and permissions
        const userRolesMap = new Map();
        rolesResult.rows.forEach(row => {
            if (!userRolesMap.has(row.id_role)) {
                userRolesMap.set(row.id_role, {
                    role: {
                        id_role: row.id_role,
                        name: row.role_name,
                        description: row.role_description,
                        role_permissions: []
                    }
                });
            }
            if (row.id_permission) {
                const role = userRolesMap.get(row.id_role).role;
                role.role_permissions.push({
                    permission: {
                        id_permission: row.id_permission,
                        resource: row.permission_resource,
                        action: row.permission_action,
                        description: row.perm_description
                    }
                });
            }
        });

        const microservices = await client.query(`
            SELECT m.id_microservice, m.microservice_name as name, m.code, m.description
            FROM user_microservices um
            JOIN microservices m ON m.id_microservice = um.id_microservice
            WHERE um.id_user = $1
        `, [user.id_user]);

        const sites = await client.query(`
            SELECT s.*
            FROM user_sites us
            JOIN sites s ON s.id_site = us.id_site
            WHERE us.id_user = $1
        `, [user.id_user]);

        // Get Tenant
        let tenant = null;
        if (user.id_tenant) {
            const tenantRes = await client.query('SELECT * FROM tenants WHERE id_tenant = $1', [user.id_tenant]);
            if (tenantRes.rows[0]) {
                const t = tenantRes.rows[0];
                tenant = {
                    ...t,
                    id: t.id_tenant,
                    name: t.tenant_name,
                    initials: t.initials
                };
            }
        }

        return {
            ...user,
            firstName: user.first_name,
            lastName: user.last_name,
            signature: user.signature,
            tenant,
            user_roles: Array.from(userRolesMap.values()),
            user_microservices: microservices.rows.map(m => ({ microservice: m })),
            user_sites: sites.rows.map(s => ({
                ...s,
                id: s.id_site,
                name: s.site_name,
                site: s
            }))
        };
    }

    async findAll(where = {}) {
        const client = await pool.connect();
        try {
            let query = `SELECT u.* FROM users u`;
            const { id_site, ...restWhere } = where;

            if (id_site) {
                query += ` JOIN user_sites us ON u.id_user = us.id_user`;
                restWhere['us.id_site'] = id_site;
            }

            const { sql, values } = this._buildWhereClause(restWhere, id_site ? 'u' : null);

            if (sql) {
                query += ` WHERE ${sql}`;
            }

            const result = await client.query(query, values);

            const users = [];
            for (const row of result.rows) {
                users.push(await this._getUserWithRelations(client, row));
            }
            return users;
        } finally {
            client.release();
        }
    }

    _buildWhereClause(where, tableAlias = null) {
        const conditions = [];
        const values = [];

        const getColumn = (key) => {
            if (key.includes('.')) return key; // already prefixed
            return tableAlias ? `${tableAlias}."${key}"` : `"${key}"`;
        };

        if (where.OR) {
            const orConditions = where.OR.map(cond => {
                const key = Object.keys(cond)[0];
                const value = cond[key];
                const column = getColumn(key);
                if (typeof value === 'object' && value.contains) {
                    values.push(`%${value.contains}%`);
                    return `${column} ILIKE $${values.length}`;
                } else {
                    values.push(value);
                    return `${column} = $${values.length}`;
                }
            });
            conditions.push(`(${orConditions.join(' OR ')})`);
        }

        // Handle other fields
        Object.keys(where).forEach(key => {
            if (key === 'OR') return;
            const value = where[key];
            const column = getColumn(key);
            if (typeof value === 'object' && value.contains) {
                values.push(`%${value.contains}%`);
                conditions.push(`${column} ILIKE $${values.length}`);
            } else if (value !== undefined) {
                values.push(value);
                conditions.push(`${column} = $${values.length}`);
            }
        });

        return {
            sql: conditions.length > 0 ? conditions.join(' AND ') : null,
            values
        };
    }

    async create(data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const {
                roles = [],
                microservices = [],
                sites = [],
                ...userData
            } = data;

            const fields = Object.keys(userData);
            const values = Object.values(userData);

            const placeholders = fields.map((_, i) => `$${i + 1}`);

            const insertUser = await client.query(
                `INSERT INTO users (${fields.join(',')})
         VALUES (${placeholders.join(',')})
         RETURNING *`,
                values
            );

            const user = insertUser.rows[0];

            for (const roleId of roles) {
                await client.query(
                    `INSERT INTO user_roles (id_user, id_role)
           VALUES ($1, $2)`,
                    [user.id_user, roleId]
                );
            }

            for (const msId of microservices) {
                await client.query(
                    `INSERT INTO user_microservices (id_user, id_microservice)
           VALUES ($1, $2)`,
                    [user.id_user, msId]
                );
            }

            for (const siteId of sites) {
                await client.query(
                    `INSERT INTO user_sites (id_user, id_site)
           VALUES ($1, $2)`,
                    [user.id_user, siteId]
                );
            }

            await client.query('COMMIT');
            return user;

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async update(id, data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const {
                roles,
                microservices,
                sites,
                ...userData
            } = data;

            if (Object.keys(userData).length) {
                const fields = Object.keys(userData);
                const values = Object.values(userData);

                const setClause = fields.map(
                    (field, i) => `${field} = $${i + 1}`
                );

                await client.query(
                    `UPDATE users SET ${setClause.join(',')}
           WHERE id_user = $${fields.length + 1}`,
                    [...values, id]
                );
            }

            if (roles) {
                await client.query(`DELETE FROM user_roles WHERE id_user = $1`, [id]);
                for (const roleId of roles) {
                    await client.query(
                        `INSERT INTO user_roles (id_user, id_role)
             VALUES ($1, $2)`,
                        [id, roleId]
                    );
                }
            }

            if (microservices) {
                await client.query(`DELETE FROM user_microservices WHERE id_user = $1`, [id]);
                for (const msId of microservices) {
                    await client.query(
                        `INSERT INTO user_microservices (id_user, id_microservice)
             VALUES ($1, $2)`,
                        [id, msId]
                    );
                }
            }

            if (sites) {
                await client.query(`DELETE FROM user_sites WHERE id_user = $1`, [id]);
                for (const siteId of sites) {
                    await client.query(
                        `INSERT INTO user_sites (id_user, id_site)
             VALUES ($1, $2)`,
                        [id, siteId]
                    );
                }
            }

            await client.query('COMMIT');
            return this.findById(id);

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async delete(id) {
        await pool.query(
            `DELETE FROM users WHERE id_user = $1`,
            [id]
        );
    }
}

export default new UserRepository();