import pool from '../config/db.js';
import MedicalProcedure from '../entities/medicalProcedures.js';
import Cups from '../entities/cups.js'; // Necesitamos la entidad Cups para construir el objeto incluido

class MedicalProcedureRepository {

    // Función auxiliar para construir la consulta SELECT con JOIN para Cups
    _buildSelectQuery(includeCups = false) {
        let query = `SELECT mp.*`;
        if (includeCups) {
            query += `, 
                        c.id_cups AS c_id_cups,
                        c.cups_code AS c_cups_code,
                        c.cups_description AS c_cups_description,
                        c.cups_observation AS c_cups_observation,
                        c.status AS c_status_cups,
                        c.id_resolution AS c_id_resolution,
                        c.created_at AS c_created_at,
                        c.updated_at AS c_updated_at`;
        }

        query += `, 
             COALESCE(
                 (
                     SELECT json_agg(json_build_object(
                         'id_service_procedure', sp.id_service_procedure,
                         'service', json_build_object(
                             'id_service', s.id_service,
                             'service_name', s.service_name,
                             'service_group', json_build_object(
                                 'code', sg.code,
                                 'service_group_name', sg.service_group_name
                             )
                         )
                     ))
                     FROM service_procedures sp
                     JOIN services s ON sp.id_service = s.id_service
                     LEFT JOIN service_groups sg ON s.id_service_group = sg.id_service_group
                     WHERE sp.id_medical_procedure = mp.id_medical_procedure
                 ),
                 '[]'::json
             ) AS service_procedures
        `;

        query += ` FROM medical_procedures mp`;
        if (includeCups) {
            query += ` LEFT JOIN cups c ON mp.id_cups = c.id_cups`;
        }
        return query;
    }

    // Función auxiliar para mapear filas a entidades MedicalProcedure, incluyendo Cups si es necesario
    _mapRowToMedicalProcedure(row, includeCups = false) {
        const cups = includeCups && row.c_id_cups
            ? new Cups({
                id_cups: row.c_id_cups,
                cups_code: row.c_cups_code,
                cups_description: row.c_cups_description,
                cups_observation: row.c_cups_observation,
                status: row.c_status_cups, // Cuidado con la colisión de nombres de 'status'
                id_resolution: row.c_id_resolution,
                created_at: row.c_created_at,
                updated_at: row.c_updated_at
            })
            : null;

        return new MedicalProcedure({
            id_medical_procedure: row.id_medical_procedure,
            medical_procedure_name: row.medical_procedure_name,
            description: row.description,
            id_cups: row.id_cups,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            cups: cups, // Asigna el objeto Cups
            service_procedures: row.service_procedures // JSON array from DB
        });
    }

    /**
     * Crea un nuevo procedimiento médico en la base de datos.
     * @param {object} data - Datos del procedimiento (medical_procedure_name, description, id_cups, status).
     * @returns {Promise<MedicalProcedure>} El procedimiento creado.
     */
    async create(data) {
        const { medical_procedure_name, description, id_cups, status } = data;

        const result = await pool.query(
            `INSERT INTO medical_procedures (medical_procedure_name, description, id_cups, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [medical_procedure_name, description, id_cups, status]
        );

        return result.rows[0] ? new MedicalProcedure(result.rows[0]) : null;
    }

    /**
     * Obtiene un procedimiento médico por su ID, con opción de incluir el CUPS.
     * @param {string} id - El UUID del procedimiento médico.
     * @param {boolean} [includeCups=false] - Si es true, incluye los datos del CUPS.
     * @returns {Promise<MedicalProcedure|null>} El procedimiento encontrado o null.
     */
    async findById(id, includeCups = false) {
        const query = this._buildSelectQuery(includeCups) + ` WHERE mp.id_medical_procedure = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ? this._mapRowToMedicalProcedure(result.rows[0], includeCups) : null;
    }

    /**
     * Obtiene todos los procedimientos médicos con opciones de paginación, filtrado y opción de incluir el CUPS.
     * @param {number} [skip=0] - Offset.
     * @param {number} [take=10] - Limit.
     * @param {object} [where={}] - Condiciones de filtro (ej: { status: true, id_cups: 'uuid' }).
     * @param {string} [orderBy='created_at'] - Columna para ordenar.
     * @param {string} [orderDirection='DESC'] - Dirección de ordenamiento.
     * @param {boolean} [includeCups=false] - Si es true, incluye los datos del CUPS.
     * @returns {Promise<MedicalProcedure[]>} Un array de objetos MedicalProcedure.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'created_at', orderDirection = 'DESC', includeCups = false) {
        let query = this._buildSelectQuery(includeCups);
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`mp.${key} = $${paramIndex}`); // Asegúrate de prefijar la tabla 'mp'
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const validOrderByColumns = ['id_medical_procedure', 'medical_procedure_name', 'description', 'id_cups', 'status', 'created_at', 'updated_at'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? `mp.${orderBy}` : `mp.created_at`;
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'DESC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => this._mapRowToMedicalProcedure(row, includeCups));
    }

    /**
     * Cuenta el número total de procedimientos médicos que cumplen con una condición.
     * @param {object} [where={}] - Condiciones de filtro.
     * @returns {Promise<number>} El número total de procedimientos.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM medical_procedures mp`;
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`mp.${key} = $${paramIndex}`);
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].count, 10);
    }

    /**
     * Actualiza un procedimiento médico existente por su ID.
     * @param {string} id - ID del procedimiento a actualizar.
     * @param {object} data - Campos a actualizar.
     * @returns {Promise<MedicalProcedure|null>} El procedimiento actualizado o null.
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
            `UPDATE medical_procedures
             SET ${setClause.join(',')}
             WHERE id_medical_procedure = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new MedicalProcedure(result.rows[0]) : null;
    }

    /**
     * Elimina un procedimiento médico por su ID.
     * @param {string} id - El UUID del procedimiento a eliminar.
     * @returns {Promise<boolean>} True si fue eliminado, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM medical_procedures WHERE id_medical_procedure = $1 RETURNING id_medical_procedure`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de un procedimiento médico.
     * @param {string} id - El UUID del procedimiento.
     * @param {boolean} newStatus - El nuevo estado.
     * @returns {Promise<MedicalProcedure|null>} El procedimiento actualizado o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE medical_procedures
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_medical_procedure = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new MedicalProcedure(result.rows[0]) : null;
    }

    /**
     * Actualiza los servicios vinculados a un procedimiento médico.
     * @param {string} id_medical_procedure
     * @param {string[]} service_ids
     */
    async updateServiceProcedures(id_medical_procedure, service_ids) {
        const client = await pool.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                'DELETE FROM service_procedures WHERE id_medical_procedure = $1',
                [id_medical_procedure]
            );

            if (service_ids && service_ids.length > 0) {
                for (const id_service of service_ids) {
                    await client.query(
                        'INSERT INTO service_procedures (id_medical_procedure, id_service) VALUES ($1, $2)',
                        [id_medical_procedure, id_service]
                    );
                }
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

export default new MedicalProcedureRepository();