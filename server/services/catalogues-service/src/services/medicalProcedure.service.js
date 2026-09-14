import MedicalProcedureRepository from '../repositories/medicalProcedure.repository.js';
import CupsRepository from '../repositories/cups.repository.js'; // Para validar id_cups
import CurrentCupsVersionService from './currentCupsVersion.service.js'; // Para obtener la versión actual de CUPS para nuevos registros
import MedicalProcedure from '../entities/medicalProcedures.js';
import { AppError } from '@origen/common';

class MedicalProcedureService {

    /**
     * Crea un nuevo procedimiento médico.
     * @param {object} procedureData - Datos del procedimiento (medical_procedure_name, description, id_cups, status).
     * @returns {Promise<MedicalProcedure>} El nuevo procedimiento creado.
     * @throws {AppError} Si el CUPS referenciado no existe.
     */
    async createMedicalProcedure(procedureData) {
        if (!procedureData.medical_procedure_name) {
            throw new AppError('Medical procedure name is required', 400);
        }
        if (!procedureData.id_cups) {
            throw new AppError('CUPS ID is required for a medical procedure', 400);
        }

        procedureData.medical_procedure_name = procedureData.medical_procedure_name.trim();

        // Validar que el id_cups exista
        const existingCups = await CupsRepository.findById(procedureData.id_cups);
        if (!existingCups) {
            throw new AppError(`CUPS with ID '${procedureData.id_cups}' not found`, 404);
        }
        // Opcional: Podrías querer validar que el CUPS esté activo (status = true) para nuevos registros
        // if (!existingCups.status) {
        //     throw new AppError(`CUPS with ID '${procedureData.id_cups}' is not active`, 400);
        // }

        const newProcedure = new MedicalProcedure(procedureData);
        const created = await MedicalProcedureRepository.create(newProcedure);

        if (procedureData.service_ids && procedureData.service_ids.length > 0) {
            await MedicalProcedureRepository.updateServiceProcedures(created.id_medical_procedure, procedureData.service_ids);
        }

        // Return with related data (includeCups)
        return await MedicalProcedureRepository.findById(created.id_medical_procedure, true);
    }

    /**
     * Obtiene un procedimiento médico por su ID.
     * @param {string} id - El UUID del procedimiento médico.
     * @param {boolean} [includeCups=false] - Si es true, incluye los datos del CUPS.
     * @returns {Promise<MedicalProcedure>} El procedimiento encontrado.
     * @throws {AppError} Si el procedimiento no se encuentra.
     */
    async getMedicalProcedureById(id, includeCups = false) {
        const procedure = await MedicalProcedureRepository.findById(id, includeCups);
        if (!procedure) {
            throw new AppError('Medical Procedure not found', 404);
        }
        return procedure;
    }

    /**
     * Obtiene todos los procedimientos médicos con paginación, filtrado y opción de incluir el CUPS.
     * @param {number} skip - Offset.
     * @param {number} take - Limit.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @param {boolean} [includeCups=false] - Si es true, incluye los datos del CUPS.
     * @returns {Promise<{data: MedicalProcedure[], total: number}>} Lista de procedimientos y el total.
     */
    async getMedicalProcedures(skip, take, where, orderBy, orderDirection, includeCups = false) {
        const data = await MedicalProcedureRepository.findAll(skip, take, where, orderBy, orderDirection, includeCups);
        const total = await MedicalProcedureRepository.count(where);
        return { data, total };
    }

    /**
     * Actualiza un procedimiento médico existente.
     * @param {string} id - ID del procedimiento a actualizar.
     * @param {object} updateData - Datos para actualizar.
     * @returns {Promise<MedicalProcedure>} El procedimiento actualizado.
     * @throws {AppError} Si el procedimiento no se encuentra o el CUPS referenciado no existe.
     */
    async updateMedicalProcedure(id, updateData) {
        const existingProcedure = await MedicalProcedureRepository.findById(id);
        if (!existingProcedure) {
            throw new AppError('Medical Procedure not found', 404);
        }

        // Si se intenta cambiar el id_cups, validar que el nuevo CUPS exista
        if (updateData.id_cups && updateData.id_cups !== existingProcedure.id_cups) {
            const newCups = await CupsRepository.findById(updateData.id_cups);
            if (!newCups) {
                throw new AppError(`New CUPS with ID '${updateData.id_cups}' not found`, 404);
            }
            // Opcional: Podrías querer validar que el nuevo CUPS esté activo
            // if (!newCups.status) {
            //     throw new AppError(`New CUPS with ID '${updateData.id_cups}' is not active`, 400);
            // }
        }

        const updatedProcedureInstance = new MedicalProcedure({ ...existingProcedure, ...updateData });

        const updated = await MedicalProcedureRepository.update(id, {
            medical_procedure_name: updatedProcedureInstance.medical_procedure_name,
            description: updatedProcedureInstance.description,
            id_cups: updatedProcedureInstance.id_cups,
            status: updatedProcedureInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update Medical Procedure', 500);
        }

        if (updateData.service_ids !== undefined) {
            await MedicalProcedureRepository.updateServiceProcedures(id, updateData.service_ids);
        }

        return await MedicalProcedureRepository.findById(id, true);
    }

    /**
     * Elimina un procedimiento médico por su ID.
     * @param {string} id - ID del procedimiento a eliminar.
     * @returns {Promise<boolean>} True si el procedimiento fue eliminado.
     * @throws {AppError} Si el procedimiento no se encuentra.
     */
    async deleteMedicalProcedure(id) {
        const existingProcedure = await MedicalProcedureRepository.findById(id);
        if (!existingProcedure) {
            throw new AppError('Medical Procedure not found', 404);
        }

        const deleted = await MedicalProcedureRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete Medical Procedure', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de un procedimiento médico (activo/inactivo).
     * @param {string} id - ID del procedimiento.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<MedicalProcedure>} El procedimiento con el estado actualizado.
     * @throws {AppError} Si el procedimiento no se encuentra.
     */
    async changeMedicalProcedureStatus(id, status) {
        const existingProcedure = await MedicalProcedureRepository.findById(id);
        if (!existingProcedure) {
            throw new AppError('Medical Procedure not found', 404);
        }
        const updated = await MedicalProcedureRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change Medical Procedure status', 500);
        }
        return updated;
    }
}

export default new MedicalProcedureService();