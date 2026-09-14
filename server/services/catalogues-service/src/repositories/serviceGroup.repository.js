import pool from '../config/db.js';
import ServiceGroup from '../entities/serviceGroup.js';

class ServiceGroupRepository {

    /**
     * Crea un nuevo grupo de servicio en la base de datos.
     * @param {object} data - Objeto con los datos del grupo (code, service_group_name, description, status).
     * @returns {Promise<ServiceGroup>} El grupo de servicio creado.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        const { code, service_group_name, description, status } = data; // Usando service_group_name

        const result = await pool.query(
            `INSERT INTO service_groups (code, service_group_name, description, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [code, service_group_name, description, status]
        );

        return result.rows[0] ? new ServiceGroup(result.rows[0]) : null;
    }

    /**
     * Obtiene un grupo de servicio por su ID.
     * @param {string} id - El UUID del grupo de servicio.
     * @returns {Promise<ServiceGroup|null>} El grupo de servicio encontrado o null si no existe.
     */
    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM service_groups WHERE id_service_group = $1`,
            [id]
        );
        return result.rows[0] ? new ServiceGroup(result.rows[0]) : null;
    }

    /**
     * Obtiene un grupo de servicio por su código.
     * @param {string} code - El código del grupo.
     * @returns {Promise<ServiceGroup|null>} El grupo de servicio encontrado o null si no existe.
     */
    async findByCode(code) {
        const result = await pool.query(
            `SELECT * FROM service_groups WHERE code = $1`,
            [code]
        );
        return result.rows[0] ? new ServiceGroup(result.rows[0]) : null;
    }

    /**
     * Obtiene un grupo de servicio por su nombre.
     * @param {string} name - El nombre del grupo (service_group_name).
     * @returns {Promise<ServiceGroup|null>} El grupo de servicio encontrado o null si no existe.
     */
    async findByName(name) { // Usando service_group_name
        const result = await pool.query(
            `SELECT * FROM service_groups WHERE service_group_name = $1`,
            [name]
        );
        return result.rows[0] ? new ServiceGroup(result.rows[0]) : null;
    }

    /**
     * Obtiene todos los grupos de servicio con opciones de paginación y filtrado.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='service_group_name'] - Columna para ordenar los resultados (default alfabético).
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @returns {Promise<ServiceGroup[]>} Un array de objetos ServiceGroup.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'service_group_name', orderDirection = 'ASC') {
        let query = `SELECT * FROM service_groups`;
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`${key} = $${paramIndex}`);
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const validOrderByColumns = ['id_service_group', 'code', 'service_group_name', 'description', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'service_group_name';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new ServiceGroup(row));
    }

    /**
     * Cuenta el número total de grupos de servicio que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de grupos de servicio.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM service_groups`;
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`${key} = $${paramIndex}`);
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].count, 10);
    }

    /**
     * Actualiza un grupo de servicio existente por su ID.
     * @param {string} id - El UUID del grupo de servicio a actualizar.
     * @param {object} data - Objeto con los campos a actualizar.
     * @returns {Promise<ServiceGroup|null>} El grupo de servicio actualizado o null si no se encontró.
     */
    async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        let paramIndex = 1;

        if (!data.updated_at) {
            fields.push('updated_at');
            values.push(new Date());
        }

        const setClause = fields.map((field) => `${field} = $${paramIndex++}`);

        const result = await pool.query(
            `UPDATE service_groups
             SET ${setClause.join(',')}
             WHERE id_service_group = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new ServiceGroup(result.rows[0]) : null;
    }

    /**
     * Elimina un grupo de servicio por su ID.
     * @param {string} id - El UUID del grupo de servicio a eliminar.
     * @returns {Promise<boolean>} True si el grupo de servicio fue eliminado, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM service_groups WHERE id_service_group = $1 RETURNING id_service_group`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de un grupo de servicio.
     * @param {string} id - El UUID del grupo de servicio.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<ServiceGroup|null>} El grupo de servicio actualizado o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE service_groups
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_service_group = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new ServiceGroup(result.rows[0]) : null;
    }
}

export default new ServiceGroupRepository();