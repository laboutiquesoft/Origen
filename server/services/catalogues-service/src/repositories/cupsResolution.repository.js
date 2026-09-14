import pool from '../config/db.js';
import CupsResolution from '../entities/cupsResolution.js';

class CupsResolutionRepository {

    /**
     * Crea una nueva resolución CUPS en la base de datos.
     * @param {object} data - Datos de la resolución (resolution_number, publication_date, effective_date, end_date, status).
     * @returns {Promise<CupsResolution>} La resolución creada.
     */
    async create(data) {
        const { resolution_number, publication_date, effective_date, end_date, status } = data;
        const result = await pool.query(
            `INSERT INTO cups_resolutions (resolution_number, publication_date, effective_date, end_date, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [resolution_number, publication_date, effective_date, end_date, status]
        );
        return result.rows[0] ? new CupsResolution(result.rows[0]) : null;
    }

    /**
     * Obtiene una resolución CUPS por su ID.
     * @param {string} id - El UUID de la resolución.
     * @returns {Promise<CupsResolution|null>} La resolución encontrada o null.
     */
    async findById(id) {
        const result = await pool.query(`SELECT * FROM cups_resolutions WHERE id_resolution = $1`, [id]);
        return result.rows[0] ? new CupsResolution(result.rows[0]) : null;
    }

    /**
     * Obtiene una resolución CUPS por su número.
     * @param {string} resolutionNumber - El número de la resolución.
     * @returns {Promise<CupsResolution|null>} La resolución encontrada o null.
     */
    async findByNumber(resolutionNumber) {
        const result = await pool.query(`SELECT * FROM cups_resolutions WHERE resolution_number = $1`, [resolutionNumber]);
        return result.rows[0] ? new CupsResolution(result.rows[0]) : null;
    }

    /**
     * Obtiene todas las resoluciones con paginación y filtrado.
     * @param {number} [skip=0] - Offset.
     * @param {number} [take=10] - Limit.
     * @param {object} [where={}] - Condiciones de filtro.
     * @param {string} [orderBy='effective_date'] - Columna para ordenar.
     * @param {string} [orderDirection='DESC'] - Dirección de ordenamiento.
     * @returns {Promise<CupsResolution[]>} Un array de resoluciones.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'effective_date', orderDirection = 'DESC') {
        let query = `SELECT * FROM cups_resolutions`;
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

        const validOrderByColumns = ['id_resolution', 'resolution_number', 'publication_date', 'effective_date', 'end_date', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'effective_date';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'DESC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new CupsResolution(row));
    }

    /**
     * Cuenta el número total de resoluciones.
     * @param {object} [where={}] - Condiciones de filtro.
     * @returns {Promise<number>} El número total de resoluciones.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM cups_resolutions`;
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
     * Actualiza una resolución CUPS existente.
     * @param {string} id - ID de la resolución a actualizar.
     * @param {object} data - Campos a actualizar.
     * @returns {Promise<CupsResolution|null>} La resolución actualizada o null.
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
            `UPDATE cups_resolutions
             SET ${setClause.join(',')}
             WHERE id_resolution = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );
        return result.rows[0] ? new CupsResolution(result.rows[0]) : null;
    }

    /**
     * Elimina una resolución por su ID.
     * @param {string} id - El UUID de la resolución a eliminar.
     * @returns {Promise<boolean>} True si fue eliminada, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM cups_resolutions WHERE id_resolution = $1 RETURNING id_resolution`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de una resolución.
     * @param {string} id - El UUID de la resolución.
     * @param {boolean} newStatus - El nuevo estado.
     * @returns {Promise<CupsResolution|null>} La resolución actualizada o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE cups_resolutions
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_resolution = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new CupsResolution(result.rows[0]) : null;
    }
}

export default new CupsResolutionRepository();