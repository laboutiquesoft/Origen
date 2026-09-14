import pool from '../config/db.js';
import Eps from '../entities/eps.js';

class EpsRepository {

    /**
     * Crea una nueva EPS en la base de datos.
     * @param {object} data - Objeto con los datos de la EPS (eps_name).
     * @returns {Promise<Eps>} La EPS creada.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        const { eps_name } = data;

        const result = await pool.query(
            `INSERT INTO eps (eps_name)
             VALUES ($1)
             RETURNING *`,
            [eps_name]
        );

        return result.rows[0] ? new Eps(result.rows[0]) : null;
    }

    /**
     * Obtiene una EPS por su ID.
     * @param {string} id - El UUID de la EPS.
     * @returns {Promise<Eps|null>} La EPS encontrada o null si no existe.
     */
    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM eps WHERE id_eps = $1`,
            [id]
        );
        return result.rows[0] ? new Eps(result.rows[0]) : null;
    }

    /**
     * Obtiene una EPS por su nombre.
     * @param {string} name - El nombre de la EPS.
     * @returns {Promise<Eps|null>} La EPS encontrada o null si no existe.
     */
    async findByName(name) {
        const result = await pool.query(
            `SELECT * FROM eps WHERE eps_name = $1`,
            [name]
        );
        return result.rows[0] ? new Eps(result.rows[0]) : null;
    }

    /**
     * Obtiene todas las EPS con opciones de paginación y filtrado.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='eps_name'] - Columna para ordenar los resultados (default alfabético).
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @returns {Promise<Eps[]>} Un array de objetos Eps.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'eps_name', orderDirection = 'ASC') {
        let query = `SELECT * FROM eps`;
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

        const validOrderByColumns = ['id_eps', 'eps_name', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'eps_name';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new Eps(row));
    }

    /**
     * Cuenta el número total de EPS que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de EPS.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM eps`;
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
     * Actualiza una EPS existente por su ID.
     * @param {string} id - El UUID de la EPS a actualizar.
     * @param {object} data - Objeto con los campos a actualizar.
     * @returns {Promise<Eps|null>} La EPS actualizada o null si no se encontró.
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
            `UPDATE eps
             SET ${setClause.join(',')}
             WHERE id_eps = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new Eps(result.rows[0]) : null;
    }

    /**
     * Elimina una EPS por su ID.
     * @param {string} id - El UUID de la EPS a eliminar.
     * @returns {Promise<boolean>} True si la EPS fue eliminada, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM eps WHERE id_eps = $1 RETURNING id_eps`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de una EPS.
     * @param {string} id - El UUID de la EPS.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<Eps|null>} La EPS actualizada o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE eps
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_eps = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Eps(result.rows[0]) : null;
    }
}

export default new EpsRepository();