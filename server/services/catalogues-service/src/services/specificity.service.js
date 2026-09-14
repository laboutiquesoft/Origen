import SpecificityRepository from '../repositories/specificity.repository.js'; 
import Specificity from '../entities/specificity.js';
import { AppError } from '@origen/common';

class SpecificityService {

    /**
     * Crea una nueva especificidad.
     * @param {object} specificityData - Datos de la especificidad (specificity_name, status).
     * @returns {Promise<Specificity>} La nueva especificidad creada.
     * @throws {AppError} Si el nombre de la especificidad ya existe.
     */
    async createSpecificity(specificityData) {
        if (!specificityData.specificity_name) {
            throw new AppError('Specificity name is required', 400);
        }

        specificityData.specificity_name = specificityData.specificity_name.trim();

        // Validar que el nombre de la especificidad sea único
        const existingByName = await SpecificityRepository.findByName(specificityData.specificity_name);
        if (existingByName) {
            throw new AppError(`Specificity with name '${specificityData.specificity_name}' already exists`, 409);
        }

        const newSpecificity = new Specificity(specificityData);
        const created = await SpecificityRepository.create(newSpecificity);
        return created;
    }

    /**
     * Obtiene una especificidad por su ID.
     * @param {string} id - El UUID de la especificidad.
     * @returns {Promise<Specificity>} La especificidad encontrada.
     * @throws {AppError} Si la especificidad no se encuentra.
     */
    async getSpecificityById(id) {
        const specificity = await SpecificityRepository.findById(id);
        if (!specificity) {
            throw new AppError('Specificity not found', 404);
        }
        return specificity;
    }

    /**
     * Obtiene todas las especificidades con paginación y filtrado.
     * @param {number} skip - Número de registros a omitir.
     * @param {number} take - Número de registros a tomar.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @returns {Promise<{data: Specificity[], total: number}>} Lista de especificidades y el total.
     */
    async getSpecificities(skip, take, where, orderBy, orderDirection) {
        const data = await SpecificityRepository.findAll(skip, take, where, orderBy, orderDirection);
        const total = await SpecificityRepository.count(where);
        return { data, total };
    }

    /**
     * Actualiza una especificidad existente.
     * @param {string} id - El UUID de la especificidad a actualizar.
     * @param {object} updateData - Datos para actualizar la especificidad.
     * @returns {Promise<Specificity>} La especificidad actualizada.
     * @throws {AppError} Si la especificidad no se encuentra o el nombre ya existe para otra especificidad.
     */
    async updateSpecificity(id, updateData) {
        const existingSpecificity = await SpecificityRepository.findById(id);
        if (!existingSpecificity) {
            throw new AppError('Specificity not found', 404);
        }

        // Validar nombre si se intenta cambiar
        if (updateData.specificity_name && updateData.specificity_name.trim() !== existingSpecificity.specificity_name) {
            updateData.specificity_name = updateData.specificity_name.trim();
            const specificityWithNewName = await SpecificityRepository.findByName(updateData.specificity_name);
            if (specificityWithNewName && specificityWithNewName.id_specificity !== id) {
                throw new AppError(`Specificity with name '${updateData.specificity_name}' already exists`, 409);
            }
        }

        const updatedSpecificityInstance = new Specificity({ ...existingSpecificity, ...updateData });

        const updated = await SpecificityRepository.update(id, {
            specificity_name: updatedSpecificityInstance.specificity_name,
            status: updatedSpecificityInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update specificity', 500);
        }
        return updated;
    }

    /**
     * Elimina una especificidad por su ID.
     * @param {string} id - El UUID de la especificidad a eliminar.
     * @returns {Promise<boolean>} True si la especificidad fue eliminada.
     * @throws {AppError} Si la especificidad no se encuentra.
     */
    async deleteSpecificity(id) {
        const existingSpecificity = await SpecificityRepository.findById(id);
        if (!existingSpecificity) {
            throw new AppError('Specificity not found', 404);
        }

        const deleted = await SpecificityRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete specificity', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de una especificidad (activo/inactivo).
     * @param {string} id - El UUID de la especificidad.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<Specificity>} La especificidad con el estado actualizado.
     * @throws {AppError} Si la especificidad no se encuentra.
     */
    async changeSpecificityStatus(id, status) {
        const existingSpecificity = await SpecificityRepository.findById(id);
        if (!existingSpecificity) {
            throw new AppError('Specificity not found', 404);
        }
        const updated = await SpecificityRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change specificity status', 500);
        }
        return updated;
    }
}

export default new SpecificityService();