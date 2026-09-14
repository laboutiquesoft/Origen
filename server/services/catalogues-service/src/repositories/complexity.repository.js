// src/repositories/ComplexityRepository.js

import pool from '../config/db.js';
import Complexity from '../entities/complexity.js';
class ComplexityRepository {

    /**
     * Crea una nueva complejidad en la base de datos.
     * @param {object} data - Objeto con los datos de la complejidad (complexity_name, status).
     * @returns {Promise<Complexity>} La complejidad creada.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        const { complexity_name, status } = data;

        const result = await pool.query(
            `INSERT INTO complexities (complexity_name, status)
             VALUES ($1, $2)
             RETURNING *`,
            [complexity_name, status]
        );

        return result.rows[0] ? new Complexity(result.rows[0]) : null;
    }

    /**
     * Obtiene una complejidad por su ID.
     * @param {string} id - El UUID de la complejidad.
     * @returns {Promise<Complexity|null>} La complejidad encontrada o null si no existe.
     */
    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM complexities WHERE id_complexity = $1`,
            [id]
        );
        return result.rows[0] ? new Complexity(result.rows[0]) : null;
    }

    /**
     * Obtiene una complejidad por su nombre único.
     * @param {string} name - El nombre de la complejidad.
     * @returns {Promise<Complexity|null>} La complejidad encontrada o null si no existe.
     */
    async findByName(name) {
        const result = await pool.query(
            `SELECT * FROM complexities WHERE complexity_name = $1`,
            [name]
        );
        return result.rows[0] ? new Complexity(result.rows[0]) : null;
    }

    /**
     * Obtiene todas las complejidades con opciones de paginación y filtrado.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='complexity_name'] - Columna para ordenar los resultados.
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @returns {Promise<Complexity[]>} Un array de objetos Complexity.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'complexity_name', orderDirection = 'ASC') {
        let query = `SELECT * FROM complexities`;
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

        const validOrderByColumns = ['id_complexity', 'complexity_name', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'complexity_name';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new Complexity(row));
    }

    /**
     * Cuenta el número total de complejidades que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de complejidades.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM complexities`;
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
     * Actualiza una complejidad existente por su ID.
     * @param {string} id - El UUID de la complejidad a actualizar.
     * @param {object} data - Objeto con los campos a actualizar (complexity_name, status).
     * @returns {Promise<Complexity|null>} La complejidad actualizada o null si no se encontró.
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
            `UPDATE complexities
             SET ${setClause.join(',')}
             WHERE id_complexity = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new Complexity(result.rows[0]) : null;
    }

    /**
     * Elimina una complejidad por su ID.
     * @param {string} id - El UUID de la complejidad a eliminar.
     * @returns {Promise<boolean>} True si la complejidad fue eliminada, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM complexities WHERE id_complexity = $1 RETURNING id_complexity`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de una complejidad.
     * @param {string} id - El UUID de la complejidad.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<Complexity|null>} La complejidad actualizada o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE complexities
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_complexity = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Complexity(result.rows[0]) : null;
    }
}

export default new ComplexityRepository();