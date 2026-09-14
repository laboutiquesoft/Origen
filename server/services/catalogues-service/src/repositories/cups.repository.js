import pool from '../config/db.js';
import Cups from '../entities/cups.js';
import CupsResolution from '../entities/cupsResolution.js';

class CupsRepository {

    // Función auxiliar para construir la consulta SELECT con JOIN para la resolución
    _buildSelectQuery(includeResolution = false) {
        let query = `SELECT c.*`;
        if (includeResolution) {
            query += `, 
                        cr.id_resolution AS cr_id_resolution,
                        cr.resolution_number AS cr_resolution_number,
                        cr.publication_date AS cr_publication_date,
                        cr.effective_date AS cr_effective_date,
                        cr.end_date AS cr_end_date,
                        cr.status AS cr_status,
                        cr.created_at AS cr_created_at,
                        cr.updated_at AS cr_updated_at,
                        (cv.id_resolution IS NOT NULL) AS cr_is_current`;
        }
        query += ` FROM cups c`;
        if (includeResolution) {
            query += ` LEFT JOIN cups_resolutions cr ON c.id_resolution = cr.id_resolution`;
            query += ` LEFT JOIN current_cups_version cv ON cr.id_resolution = cv.id_resolution`;
        }
        return query;
    }

    // Función auxiliar para mapear filas a entidades Cups, incluyendo CupsResolution si es necesario
    _mapRowToCups(row, includeResolution = false) {
        const resolution = includeResolution && row.cr_id_resolution
            ? {
                id_resolution: row.cr_id_resolution,
                resolution_number: row.cr_resolution_number,
                publication_date: row.cr_publication_date,
                effective_date: row.cr_effective_date,
                end_date: row.cr_end_date,
                status: row.cr_status,
                is_current: row.cr_is_current,
                created_at: row.cr_created_at,
                updated_at: row.cr_updated_at
            }
            : null;

        return new Cups({
            id_cups: row.id_cups,
            cups_code: row.cups_code,
            cups_description: row.cups_description,
            cups_observation: row.cups_observation,
            status: row.status,
            id_resolution: row.id_resolution,
            created_at: row.created_at,
            updated_at: row.updated_at,
            resolution: resolution
        });
    }

    /**
     * Crea un nuevo CUPS en la base de datos.
     * @param {object} data - Datos del CUPS (cups_code, cups_description, cups_observation, status, id_resolution).
     * @returns {Promise<Cups>} El CUPS creado.
     */
    async create(data) {
        const { cups_code, cups_description, cups_observation, status, id_resolution } = data;
        const result = await pool.query(
            `INSERT INTO cups (cups_code, cups_description, cups_observation, status, id_resolution)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [cups_code, cups_description, cups_observation, status, id_resolution]
        );
        return result.rows[0] ? new Cups(result.rows[0]) : null;
    }

    /**
     * Obtiene un CUPS por su ID, con opción de incluir la resolución.
     * @param {string} id - El UUID del CUPS.
     * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
     * @returns {Promise<Cups|null>} El CUPS encontrado o null.
     */
    async findById(id, includeResolution = false) {
        const query = this._buildSelectQuery(includeResolution) + ` WHERE c.id_cups = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ? this._mapRowToCups(result.rows[0], includeResolution) : null;
    }

    /**
     * Obtiene un CUPS por su código y la ID de la resolución a la que pertenece, con opción de incluir la resolución.
     * @param {string} cupsCode - El código CUPS.
     * @param {string} idResolution - El UUID de la resolución.
     * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
     * @returns {Promise<Cups|null>} El CUPS encontrado o null.
     */
    async findByCodeAndResolution(cupsCode, idResolution, includeResolution = false) {
        const query = this._buildSelectQuery(includeResolution) + ` WHERE c.cups_code = $1 AND c.id_resolution = $2`;
        const result = await pool.query(query, [cupsCode, idResolution]);
        return result.rows[0] ? this._mapRowToCups(result.rows[0], includeResolution) : null;
    }

    /**
    * Obtiene CUPS por su código (puede haber múltiples en diferentes resoluciones), con opción de incluir la resolución.
    * @param {string} cupsCode - El código CUPS.
    * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
    * @returns {Promise<Cups[]>} Un array de CUPS que coinciden con el código.
    */
    async findByCode(cupsCode, includeResolution = false) {
        const query = this._buildSelectQuery(includeResolution) + ` WHERE c.cups_code = $1`;
        const result = await pool.query(query, [cupsCode]);
        return result.rows.map(row => this._mapRowToCups(row, includeResolution));
    }


    /**
     * Obtiene todos los CUPS con opciones de paginación, filtrado y opción de incluir la resolución.
     * @param {number} [skip=0] - Offset.
     * @param {number} [take=10] - Limit.
     * @param {object} [where={}] - Condiciones de filtro (ej: { status: true, id_resolution: 'uuid' }).
     * @param {string} [orderBy='cups_code'] - Columna para ordenar.
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento.
     * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
     * @returns {Promise<Cups[]>} Un array de objetos Cups.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'cups_code', orderDirection = 'ASC', includeResolution = false) {
        let query = this._buildSelectQuery(includeResolution);
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`c.${key} = $${paramIndex}`);
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const validOrderByColumns = ['id_cups', 'cups_code', 'cups_description', 'status', 'id_resolution', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? `c.${orderBy}` : `c.cups_code`;
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => this._mapRowToCups(row, includeResolution));
    }

    /**
     * Cuenta el número total de CUPS que cumplen con una condición.
     * @param {object} [where={}] - Condiciones de filtro.
     * @returns {Promise<number>} El número total de CUPS.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM cups c`;
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`c.${key} = $${paramIndex}`);
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].count, 10);
    }

    /**
     * Actualiza un CUPS existente por su ID.
     * @param {string} id - ID del CUPS a actualizar.
     * @param {object} data - Campos a actualizar.
     * @returns {Promise<Cups|null>} El CUPS actualizado o null.
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
            `UPDATE cups
             SET ${setClause.join(',')}
             WHERE id_cups = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );
        return result.rows[0] ? new Cups(result.rows[0]) : null;
    }

    /**
     * Elimina un CUPS por su ID.
     * @param {string} id - El UUID del CUPS a eliminar.
     * @returns {Promise<boolean>} True si fue eliminado, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM cups WHERE id_cups = $1 RETURNING id_cups`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de un CUPS.
     * @param {string} id - El UUID del CUPS.
     * @param {boolean} newStatus - El nuevo estado.
     * @returns {Promise<Cups|null>} El CUPS actualizado o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE cups
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_cups = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Cups(result.rows[0]) : null;
    }

    /**
     * Elimina todos los CUPS asociados a una resolución específica.
     * Esto es útil para "limpiar" si se carga una resolución errónea,
     * pero solo debe usarse con precaución y si ningún otro registro depende de ellos.
     * @param {string} idResolution - El UUID de la resolución.
     * @returns {Promise<boolean>} True si se eliminaron CUPS, false si no.
     */
    async deleteAllByResolution(idResolution) {
        const result = await pool.query(
            `DELETE FROM cups WHERE id_resolution = $1 RETURNING id_cups`,
            [idResolution]
        );
        return result.rows.length > 0;
    }
}

export default new CupsRepository();