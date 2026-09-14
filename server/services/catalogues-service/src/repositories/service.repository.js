import pool from '../config/db.js';
import Service from '../entities/service.js';
import ServiceGroup from '../entities/serviceGroup.js'; // Necesitamos la entidad ServiceGroup para construir el objeto incluido

class ServiceRepository {

    // Función auxiliar para construir la consulta SELECT con JOIN
    _buildSelectQuery(includeGroup = false) {
        let query = `SELECT s.*`;
        if (includeGroup) {
            query += `, 
                        sg.id_service_group AS sg_id_service_group,
                        sg.code AS sg_code,
                        sg.service_group_name AS sg_service_group_name,
                        sg.description AS sg_description,
                        sg.status AS sg_status,
                        sg.created_at AS sg_created_at,
                        sg.updated_at AS sg_updated_at`;
        }
        query += ` FROM services s`;
        if (includeGroup) {
            query += ` LEFT JOIN service_groups sg ON s.id_service_group = sg.id_service_group`;
        }
        return query;
    }

    // Función auxiliar para mapear filas a entidades Service, incluyendo ServiceGroup si es necesario
    _mapRowToService(row, includeGroup = false) {
        const serviceGroup = includeGroup && row.sg_id_service_group
            ? new ServiceGroup({
                id_service_group: row.sg_id_service_group,
                code: row.sg_code,
                service_group_name: row.sg_service_group_name,
                description: row.sg_description,
                status: row.sg_status,
                created_at: row.sg_created_at,
                updated_at: row.sg_updated_at
            })
            : null;

        return new Service({
            id_service: row.id_service,
            code: row.code,
            service_name: row.service_name,
            description: row.description,
            status: row.status,
            id_service_group: row.id_service_group,
            created_at: row.created_at,
            updated_at: row.updated_at,
            service_group: serviceGroup // Asigna el objeto ServiceGroup
        });
    }

    /**
     * Crea un nuevo servicio en la base de datos.
     * @param {object} data - Objeto con los datos del servicio (code, service_name, description, id_service_group, status).
     * @returns {Promise<Service>} El servicio creado.
     * @throws {Error} Si ocurre un error durante la creación.
     */
    async create(data) {
        const { code, service_name, description, id_service_group, status } = data;

        const result = await pool.query(
            `INSERT INTO services (code, service_name, description, id_service_group, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [code, service_name, description, id_service_group, status]
        );

        return result.rows[0] ? new Service(result.rows[0]) : null;
    }

    /**
     * Obtiene un servicio por su ID, con opción de incluir el grupo.
     * @param {string} id - El UUID del servicio.
     * @param {boolean} [includeGroup=false] - Si es true, incluye los datos del ServiceGroup.
     * @returns {Promise<Service|null>} El servicio encontrado o null si no existe.
     */
    async findById(id, includeGroup = false) {
        const query = this._buildSelectQuery(includeGroup) + ` WHERE s.id_service = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] ? this._mapRowToService(result.rows[0], includeGroup) : null;
    }

    /**
     * Obtiene un servicio por su código, con opción de incluir el grupo.
     * @param {string} code - El código del servicio.
     * @param {boolean} [includeGroup=false] - Si es true, incluye los datos del ServiceGroup.
     * @returns {Promise<Service|null>} El servicio encontrado o null si no existe.
     */
    async findByCode(code, includeGroup = false) {
        const query = this._buildSelectQuery(includeGroup) + ` WHERE s.code = $1`;
        const result = await pool.query(query, [code]);
        return result.rows[0] ? this._mapRowToService(result.rows[0], includeGroup) : null;
    }

