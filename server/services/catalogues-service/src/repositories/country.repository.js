// src/repositories/CountryRepository.js

import pool from '../config/db.js';
import Country from '../entities/country.js';

class CountryRepository {

    /**
     * Crea un nuevo país en la base de datos.
     * @param {object} data - Objeto con los datos del país (country_code, country_name, demonym, flag, status).
     * @returns {Promise<Country>} El país creado.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        const { country_code, country_name, demonym, flag, status } = data;

        const result = await pool.query(
            `INSERT INTO countries (country_code, country_name, demonym, flag, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [country_code, country_name, demonym, flag, status]
        );

        return result.rows[0] ? new Country(result.rows[0]) : null;
    }

    /**
     * Obtiene un país por su ID.
     * @param {string} id - El UUID del país.
     * @returns {Promise<Country|null>} El país encontrado o null si no existe.
     */
    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM countries WHERE id_country = $1`,
            [id]
        );
        return result.rows[0] ? new Country(result.rows[0]) : null;
    }

    /**
     * Obtiene un país por su código ISO.
     * @param {string} code - El código ISO (ej. 'CO', 'US').
     * @returns {Promise<Country|null>} El país encontrado o null si no existe.
     */
    async findByCode(code) {
        const result = await pool.query(
            `SELECT * FROM countries WHERE country_code = $1`,
            [code]
        );
        return result.rows[0] ? new Country(result.rows[0]) : null;
    }

    /**
     * Obtiene un país por su nombre único.
     * @param {string} name - El nombre del país.
     * @returns {Promise<Country|null>} El país encontrado o null si no existe.
     */
    async findByName(name) {
        const result = await pool.query(
            `SELECT * FROM countries WHERE country_name = $1`,
            [name]
        );
        return result.rows[0] ? new Country(result.rows[0]) : null;
    }

    /**
     * Obtiene todos los países con opciones de paginación y filtrado.
     * El ordenamiento especial se maneja en la capa de servicio.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='country_name'] - Columna para ordenar los resultados (default alfabético).
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @returns {Promise<Country[]>} Un array de objetos Country.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'country_name', orderDirection = 'ASC') {
        let query = `SELECT * FROM countries`;
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

        const validOrderByColumns = ['id_country', 'country_code', 'country_name', 'demonym', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'country_name';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new Country(row));
    }

    /**
     * Cuenta el número total de países que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de países.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM countries`;
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
     * Actualiza un país existente por su ID.
     * @param {string} id - El UUID del país a actualizar.
     * @param {object} data - Objeto con los campos a actualizar.
     * @returns {Promise<Country|null>} El país actualizado o null si no se encontró.
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
            `UPDATE countries
             SET ${setClause.join(',')}
             WHERE id_country = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new Country(result.rows[0]) : null;
    }

    /**
     * Elimina un país por su ID.
     * @param {string} id - El UUID del país a eliminar.
     * @returns {Promise<boolean>} True si el país fue eliminado, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM countries WHERE id_country = $1 RETURNING id_country`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de un país.
     * @param {string} id - El UUID del país.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<Country|null>} El país actualizado o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE countries
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_country = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Country(result.rows[0]) : null;
    }
}

export default new CountryRepository();