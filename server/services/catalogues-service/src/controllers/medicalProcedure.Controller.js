import MedicalProcedureService from '../services/medicalProcedure.service.js';
import CurrentCupsVersionService from '../services/currentCupsVersion.service.js';
import { asyncHandler, AppError } from '@origen/common';

class MedicalProcedureController {

    /**
     * @route POST /api/medical-procedures
     * @desc Crea un nuevo procedimiento médico.
     * @access Private (Ej. rol de médico, enfermera, etc.)
     */
    createMedicalProcedure = asyncHandler(async (req, res, next) => {
        const { medical_procedure_name, description, id_cups, status, service_ids } = req.body;

        if (!medical_procedure_name || !id_cups) {
            return next(new AppError('Medical procedure name and CUPS ID are required', 400));
        }

        const newMedicalProcedure = await MedicalProcedureService.createMedicalProcedure({
            medical_procedure_name,
            description,
            id_cups,
            status,
            service_ids
        });

        res.status(201).json({
            status: 'success',
            data: newMedicalProcedure
        });
    });

    /**
     * @route GET /api/medical-procedures/:id
     * @desc Obtiene un procedimiento médico por su ID, con opción de incluir el CUPS.
     * @access Private (Read)
     */
    getMedicalProcedureById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const includeCups = req.query.include === 'cups' || req.query.include === 'true';

        const procedure = await MedicalProcedureService.getMedicalProcedureById(id, includeCups);

        res.status(200).json({
            status: 'success',
            data: procedure
        });
    });

    /**
     * @route GET /api/medical-procedures
     * @desc Obtiene todos los procedimientos médicos con paginación, filtrado y opción de incluir el CUPS.
     * @access Private (Read)
     */
    getMedicalProcedures = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {}; // Ej: { status: true, patient_id: 'uuid' }
        const orderBy = req.query.orderBy || 'created_at';
        const orderDirection = req.query.orderDirection || 'DESC';
        const includeCups = req.query.include === 'cups' || req.query.include === 'true';

        const { data, total } = await MedicalProcedureService.getMedicalProcedures(skip, take, where, orderBy, orderDirection, includeCups);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/medical-procedures/:id
     * @route PATCH /api/medical-procedures/:id
     * @desc Actualiza un procedimiento médico por su ID.
     * @access Private (Ej. rol de médico, admin)
     */
    updateMedicalProcedure = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_medical_procedure;
        delete updateData.created_at;
        delete updateData.updated_at;

        // No permitir cambiar patient_id, doctor_id, procedure_date si existen en el modelo
        // delete updateData.patient_id;
        // delete updateData.doctor_id;
        // delete updateData.procedure_date;

        const updatedMedicalProcedure = await MedicalProcedureService.updateMedicalProcedure(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedMedicalProcedure
        });
    });

    /**
     * @route DELETE /api/medical-procedures/:id
     * @desc Elimina un procedimiento médico por su ID.
     * @access Private (Admin)
     */
    deleteMedicalProcedure = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        await MedicalProcedureService.deleteMedicalProcedure(id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/medical-procedures/:id/status
     * @desc Cambia el estado (activo/inactivo) de un procedimiento médico.
     * @access Private (Admin)
     */
    changeMedicalProcedureStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedMedicalProcedure = await MedicalProcedureService.changeMedicalProcedureStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedMedicalProcedure
        });
    });
}

export default new MedicalProcedureController();