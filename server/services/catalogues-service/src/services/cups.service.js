import CupsRepository from '../repositories/cups.repository.js';
import CupsResolutionRepository from '../repositories/cupsResolution.repository.js'; // Para validar id_resolution
import Cups from '../entities/cups.js';
import { AppError } from '@origen/common';

class CupsService {

    /**
     * Crea un nuevo CUPS.
     * @param {object} cupsData - Datos del CUPS (cups_code, cups_description, cups_observation, status, id_resolution).
     * @returns {Promise<Cups>} El nuevo CUPS creado.
     * @throws {AppError} Si el código CUPS ya existe para la misma resolución o si la resolución no existe.
     */
    async createCups(cupsData) {
        if (!cupsData.cups_code) throw new AppError('CUPS code is required', 400);
        if (!cupsData.cups_description) throw new AppError('CUPS description is required', 400);
        if (!cupsData.id_resolution) throw new AppError('Resolution ID is required', 400);

        cupsData.cups_code = cupsData.cups_code.trim().toUpperCase();
        cupsData.cups_description = cupsData.cups_description.trim();

        // Validar que la resolución exista
        const resolution = await CupsResolutionRepository.findById(cupsData.id_resolution);
        if (!resolution) {
            throw new AppError(`CUPS Resolution with ID '${cupsData.id_resolution}' not found`, 404);
        }

        // Validar que el cups_code sea único para esta resolución
        const existingCups = await CupsRepository.findByCodeAndResolution(cupsData.cups_code, cupsData.id_resolution);
        if (existingCups) {
            throw new AppError(`CUPS code '${cupsData.cups_code}' already exists for resolution '${resolution.resolution_number}'`, 409);
        }

        const newCups = new Cups(cupsData);
        const created = await CupsRepository.create(newCups);
        return created;
    }

    /**
     * Obtiene un CUPS por su ID.
     * @param {string} id - ID del CUPS.
     * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
     * @returns {Promise<Cups>} El CUPS encontrado.
     * @throws {AppError} Si el CUPS no se encuentra.
     */
    async getCupsById(id, includeResolution = false) {
        const cups = await CupsRepository.findById(id, includeResolution);
        if (!cups) {
            throw new AppError('CUPS not found', 404);
        }
        return cups;
    }

    /**
     * Obtiene CUPS por su código (sin importar la resolución).
     * @param {string} cupsCode - El código CUPS.
     * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
     * @returns {Promise<Cups[]>} Un array de CUPS que coinciden.
     */
    async getCupsByCode(cupsCode, includeResolution = false) {
        if (!cupsCode) throw new AppError('CUPS code is required', 400);
        const cups = await CupsRepository.findByCode(cupsCode.trim().toUpperCase(), includeResolution);
        return cups;
    }

    /**
     * Obtiene todos los CUPS con paginación, filtrado y opción de incluir la resolución.
     * @param {number} skip - Offset.
     * @param {number} take - Limit.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
     * @returns {Promise<{data: Cups[], total: number}>} Lista de CUPS y el total.
     */
    async getCups(skip, take, where, orderBy, orderDirection, includeResolution = false) {
        const data = await CupsRepository.findAll(skip, take, where, orderBy, orderDirection, includeResolution);
        const total = await CupsRepository.count(where);
        return { data, total };
    }

    /**
     * Actualiza un CUPS existente.
     * @param {string} id - ID del CUPS a actualizar.
     * @param {object} updateData - Datos para actualizar el CUPS.
     * @returns {Promise<Cups>} El CUPS actualizado.
     * @throws {AppError} Si el CUPS no se encuentra, el código ya existe para la misma resolución.
     */
    async updateCups(id, updateData) {
        const existingCups = await CupsRepository.findById(id);
        if (!existingCups) {
            throw new AppError('CUPS not found', 404);
        }

        // Validar cups_code si se intenta cambiar
        if (updateData.cups_code && updateData.cups_code.trim().toUpperCase() !== existingCups.cups_code) {
            updateData.cups_code = updateData.cups_code.trim().toUpperCase();
            const cupsWithNewCode = await CupsRepository.findByCodeAndResolution(updateData.cups_code, existingCups.id_resolution);
            if (cupsWithNewCode && cupsWithNewCode.id_cups !== id) {
                throw new AppError(`CUPS code '${updateData.cups_code}' already exists for resolution '${existingCups.id_resolution}'`, 409);
            }
        }

        // No permitir cambiar id_resolution a través de este método
        if (updateData.id_resolution && updateData.id_resolution !== existingCups.id_resolution) {
            throw new AppError('Changing the resolution of an existing CUPS is not allowed. Create a new CUPS for the new resolution instead.', 400);
        }

        const updatedCupsInstance = new Cups({ ...existingCups, ...updateData });

        const updated = await CupsRepository.update(id, {
            cups_code: updatedCupsInstance.cups_code,
            cups_description: updatedCupsInstance.cups_description,
            cups_observation: updatedCupsInstance.cups_observation,
            status: updatedCupsInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update CUPS', 500);
        }
        return updated;
    }

    /**
     * Elimina un CUPS por su ID.
     * @param {string} id - ID del CUPS a eliminar.
     * @returns {Promise<boolean>} True si el CUPS fue eliminado.
     * @throws {AppError} Si el CUPS no se encuentra.
     */
    async deleteCups(id) {
        const existingCups = await CupsRepository.findById(id);
        if (!existingCups) {
            throw new AppError('CUPS not found', 404);
        }

        const deleted = await CupsRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete CUPS', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de un CUPS (activo/inactivo).
     * @param {string} id - ID del CUPS.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<Cups>} El CUPS con el estado actualizado.
     * @throws {AppError} Si el CUPS no se encuentra.
     */
    async changeCupsStatus(id, status) {
        const existingCups = await CupsRepository.findById(id);
        if (!existingCups) {
            throw new AppError('CUPS not found', 404);
        }
        const updated = await CupsRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change CUPS status', 500);
        }
        return updated;
    }
}

export default new CupsService();