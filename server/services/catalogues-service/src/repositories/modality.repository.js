import pool from '../config/db.js';
import Modality from '../entities/modality.js';

class ModalityRepository {

    /**
     * Crea una nueva modalidad en la base de datos.
     * @param {object} data - Objeto con los datos de la modalidad (modality_name, status).
     * @returns {Promise<Modality>} La modalidad creada.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        const { modality_name, status } = data;

        const result = await pool.query(
            `INSERT INTO modalities (modality_name, status)
             VALUES ($1, $2)
             RETURNING *`,
            [modality_name, status]
        );

        return result.rows[0] ? new Modality(result.rows[0]) : null;
    }

    /**
     * Obtiene una modalidad por su ID.
     * @param {string} id - El UUID de la modalidad.
     * @returns {Promise<Modality|null>} La modalidad encontrada o null si no existe.
     */
    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM modalities WHERE id_modality = $1`,
            [id]
        );
        return result.rows[0] ? new Modality(result.rows[0]) : null;
    }

    /**
     * Obtiene una modalidad por su nombre.
     * @param {string} name - El nombre de la modalidad.
     * @returns {Promise<Modality|null>} La modalidad encontrada o null si no existe.
     */
    async findByName(name) {
        const result = await pool.query(
            `SELECT * FROM modalities WHERE modality_name = $1`,
            [name]
        );
        return result.rows[0] ? new Modality(result.rows[0]) : null;
    }

    /**
     * Obtiene todas las modalidades con opciones de paginación y filtrado.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='modality_name'] - Columna para ordenar los resultados (default alfabético).
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @returns {Promise<Modality[]>} Un array de objetos Modality.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'modality_name', orderDirection = 'ASC') {
        let query = `SELECT * FROM modalities`;
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

        const validOrderByColumns = ['id_modality', 'modality_name', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'modality_name';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new Modality(row));
    }

    /**
     * Cuenta el número total de modalidades que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de modalidades.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM modalities`;
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
     * Actualiza una modalidad existente por su ID.
     * @param {string} id - El UUID de la modalidad a actualizar.
     * @param {object} data - Objeto con los campos a actualizar.
     * @returns {Promise<Modality|null>} La modalidad actualizada o null si no se encontró.
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
            `UPDATE modalities
             SET ${setClause.join(',')}
             WHERE id_modality = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new Modality(result.rows[0]) : null;
    }

    /**
     * Elimina una modalidad por su ID.
     * @param {string} id - El UUID de la modalidad a eliminar.
     * @returns {Promise<boolean>} True si la modalidad fue eliminada, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM modalities WHERE id_modality = $1 RETURNING id_modality`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de una modalidad.
     * @param {string} id - El UUID de la modalidad.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<Modality|null>} La modalidad actualizada o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE modalities
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_modality = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Modality(result.rows[0]) : null;
    }
}

export default new ModalityRepository();