// src/repositories/PermissionRepository.js
import pool from '../config/db.js';

class PermissionRepository {

    async create(data) {
        const mappedData = { ...data };
        if (mappedData.resource) {
            mappedData.permission_resource = mappedData.resource;
            delete mappedData.resource;
        }
        if (mappedData.action) {
            mappedData.permission_action = mappedData.action;
            delete mappedData.action;
        }

        const fields = Object.keys(mappedData);
        const values = Object.values(mappedData);
        const placeholders = fields.map((_, i) => `$${i + 1}`);

        const result = await pool.query(
            `INSERT INTO permissions (${fields.join(',')})
             VALUES (${placeholders.join(',')})
             RETURNING id_permission, permission_resource as resource, permission_action as action, description`,
            values
        );

        return result.rows[0];
    }

    async findAll() {
        const result = await pool.query(
            `SELECT id_permission, permission_resource as resource, permission_action as action, description 
             FROM permissions 
             ORDER BY permission_resource ASC`
        );
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query(
            `SELECT id_permission, permission_resource as resource, permission_action as action, description 
             FROM permissions 
             WHERE id_permission = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async update(id, data) {
        const mappedData = { ...data };
        if (mappedData.resource) {
            mappedData.permission_resource = mappedData.resource;
            delete mappedData.resource;
        }
        if (mappedData.action) {
            mappedData.permission_action = mappedData.action;
            delete mappedData.action;
        }

        const fields = Object.keys(mappedData);
        const values = Object.values(mappedData);

        const setClause = fields.map(
            (field, i) => `${field} = $${i + 1}`
        );

        const result = await pool.query(
            `UPDATE permissions
             SET ${setClause.join(',')}
             WHERE id_permission = $${fields.length + 1}
             RETURNING id_permission, permission_resource as resource, permission_action as action, description`,
            [...values, id]
        );

        return result.rows[0];
    }

    async delete(id) {
        await pool.query(
            `DELETE FROM permissions WHERE id_permission = $1`,
            [id]
        );
    }
}

export default new PermissionRepository();