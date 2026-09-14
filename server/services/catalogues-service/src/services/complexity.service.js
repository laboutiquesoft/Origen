// src/services/ComplexityService.js

import ComplexityRepository from '../repositories/complexity.repository.js';
import Complexity from '../entities/complexity.js';
import { AppError } from '@origen/common';

class ComplexityService {

    /**
     * Crea una nueva complejidad.
     * @param {object} complexityData - Datos de la complejidad (complexity_name).
     * @returns {Promise<Complexity>} La nueva complejidad creada.
     * @throws {AppError} Si el nombre de la complejidad ya existe.
     */
    async createComplexity(complexityData) {
        if (!complexityData.complexity_name) {
            throw new AppError('Complexity name is required', 400);
        }

        complexityData.complexity_name = complexityData.complexity_name.trim();

        const existingComplexity = await ComplexityRepository.findByName(complexityData.complexity_name);
        if (existingComplexity) {
            throw new AppError(`Complexity with name '${complexityData.complexity_name}' already exists`, 409);
        }

        const newComplexity = new Complexity(complexityData);
        const created = await ComplexityRepository.create(newComplexity);
        return created;
    }

    /**
     * Obtiene una complejidad por su ID.
     * @param {string} id - El UUID de la complejidad.
     * @returns {Promise<Complexity>} La complejidad encontrada.
     * @throws {AppError} Si la complejidad no se encuentra.
     */
    async getComplexityById(id) {
        const complexity = await ComplexityRepository.findById(id);
        if (!complexity) {
            throw new AppError('Complexity not found', 404);
        }
        return complexity;
    }

    /**
     * Obtiene todas las complejidades con paginación y filtrado.
     * @param {number} skip - Número de registros a omitir.
     * @param {number} take - Número de registros a tomar.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @returns {Promise<{data: Complexity[], total: number}>} Lista de complejidades y el total.
     */
    async getComplexities(skip, take, where, orderBy, orderDirection) {
        const complexities = await ComplexityRepository.findAll(skip, take, where, orderBy, orderDirection);
        const total = await ComplexityRepository.count(where);
        return { data: complexities, total };
    }

    /**
     * Actualiza una complejidad existente.
     * @param {string} id - El UUID de la complejidad a actualizar.
     * @param {object} updateData - Datos para actualizar la complejidad.
     * @returns {Promise<Complexity>} La complejidad actualizada.
     * @throws {AppError} Si la complejidad no se encuentra o el nombre ya existe para otra complejidad.
     */
    async updateComplexity(id, updateData) {
        const existingComplexity = await ComplexityRepository.findById(id);
        if (!existingComplexity) {
            throw new AppError('Complexity not found', 404);
        }

        if (updateData.complexity_name && updateData.complexity_name !== existingComplexity.complexity_name) {
            updateData.complexity_name = updateData.complexity_name.trim();
            const complexityWithNewName = await ComplexityRepository.findByName(updateData.complexity_name);
            if (complexityWithNewName && complexityWithNewName.id_complexity !== id) {
                throw new AppError(`Complexity with name '${updateData.complexity_name}' already exists`, 409);
            }
        }

        const updatedComplexityInstance = new Complexity({ ...existingComplexity, ...updateData });

        const updated = await ComplexityRepository.update(id, {
            complexity_name: updatedComplexityInstance.complexity_name,
            status: updatedComplexityInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update complexity', 500);
        }
        return updated;
    }

    /**
     * Elimina una complejidad por su ID.
     * @param {string} id - El UUID de la complejidad a eliminar.
     * @returns {Promise<boolean>} True si la complejidad fue eliminada.
     * @throws {AppError} Si la complejidad no se encuentra.
     */
    async deleteComplexity(id) {
        const existingComplexity = await ComplexityRepository.findById(id);
        if (!existingComplexity) {
            throw new AppError('Complexity not found', 404);
        }

        const deleted = await ComplexityRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete complexity', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de una complejidad (activo/inactivo).
     * @param {string} id - El UUID de la complejidad.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<Complexity>} La complejidad con el estado actualizado.
     * @throws {AppError} Si la complejidad no se encuentra.
     */
    async changeComplexityStatus(id, status) {
        const existingComplexity = await ComplexityRepository.findById(id);
        if (!existingComplexity) {
            throw new AppError('Complexity not found', 404);
        }
        const updated = await ComplexityRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change complexity status', 500);
        }
        return updated;
    }
}

export default new ComplexityService();