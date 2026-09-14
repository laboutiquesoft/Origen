import pool from '../config/db.js'; // Asegúrate de que esta ruta sea correcta
import Specialty from '../entities/specialty.js'; // Asegúrate de que esta ruta sea correcta

class SpecialtyRepository {

    /**
     * Crea una nueva especialidad en la base de datos.
     * @param {object} data - Objeto con los datos de la especialidad (specialty_name, description, status).
     * @returns {Promise<Specialty>} La especialidad creada.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        const { specialty_name, description, status } = data;

        const result = await pool.query(
            `INSERT INTO specialties (specialty_name, description, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [specialty_name, description, status]
        );

        return result.rows[0] ? new Specialty(result.rows[0]) : null;
    }

    /**
     * Obtiene una especialidad por su ID.
     * @param {string} id - El UUID de la especialidad.
     * @returns {Promise<Specialty|null>} La especialidad encontrada o null si no existe.
     */
    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM specialties WHERE id_specialty = $1`,
            [id]
        );
        return result.rows[0] ? new Specialty(result.rows[0]) : null;
    }

    /**
     * Obtiene una especialidad por su nombre.
     * @param {string} name - El nombre de la especialidad.
     * @returns {Promise<Specialty|null>} La especialidad encontrada o null si no existe.
     */
    async findByName(name) {
        const result = await pool.query(
            `SELECT * FROM specialties WHERE specialty_name = $1`,
            [name]
        );
        return result.rows[0] ? new Specialty(result.rows[0]) : null;
    }

    /**
     * Obtiene todas las especialidades con opciones de paginación y filtrado.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='specialty_name'] - Columna para ordenar los resultados (default alfabético).
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @returns {Promise<Specialty[]>} Un array de objetos Specialty.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'specialty_name', orderDirection = 'ASC') {
        let query = `SELECT * FROM specialties`;
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

        const validOrderByColumns = ['id_specialty', 'specialty_name', 'description', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? orderBy : 'specialty_name';
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => new Specialty(row));
    }

    /**
     * Cuenta el número total de especialidades que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de especialidades.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM specialties`;
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
     * Actualiza una especialidad existente por su ID.
     * @param {string} id - El UUID de la especialidad a actualizar.
     * @param {object} data - Objeto con los campos a actualizar.
     * @returns {Promise<Specialty|null>} La especialidad actualizada o null si no se encontró.
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
            `UPDATE specialties
             SET ${setClause.join(',')}
             WHERE id_specialty = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new Specialty(result.rows[0]) : null;
    }

    /**
     * Elimina una especialidad por su ID.
     * @param {string} id - El UUID de la especialidad a eliminar.
     * @returns {Promise<boolean>} True si la especialidad fue eliminada, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM specialties WHERE id_specialty = $1 RETURNING id_specialty`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de una especialidad.
     * @param {string} id - El UUID de la especialidad.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<Specialty|null>} La especialidad actualizada o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE specialties
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_specialty = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Specialty(result.rows[0]) : null;
    }
}

export default new SpecialtyRepository();