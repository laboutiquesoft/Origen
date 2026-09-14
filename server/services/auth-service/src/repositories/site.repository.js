import pool from '../config/db.js';

class SiteRepository {
    async create(data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map((_, i) => `$${i + 1}`);

        const result = await pool.query(
            `INSERT INTO sites (${fields.join(', ')}) 
             VALUES (${placeholders.join(', ')}) 
             RETURNING *`,
            values
        );
        return result.rows[0];
    }

    async findAll(skip = 0, limit = 10, where = {}) {
        let query = `
            SELECT s.*, t.tenant_name 
            FROM sites s
            LEFT JOIN tenants t ON s.id_tenant = t.id_tenant
        `;

        const { sql, values } = this._buildWhereClause(where, 's');

        if (sql) {
            query += ` WHERE ${sql}`;
        }

        query += ` ORDER BY s.site_name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => ({
            ...row,
            tenant: row.tenant_name ? { name: row.tenant_name } : null
        }));
    }

    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM sites s`;
        const { sql, values } = this._buildWhereClause(where, 's');

        if (sql) {
            query += ` WHERE ${sql}`;
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].count);
    }

    async findById(id) {
        const result = await pool.query(`
            SELECT s.*, t.tenant_name, t.slug as tenant_slug
            FROM sites s
            LEFT JOIN tenants t ON s.id_tenant = t.id_tenant
            WHERE s.id_site = $1
        `, [id]);

        if (!result.rows.length) return null;

        const row = result.rows[0];
        return {
            ...row,
            tenant: row.tenant_name ? { name: row.tenant_name, slug: row.tenant_slug } : null
        };
    }

    async findByName(siteName, tenantId) {
        const result = await pool.query(
            `SELECT * FROM sites WHERE site_name = $1 AND id_tenant = $2`,
            [siteName, tenantId]
        );
        return result.rows[0] || null;
    }

    async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

        const result = await pool.query(
            `UPDATE sites SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
             WHERE id_site = $${fields.length + 1} 
             RETURNING *`,
            [...values, id]
        );
        return result.rows[0];
    }

    async delete(id) {
        await pool.query('DELETE FROM sites WHERE id_site = $1', [id]);
        return true;
    }

    _buildWhereClause(where, tableAlias = '') {
        const conditions = [];
        const values = [];
        const prefix = tableAlias ? `${tableAlias}.` : '';

        if (where.OR) {
            const orConditions = where.OR.map(cond => {
                const key = Object.keys(cond)[0];
                const value = cond[key];
                if (typeof value === 'object' && value.contains) {
                    values.push(`%${value.contains}%`);
                    return `${prefix}"${key}" ILIKE $${values.length}`;
                } else {
                    values.push(value);
                    return `${prefix}"${key}" = $${values.length}`;
                }
            });
            conditions.push(`(${orConditions.join(' OR ')})`);
        }

        Object.keys(where).forEach(key => {
            if (key === 'OR') return;
            const value = where[key];
            if (value === undefined) return;

            if (typeof value === 'object' && value.contains) {
                values.push(`%${value.contains}%`);
                conditions.push(`${prefix}"${key}" ILIKE $${values.length}`);
            } else {
                values.push(value);
                conditions.push(`${prefix}"${key}" = $${values.length}`);
            }
        });

        return {
            sql: conditions.length > 0 ? conditions.join(' AND ') : null,
            values
        };
    }
}

export default new SiteRepository();
