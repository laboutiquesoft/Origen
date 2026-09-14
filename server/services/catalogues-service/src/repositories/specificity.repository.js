import pool from '../config/db.js';
import Specificity from '../entities/specificity.js';

class SpecificityRepository {

    /**
     * Crea una nueva especificidad en la base de datos.
     * @param {object} data - Objeto con los datos de la especificidad (specificity_name, status).
     * @returns {Promise<Specificity>} La especificidad creada.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        const { specificity_name, status } = data;

        const result = await pool.query(
            `INSERT INTO specificities (specificity_name, status)
             VALUES ($1, $2)
             RETURNING *`,
            [specificity_name, status]
        );

        return result.rows[0] ? new Specificity(result.rows[0]) : null;
    }

    /**
     * Obtiene una especificidad por su ID.
     * @param {string} id - El UUID de la especificidad.
     * @returns {Promise<Specificity|null>} La especificidad encontrada o null si no existe.
     */
    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM specificities WHERE id_specificity = $1`,
            [id]
        );
        return result.rows[0] ? new Specificity(result.rows[0]) : null;
    }

    /**
     * Obtiene una especificidad por su nombre.
     * @param {string} name - El nombre de la especificidad.
     * @returns {Promise<Specificity|null>} La especificidad encontrada o null si no existe.
     */
    async findByName(name) {
        const result = await pool.query(
            `SELECT * FROM specificities WHERE specificity_name = $1`,
            [name]
        );
        return result.rows[0] ? new Specificity(result.rows[0]) : null;
    }

    /**
     * Obtiene todas las especificidades con opciones de paginación y filtrado.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='specificity_name'] - Columna para ordenar los resultados (default alfabético).
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @returns {Promise<Specificity[]>} Un array de objetos Specificity.
     */
    async findAll(skip = 0, take = 10, where = {}, orderBy = 'specificity_name', orderDirection = 'ASC') {
        let query = `SELECT * FROM specificities`;
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

        const validOrderByColumns = ['id_specificity', 'specificity_name', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'specificity_name';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new Specificity(row));
    }

    /**
     * Cuenta el número total de especificidades que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de especificidades.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM specificities`;
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
     * Actualiza una especificidad existente por su ID.
     * @param {string} id - El UUID de la especificidad a actualizar.
     * @param {object} data - Objeto con los campos a actualizar.
     * @returns {Promise<Specificity|null>} La especificidad actualizada o null si no se encontró.
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
            `UPDATE specificities
             SET ${setClause.join(',')}
             WHERE id_specificity = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new Specificity(result.rows[0]) : null;
    }

    /**
     * Elimina una especificidad por su ID.
     * @param {string} id - El UUID de la especificidad a eliminar.
     * @returns {Promise<boolean>} True si la especificidad fue eliminada, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM specificities WHERE id_specificity = $1 RETURNING id_specificity`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de una especificidad.
     * @param {string} id - El UUID de la especificidad.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<Specificity|null>} La especificidad actualizada o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE specificities
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_specificity = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Specificity(result.rows[0]) : null;
    }
}

export default new SpecificityRepository();