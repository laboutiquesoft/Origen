// src/services/AllergyService.js

import AllergyRepository from '../repositories/allergy.repository.js';
import Allergy from '../entities/allergy.js';
import { AppError } from '@origen/common';

class AllergyService {

    /**
     * Crea una nueva alergia.
     * @param {object} allergyData - Datos de la alergia (allergy_name, description).
     * @returns {Promise<Allergy>} La nueva alergia creada.
     * @throws {AppError} Si el nombre de la alergia ya existe.
     */
    async createAllergy(allergyData) {
        // Validar que el nombre de la alergia no esté vacío
        if (!allergyData.allergy_name) {
            throw new AppError('Allergy name is required', 400);
        }

        // Convertir el nombre a un formato estandarizado (ej: capitalizar, trim)
        allergyData.allergy_name = allergyData.allergy_name.trim();

        // Verificar si ya existe una alergia con el mismo nombre
        const existingAllergy = await AllergyRepository.findByName(allergyData.allergy_name);
        if (existingAllergy) {
            throw new AppError(`Allergy with name '${allergyData.allergy_name}' already exists`, 409); // 409 Conflict
        }

        // Crear una instancia del modelo para aplicar validaciones del constructor
        const newAllergy = new Allergy(allergyData);

        // Pasar los datos validados y formateados al repositorio
        const created = await AllergyRepository.create(newAllergy);
        return created;
    }

    /**
     * Obtiene una alergia por su ID.
     * @param {string} id - El UUID de la alergia.
     * @returns {Promise<Allergy>} La alergia encontrada.
     * @throws {AppError} Si la alergia no se encuentra.
     */
    async getAllergyById(id) {
        const allergy = await AllergyRepository.findById(id);
        if (!allergy) {
            throw new AppError('Allergy not found', 404);
        }
        return allergy;
    }

    /**
     * Obtiene todas las alergias con paginación y filtrado.
     * @param {number} skip - Número de registros a omitir.
     * @param {number} take - Número de registros a tomar.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @returns {Promise<{data: Allergy[], total: number}>} Lista de alergias y el total.
     */
    async getAllergies(skip, take, where, orderBy, orderDirection) {
        const allergies = await AllergyRepository.findAll(skip, take, where, orderBy, orderDirection);
        const total = await AllergyRepository.count(where);
        return { data: allergies, total };
    }

    /**
     * Actualiza una alergia existente.
     * @param {string} id - El UUID de la alergia a actualizar.
     * @param {object} updateData - Datos para actualizar la alergia.
     * @returns {Promise<Allergy>} La alergia actualizada.
     * @throws {AppError} Si la alergia no se encuentra o el nombre ya existe para otra alergia.
     */
    async updateAllergy(id, updateData) {
        const existingAllergy = await AllergyRepository.findById(id);
        if (!existingAllergy) {
            throw new AppError('Allergy not found', 404);
        }

        // Si se intenta cambiar el nombre, validar que no haya duplicados
        if (updateData.allergy_name && updateData.allergy_name !== existingAllergy.allergy_name) {
            updateData.allergy_name = updateData.allergy_name.trim();
            const allergyWithNewName = await AllergyRepository.findByName(updateData.allergy_name);
            if (allergyWithNewName && allergyWithNewName.id_allergy !== id) {
                throw new AppError(`Allergy with name '${updateData.allergy_name}' already exists`, 409);
            }
        }

        // Actualizar la instancia del modelo para asegurar la consistencia y validaciones
        const updatedAllergyInstance = new Allergy({ ...existingAllergy, ...updateData });

        const updated = await AllergyRepository.update(id, {
            allergy_name: updatedAllergyInstance.allergy_name,
            description: updatedAllergyInstance.description,
            status: updatedAllergyInstance.status,
            // updated_at se maneja en el repositorio
        });

        if (!updated) {
            throw new AppError('Failed to update allergy', 500);
        }
        return updated;
    }

    /**
     * Elimina una alergia por su ID.
     * @param {string} id - El UUID de la alergia a eliminar.
     * @returns {Promise<boolean>} True si la alergia fue eliminada.
     * @throws {AppError} Si la alergia no se encuentra.
     */
    async deleteAllergy(id) {
        const existingAllergy = await AllergyRepository.findById(id);
        if (!existingAllergy) {
            throw new AppError('Allergy not found', 404);
        }

        // Considerar aquí si hay dependencias (ej. en patient_allergies).
        // Si hay, PostgreSQL manejará el CASCADE si está configurado,
        // o fallará si no está y hay registros dependientes.
        // Aquí asumimos que el DELETE CASCADE en patient_allergies es deseable o que no hay dependencias.

        const deleted = await AllergyRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete allergy', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de una alergia (activo/inactivo).
     * @param {string} id - El UUID de la alergia.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<Allergy>} La alergia con el estado actualizado.
     * @throws {AppError} Si la alergia no se encuentra.
     */
    async changeAllergyStatus(id, status) {
        const existingAllergy = await AllergyRepository.findById(id);
        if (!existingAllergy) {
            throw new AppError('Allergy not found', 404);
        }
        const updated = await AllergyRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change allergy status', 500);
        }
        return updated;
    }
}

export default new AllergyService();