import ModalityRepository from '../repositories/modality.repository.js';
import Modality from '../entities/modality.js';
import { AppError } from '@origen/common';

class ModalityService {

    /**
     * Crea una nueva modalidad.
     * @param {object} modalityData - Datos de la modalidad (modality_name, status).
     * @returns {Promise<Modality>} La nueva modalidad creada.
     * @throws {AppError} Si el nombre de la modalidad ya existe.
     */
    async createModality(modalityData) {
        if (!modalityData.modality_name) throw new AppError('Modality name is required', 400);

        modalityData.modality_name = modalityData.modality_name.trim();

        const existingByName = await ModalityRepository.findByName(modalityData.modality_name);
        if (existingByName) {
            throw new AppError(`Modality with name '${modalityData.modality_name}' already exists`, 409);
        }

        const newModality = new Modality(modalityData); // Usar la entidad Modality para validación
        const created = await ModalityRepository.create(newModality);
        return created;
    }

    /**
     * Obtiene una modalidad por su ID.
     * @param {string} id - El UUID de la modalidad.
     * @returns {Promise<Modality>} La modalidad encontrada.
     * @throws {AppError} Si la modalidad no se encuentra.
     */
    async getModalityById(id) {
        const modality = await ModalityRepository.findById(id);
        if (!modality) {
            throw new AppError('Modality not found', 404);
        }
        return modality;
    }

    /**
     * Obtiene todas las modalidades con paginación y filtrado.
     * @param {number} skip - Número de registros a omitir.
     * @param {number} take - Número de registros a tomar.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @returns {Promise<{data: Modality[], total: number}>} Lista de modalidades y el total.
     */
    async getModalities(skip, take, where, orderBy, orderDirection) {
        const data = await ModalityRepository.findAll(skip, take, where, orderBy, orderDirection);
        const total = await ModalityRepository.count(where);
        return { data, total };
    }

    /**
     * Actualiza una modalidad existente.
     * @param {string} id - El UUID de la modalidad a actualizar.
     * @param {object} updateData - Datos para actualizar la modalidad.
     * @returns {Promise<Modality>} La modalidad actualizada.
     * @throws {AppError} Si la modalidad no se encuentra o el nombre ya existe para otra modalidad.
     */
    async updateModality(id, updateData) {
        const existingModality = await ModalityRepository.findById(id);
        if (!existingModality) {
            throw new AppError('Modality not found', 404);
        }

        if (updateData.modality_name && updateData.modality_name.trim() !== existingModality.modality_name) {
            updateData.modality_name = updateData.modality_name.trim();
            const modalityWithNewName = await ModalityRepository.findByName(updateData.modality_name);
            if (modalityWithNewName && modalityWithNewName.id_modality !== id) {
                throw new AppError(`Modality with name '${updateData.modality_name}' already exists`, 409);
            }
        }

        // Crear una instancia de Modality para aplicar las validaciones del constructor si es necesario
        // Aunque el constructor en este caso solo valida el nombre, es un buen patrón.
        const updatedModalityInstance = new Modality({ ...existingModality, ...updateData });

        const updated = await ModalityRepository.update(id, {
            modality_name: updatedModalityInstance.modality_name,
            status: updatedModalityInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update modality', 500);
        }
        return updated;
    }

    /**
     * Elimina una modalidad por su ID.
     * @param {string} id - El UUID de la modalidad a eliminar.
     * @returns {Promise<boolean>} True si la modalidad fue eliminada.
     * @throws {AppError} Si la modalidad no se encuentra.
     */
    async deleteModality(id) {
        const existingModality = await ModalityRepository.findById(id);
        if (!existingModality) {
            throw new AppError('Modality not found', 404);
        }

        const deleted = await ModalityRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete modality', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de una modalidad (activo/inactivo).
     * @param {string} id - El UUID de la modalidad.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<Modality>} La modalidad con el estado actualizado.
     * @throws {AppError} Si la modalidad no se encuentra.
     */
    async changeModalityStatus(id, status) {
        const existingModality = await ModalityRepository.findById(id);
        if (!existingModality) {
            throw new AppError('Modality not found', 404);
        }
        const updated = await ModalityRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change modality status', 500);
        }
        return updated;
    }
}

export default new ModalityService();