    /**
     * Obtiene un servicio por su nombre, con opción de incluir el grupo.
     * @param {string} name - El nombre del servicio.
     * @param {boolean} [includeGroup=false] - Si es true, incluye los datos del ServiceGroup.
     * @returns {Promise<Service|null>} El servicio encontrado o null si no existe.
     */
    async findByName(name, includeGroup = false) {
        const query = this._buildSelectQuery(includeGroup) + ` WHERE s.service_name = $1`;
        const result = await pool.query(query, [name]);
        return result.rows[0] ? this._mapRowToService(result.rows[0], includeGroup) : null;
    }

    /**
     * Obtiene todos los servicios con opciones de paginación, filtrado y opción de incluir el grupo.
     * @param {number} [skip=0] - Número de registros a omitir (offset).
     * @param {number} [take=10] - Número de registros a tomar (limit).
     * @param {object} [where={}] - Objeto con condiciones de filtro (ej: { status: true }).
     * @param {string} [orderBy='service_name'] - Columna para ordenar los resultados (default alfabético).
     * @param {string} [orderDirection='ASC'] - Dirección de ordenamiento ('ASC' o 'DESC').
     * @param {boolean} [includeGroup=false] - Si es true, incluye los datos del ServiceGroup.
     * @returns {Promise<Service[]>} Un array de objetos Service.
     */
    async findAll(skip = 0, take = 50000, where = {}, orderBy = 'service_name', orderDirection = 'ASC', includeGroup = false) {
        let query = this._buildSelectQuery(includeGroup);
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        // Construir condiciones WHERE para la tabla de servicios
        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`s.${key} = $${paramIndex}`); // Asegúrate de prefijar la tabla 's'
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const validOrderByColumns = ['id_service', 'code', 'service_name', 'description', 'status', 'created_at', 'updated_at', 'id_service_group'];
        const finalOrderBy = validOrderByColumns.includes(orderBy) ? `s.${orderBy}` : `s.service_name`; // Prefijar con 's.'
        const finalOrderDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

        query += ` ORDER BY ${finalOrderBy} ${finalOrderDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(take, skip);

        const result = await pool.query(query, values);
        return result.rows.map(row => this._mapRowToService(row, includeGroup));
    }

    /**
     * Cuenta el número total de servicios que cumplen con una condición.
     * @param {object} [where={}] - Objeto con condiciones de filtro.
     * @returns {Promise<number>} El número total de servicios.
     */
    async count(where = {}) {
        let query = `SELECT COUNT(*) FROM services s`; // Alias 's' para consistencia
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(where).forEach((key) => {
            values.push(where[key]);
            conditions.push(`s.${key} = $${paramIndex}`); // Prefijar la tabla 's'
            paramIndex++;
        });

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].count, 10);
    }

    /**
     * Actualiza un servicio existente por su ID.
     * @param {string} id - El UUID del servicio a actualizar.
     * @param {object} data - Objeto con los campos a actualizar.
     * @returns {Promise<Service|null>} El servicio actualizado o null si no se encontró.
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
            `UPDATE services
             SET ${setClause.join(',')}
             WHERE id_service = $${paramIndex}
             RETURNING *`,
            [...values, id]
        );

        return result.rows[0] ? new Service(result.rows[0]) : null;
    }

    /**
     * Elimina un servicio por su ID.
     * @param {string} id - El UUID del servicio a eliminar.
     * @returns {Promise<boolean>} True si el servicio fue eliminado, false en caso contrario.
     */
    async delete(id) {
        const result = await pool.query(
            `DELETE FROM services WHERE id_service = $1 RETURNING id_service`,
            [id]
        );
        return result.rows.length > 0;
    }

    /**
     * Cambia el estado (status) de un servicio.
     * @param {string} id - El UUID del servicio.
     * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
     * @returns {Promise<Service|null>} El servicio actualizado o null.
     */
    async changeStatus(id, newStatus) {
        const result = await pool.query(
            `UPDATE services
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_service = $2
             RETURNING *`,
            [newStatus, id]
        );
        return result.rows[0] ? new Service(result.rows[0]) : null;
    }
}

export default new ServiceRepository();