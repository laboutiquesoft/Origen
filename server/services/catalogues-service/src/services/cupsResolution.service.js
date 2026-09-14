import CupsResolutionRepository from '../repositories/cupsResolution.repository.js';
import CurrentCupsVersionRepository from '../repositories/currentCupsVersion.repository.js'; // Necesario para la lógica de actualización
import CupsRepository from '../repositories/cups.repository.js'; // Necesario para gestionar CUPS asociados
import CupsResolution from '../entities/cupsResolution.js';
import { AppError } from '@origen/common';

class CupsResolutionService {

    /**
     * Crea una nueva resolución CUPS.
     * @param {object} resolutionData - Datos de la resolución.
     * @returns {Promise<CupsResolution>} La nueva resolución creada.
     * @throws {AppError} Si el número de resolución ya existe.
     */
    async createResolution(resolutionData) {
        if (!resolutionData.resolution_number) {
            throw new AppError('Resolution number is required', 400);
        }
        if (!resolutionData.publication_date) {
            throw new AppError('Publication date is required', 400);
        }
        if (!resolutionData.effective_date) {
            throw new AppError('Effective date is required', 400);
        }

        resolutionData.resolution_number = resolutionData.resolution_number.trim();

        const existingResolution = await CupsResolutionRepository.findByNumber(resolutionData.resolution_number);
        if (existingResolution) {
            throw new AppError(`Resolution with number '${resolutionData.resolution_number}' already exists`, 409);
        }

        const newResolution = new CupsResolution(resolutionData);
        const created = await CupsResolutionRepository.create(newResolution);
        return created;
    }

    /**
     * Obtiene una resolución CUPS por su ID.
     * @param {string} id - ID de la resolución.
     * @returns {Promise<CupsResolution>} La resolución encontrada.
     * @throws {AppError} Si la resolución no se encuentra.
     */
    async getResolutionById(id) {
        const resolution = await CupsResolutionRepository.findById(id);
        if (!resolution) {
            throw new AppError('CUPS Resolution not found', 404);
        }
        return resolution;
    }

    /**
     * Obtiene todas las resoluciones CUPS con paginación y filtrado.
     * @param {number} skip - Offset.
     * @param {number} take - Limit.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @returns {Promise<{data: CupsResolution[], total: number}>} Lista de resoluciones y el total.
     */
    async getResolutions(skip, take, where, orderBy, orderDirection) {
        const data = await CupsResolutionRepository.findAll(skip, take, where, orderBy, orderDirection);
        const total = await CupsResolutionRepository.count(where);
        return { data, total };
    }

    /**
     * Actualiza una resolución CUPS existente.
     * @param {string} id - ID de la resolución a actualizar.
     * @param {object} updateData - Datos para actualizar.
     * @returns {Promise<CupsResolution>} La resolución actualizada.
     * @throws {AppError} Si la resolución no se encuentra o el número ya existe para otra resolución.
     */
    async updateResolution(id, updateData) {
        const existingResolution = await CupsResolutionRepository.findById(id);
        if (!existingResolution) {
            throw new AppError('CUPS Resolution not found', 404);
        }

        if (updateData.resolution_number && updateData.resolution_number.trim() !== existingResolution.resolution_number) {
            updateData.resolution_number = updateData.resolution_number.trim();
            const resolutionWithNewNumber = await CupsResolutionRepository.findByNumber(updateData.resolution_number);
            if (resolutionWithNewNumber && resolutionWithNewNumber.id_resolution !== id) {
                throw new AppError(`Resolution with number '${updateData.resolution_number}' already exists`, 409);
            }
        }

        const updatedResolutionInstance = new CupsResolution({ ...existingResolution, ...updateData });

        const updated = await CupsResolutionRepository.update(id, {
            resolution_number: updatedResolutionInstance.resolution_number,
            publication_date: updatedResolutionInstance.publication_date,
            effective_date: updatedResolutionInstance.effective_date,
            end_date: updatedResolutionInstance.end_date,
            status: updatedResolutionInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update CUPS Resolution', 500);
        }
        return updated;
    }

    /**
     * Elimina una resolución CUPS por su ID.
     * Esto también eliminará todos los CUPS asociados a ella.
     * ¡Debe usarse con extrema precaución!
     * @param {string} id - ID de la resolución a eliminar.
     * @returns {Promise<boolean>} True si la resolución fue eliminada.
     * @throws {AppError} Si la resolución no se encuentra o si es la versión actual.
     */
    async deleteResolution(id) {
        const existingResolution = await CupsResolutionRepository.findById(id);
        if (!existingResolution) {
            throw new AppError('CUPS Resolution not found', 404);
        }

        const currentVersion = await CurrentCupsVersionRepository.getCurrent();
        if (currentVersion && currentVersion.id_resolution === id) {
            throw new AppError('Cannot delete the currently active CUPS Resolution. Please set another as current first.', 400);
        }

        // Primero, eliminar los CUPS asociados a esta resolución
        await CupsRepository.deleteAllByResolution(id);

        const deleted = await CupsResolutionRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete CUPS Resolution', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de una resolución CUPS (activo/inactivo).
     * @param {string} id - ID de la resolución.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<CupsResolution>} La resolución con el estado actualizado.
     * @throws {AppError} Si la resolución no se encuentra o si es la versión actual y se intenta inactivar.
     */
    async changeResolutionStatus(id, status) {
        const existingResolution = await CupsResolutionRepository.findById(id);
        if (!existingResolution) {
            throw new AppError('CUPS Resolution not found', 404);
        }

        if (status === false) { // Si se intenta inactivar
            const currentVersion = await CurrentCupsVersionRepository.getCurrent();
            if (currentVersion && currentVersion.id_resolution === id) {
                throw new AppError('Cannot deactivate the currently active CUPS Resolution. Please set another as current first.', 400);
            }
        }
        
        const updated = await CupsResolutionRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change CUPS Resolution status', 500);
        }
        return updated;
    }
}

export default new CupsResolutionService();