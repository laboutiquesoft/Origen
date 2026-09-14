// src/repositories/AllergyRepository.js

import pool from '../config/db.js';
import Allergy from '../entities/allergy.js';

class AllergyRepository {

    /**
     * Crea una nueva alergia en la base de datos.
     * @param {object} data - Objeto con los datos de la alergia (allergy_name, description, status).
     * @returns {Promise<Allergy>} La alergia creada.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        // Asegúrate de que los campos del objeto data coincidan con las columnas de la tabla.
        // Aquí esperamos data.allergy_name, data.description, data.status
        const { allergy_name, description, status } = data;

        const result = await pool.query(
            `INSERT INTO allergies (allergy_name, description, status)
             VALUES ($1, $2, $3)
             RETURNING *`, // Retorna todas las columnas de la fila insertada
            [allergy_name, description, status]
        );

        // Opcional: Instanciar el modelo Allergy antes de retornar
        return result.rows[0] ? new Allergy(result.rows[0]) : null;
    }

    /**
     * Obtiene una alergia por su ID.
     * @param {string} id - El UUID de la alergia.
     * @returns {Promise<Allergy|null>} La alergia encontrada o null si no existe.
     */
    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM allergies WHERE id_allergy = $1`,
            [id]
        );
        return result.rows[0] ? new Allergy(result.rows[0]) : null;
    }

    /**
     * Obtiene una alergia por su nombre único.
     * @param {string} name - El nombre de la alergia.
     * @returns {Promise<Allergy|null>} La alergia encontrada o null si no existe.
     */
    async findByName(name) {
        const result = await pool.query(
            `SELECT * FROM allergies WHERE allergy_name = $1`,
            [name]
        );
        return result.rows[0] ? new Allergy(result.rows[0]) : null;
    }

    /**
     * Obtiene todas las alergias con opciones de paginación y filtrado.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='allergy_name'] - Columna para ordenar los resultados.
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @returns {Promise<Allergy[]>} Un array de objetos Allergy.
     */
    async findAll(skip = 0, take = 10, where = {}, orderBy = 'allergy_name', orderDirection = 'ASC') {
        let query = `SELECT * FROM allergies`;
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        // Construir la cláusula WHERE
        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`${key} = $${paramIndex}`);
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        // Asegurarse de que el ordenamiento sea válido para evitar inyecciones SQL
        const validOrderByColumns = ['id_allergy', 'allergy_name', 'description', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'allergy_name';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';


        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new Allergy(row));
    }

    /**
     * Cuenta el número total de alergias que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de alergias.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM allergies`;
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
     * Actualiza una alergia existente por su ID.
     * @param {string} id - El UUID de la alergia a actualizar.
     * @param {object} data - Objeto con los campos a actualizar (allergy_name, description, status).
     * @returns {Promise<Allergy|null>} La alergia actualizada o null si no se encontró.
     */
    async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        let paramIndex = 1;

        // Añadir updated_at automáticamente si no se provee
        if (!data.updated_at) {
            fields.push('updated_at');
            values.push(new Date());
        }

        const setClause = fields.map((field) => `${field} = $${paramIndex++}`);

        const result = await pool.query(
            `UPDATE allergies
             SET ${setClause.join(',')}
             WHERE id_allergy = $${paramIndex}
             RETURNING *`,
            [...values, id] // Los valores de los campos + el ID para la cláusula WHERE
        );

        return result.rows[0] ? new Allergy(result.rows[0]) : null;
    }

    /**
     * Elimina una alergia por su ID.
     * @param {string} id - El UUID de la alergia a eliminar.
     * @returns {Promise<boolean>} True si la alergia fue eliminada, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM allergies WHERE id_allergy = $1 RETURNING id_allergy`, // Retorna el ID si se eliminó
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de una alergia.
     * @param {string} id - El UUID de la alergia.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<Allergy|null>} La alergia actualizada o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE allergies
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_allergy = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Allergy(result.rows[0]) : null;
    }
}

export default new AllergyRepository();