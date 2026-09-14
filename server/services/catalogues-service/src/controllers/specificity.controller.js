import SpecificityService from '../services/specificity.service.js';
import { asyncHandler, AppError } from '@origen/common';

class SpecificityController {

    /**
     * @route POST /api/specificities
     * @desc Crea una nueva especificidad
     * @access Private (Admin/Configurador)
     */
    createSpecificity = asyncHandler(async (req, res, next) => {
        const { specificity_name, status } = req.body;

        if (!specificity_name) {
            return next(new AppError('Specificity name is required', 400));
        }

        const newSpecificity = await SpecificityService.createSpecificity({ specificity_name, status });

        res.status(201).json({
            status: 'success',
            data: newSpecificity
        });
    });

    /**
     * @route GET /api/specificities/:id
     * @desc Obtiene una especificidad por su ID.
     * @access Private (Read)
     */
    getSpecificityById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const specificity = await SpecificityService.getSpecificityById(id);

        res.status(200).json({
            status: 'success',
            data: specificity
        });
    });

    /**
     * @route GET /api/specificities
     * @desc Obtiene todas las especificidades con paginación y filtrado.
     * @access Private (Read)
     */
    getSpecificities = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 10;
        const where = req.query.where || {}; // Ej: { status: true }
        const orderBy = req.query.orderBy || 'specificity_name';
        const orderDirection = req.query.orderDirection || 'ASC';

        const { data, total } = await SpecificityService.getSpecificities(skip, take, where, orderBy, orderDirection);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/specificities/:id
     * @route PATCH /api/specificities/:id
     * @desc Actualiza una especificidad por su ID
     * @access Private (Admin/Configurador)
     */
    updateSpecificity = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_specificity;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedSpecificity = await SpecificityService.updateSpecificity(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedSpecificity
        });
    });

    /**
     * @route DELETE /api/specificities/:id
     * @desc Elimina una especificidad por su ID
     * @access Private (Admin/Configurador)
     */
    deleteSpecificity = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await SpecificityService.deleteSpecificity(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/specificities/:id/status
     * @desc Cambia el estado (activo/inactivo) de una especificidad
     * @access Private (Admin/Configurador)
     */
    changeSpecificityStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedSpecificity = await SpecificityService.changeSpecificityStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedSpecificity
        });
    });
}

export default new SpecificityController();