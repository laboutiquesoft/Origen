import pool from '../config/db.js';
import CurrentCupsVersion from '../entities/currentCupsVersion.js';
import CupsResolution from '../entities/cupsResolution.js';

class CurrentCupsVersionRepository {

    // Función auxiliar para construir la consulta SELECT con JOIN para la resolución
    _buildSelectQuery(includeResolution = false) {
        let query = `SELECT ccv.*`;
        if (includeResolution) {
            query += `, 
                        cr.id_resolution AS cr_id_resolution,
                        cr.resolution_number AS cr_resolution_number,
                        cr.publication_date AS cr_publication_date,
                        cr.effective_date AS cr_effective_date,
                        cr.end_date AS cr_end_date,
                        cr.status AS cr_status,
                        cr.created_at AS cr_created_at,
                        cr.updated_at AS cr_updated_at`;
        }
        query += ` FROM current_cups_version ccv`;
        if (includeResolution) {
            query += ` LEFT JOIN cups_resolutions cr ON ccv.id_resolution = cr.id_resolution`;
        }
        return query;
    }

    // Función auxiliar para mapear filas a entidades CurrentCupsVersion, incluyendo CupsResolution si es necesario
    _mapRowToCurrentCupsVersion(row, includeResolution = false) {
        const resolution = includeResolution && row.cr_id_resolution
            ? new CupsResolution({
                id_resolution: row.cr_id_resolution,
                resolution_number: row.cr_resolution_number,
                publication_date: row.cr_publication_date,
                effective_date: row.cr_effective_date,
                end_date: row.cr_end_date,
                status: row.cr_status,
                created_at: row.cr_created_at,
                updated_at: row.cr_updated_at
            })
            : null;

        return new CurrentCupsVersion({
            id: row.id,
            id_resolution: row.id_resolution,
            updated_at: row.updated_at,
            resolution: resolution
        });
    }

    /**
     * Obtiene la versión actual de los CUPS.
     * Siempre debería haber solo una entrada.
     * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
     * @returns {Promise<CurrentCupsVersion|null>} La versión actual o null si no se ha configurado.
     */
    async getCurrent(includeResolution = false) {
        const query = this._buildSelectQuery(includeResolution) + ` WHERE ccv.id = 1`; // Asumimos id=1
        const result = await pool.query(query);
        return result.rows[0] ? this._mapRowToCurrentCupsVersion(result.rows[0], includeResolution) : null;
    }

    /**
     * Establece o actualiza la resolución CUPS actual.
     * Solo debe haber una entrada en la tabla current_cups_version (id=1).
     * @param {string} idResolution - El UUID de la nueva resolución actual.
     * @returns {Promise<CurrentCupsVersion>} La versión actual actualizada.
     */
    async setOrUpdateCurrent(idResolution) {
        const result = await pool.query(
            `INSERT INTO current_cups_version (id, id_resolution, updated_at)
             VALUES (1, $1, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE SET id_resolution = $1, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [idResolution]
        );
        return result.rows[0] ? new CurrentCupsVersion(result.rows[0]) : null;
    }
}

export default new CurrentCupsVersionRepository();