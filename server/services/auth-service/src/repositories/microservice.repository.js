// src/repositories/MicroserviceRepository.js
import pool from '../config/db.js';

class MicroserviceRepository {

    async findAll(skip = 0, take = 10, where = {}) {
        let query = `SELECT * FROM microservices`;
        const { sql, values } = this._buildWhereClause(where);

        if (sql) {
            query += ` WHERE ${sql}`;
        }

        query += ` ORDER BY microservice_name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows;
    }

    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM microservices`;
        const { sql, values } = this._buildWhereClause(where);

        if (sql) {
            query += ` WHERE ${sql}`;
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].count);
    }

    _buildWhereClause(where) {
        const conditions = [];
        const values = [];

        if (where.OR) {
            const orConditions = where.OR.map(cond => {
                let key = Object.keys(cond)[0];
                const value = cond[key];

                // Map 'name' filter to 'microservice_name' column
                if (key === 'name') key = 'microservice_name';

                if (typeof value === 'object' && value.contains) {
                    values.push(`%${value.contains}%`);
                    return `"${key}" ILIKE $${values.length}`;
                } else {
                    values.push(value);
                    return `"${key}" = $${values.length}`;
                }
            });
            conditions.push(`(${orConditions.join(' OR ')})`);
        }

        Object.keys(where).forEach(key => {
            if (key === 'OR') return;
            let dbKey = key === 'name' ? 'microservice_name' : key;
            const value = where[key];
            if (typeof value === 'object' && value.contains) {
                values.push(`%${value.contains}%`);
                conditions.push(`"${dbKey}" ILIKE $${values.length}`);
            } else if (value !== undefined) {
                values.push(value);
                conditions.push(`"${dbKey}" = $${values.length}`);
            }
        });

        return {
            sql: conditions.length > 0 ? conditions.join(' AND ') : null,
            values
        };
    }

    async findByCode(code) {
        const result = await pool.query(
            `SELECT * FROM microservices WHERE code = $1`,
            [code]
        );
        return result.rows[0] || null;
    }

    async findByName(name) {
        const result = await pool.query(
            `SELECT * FROM microservices WHERE microservice_name = $1`,
            [name]
        );
        return result.rows[0] || null;
    }

    async create(data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map((_, i) => `$${i + 1}`);

        const result = await pool.query(
            `INSERT INTO microservices (${fields.join(',')})
       VALUES (${placeholders.join(',')})
       RETURNING *`,
            values
        );

        return result.rows[0];
    }

    async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);

        const setClause = fields.map(
            (field, i) => `${field} = $${i + 1}`
        );

        const result = await pool.query(
            `UPDATE microservices
       SET ${setClause.join(',')}
       WHERE id_microservice = $${fields.length + 1}
       RETURNING *`,
            [...values, id]
        );

        return result.rows[0];
    }

    async delete(id) {
        await pool.query(
            `DELETE FROM microservices WHERE id_microservice = $1`,
            [id]
        );
    }
}

export default new MicroserviceRepository();