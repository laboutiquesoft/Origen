import ModalityService from '../services/modality.service.js';
import { asyncHandler, AppError } from '@origen/common';

class ModalityController {

    /**
     * @route POST /api/modalities
     * @desc Crea una nueva modalidad
     * @access Private (Admin/Configurador)
     */
    createModality = asyncHandler(async (req, res, next) => {
        const { modality_name, status } = req.body;

        if (!modality_name) {
            return next(new AppError('Modality name is required', 400));
        }

        const newModality = await ModalityService.createModality({ modality_name, status });

        res.status(201).json({
            status: 'success',
            data: newModality
        });
    });

    /**
     * @route GET /api/modalities/:id
     * @desc Obtiene una modalidad por su ID
     * @access Private (Read)
     */
    getModalityById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const modality = await ModalityService.getModalityById(id);

        res.status(200).json({
            status: 'success',
            data: modality
        });
    });

    /**
     * @route GET /api/modalities
     * @desc Obtiene todas las modalidades con paginación y filtrado
     * @access Private (Read)
     */
    getModalities = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {}; // Ej: { status: true }
        const orderBy = req.query.orderBy || 'modality_name';
        const orderDirection = req.query.orderDirection || 'ASC';

        const { data, total } = await ModalityService.getModalities(skip, take, where, orderBy, orderDirection);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/modalities/:id
     * @route PATCH /api/modalities/:id
     * @desc Actualiza una modalidad por su ID
     * @access Private (Admin/Configurador)
     */
    updateModality = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_modality;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedModality = await ModalityService.updateModality(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedModality
        });
    });

    /**
     * @route DELETE /api/modalities/:id
     * @desc Elimina una modalidad por su ID
     * @access Private (Admin/Configurador)
     */
    deleteModality = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await ModalityService.deleteModality(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/modalities/:id/status
     * @desc Cambia el estado (activo/inactivo) de una modalidad
     * @access Private (Admin/Configurador)
     */
    changeModalityStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedModality = await ModalityService.changeModalityStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedModality
        });
    });
}

export default new ModalityController();