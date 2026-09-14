import CupsResolutionService from '../services/cupsResolution.service.js';
import { asyncHandler, AppError } from '@origen/common';

class CupsResolutionController {

    /**
     * @route POST /api/cups-resolutions
     * @desc Crea una nueva resolución CUPS.
     * @access Private (Admin)
     */
    createResolution = asyncHandler(async (req, res, next) => {
        const { resolution_number, publication_date, effective_date, end_date, status } = req.body;

        const newResolution = await CupsResolutionService.createResolution({
            resolution_number,
            publication_date,
            effective_date,
            end_date,
            status
        });

        res.status(201).json({
            status: 'success',
            data: newResolution
        });
    });

    /**
     * @route GET /api/cups-resolutions/:id
     * @desc Obtiene una resolución CUPS por su ID.
     * @access Private (Read)
     */
    getResolutionById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const resolution = await CupsResolutionService.getResolutionById(id);
        res.status(200).json({
            status: 'success',
            data: resolution
        });
    });

    /**
     * @route GET /api/cups-resolutions
     * @desc Obtiene todas las resoluciones CUPS con paginación y filtrado.
     * @access Private (Read)
     */
    getResolutions = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {};
        const orderBy = req.query.orderBy || 'effective_date';
        const orderDirection = req.query.orderDirection || 'DESC';

        const { data, total } = await CupsResolutionService.getResolutions(skip, take, where, orderBy, orderDirection);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/cups-resolutions/:id
     * @route PATCH /api/cups-resolutions/:id
     * @desc Actualiza una resolución CUPS por su ID.
     * @access Private (Admin)
     */
    updateResolution = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_resolution;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedResolution = await CupsResolutionService.updateResolution(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedResolution
        });
    });

    /**
     * @route DELETE /api/cups-resolutions/:id
     * @desc Elimina una resolución CUPS por su ID.
     * @access Private (Admin)
     */
    deleteResolution = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        await CupsResolutionService.deleteResolution(id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/cups-resolutions/:id/status
     * @desc Cambia el estado (activo/inactivo) de una resolución CUPS.
     * @access Private (Admin)
     */
    changeResolutionStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedResolution = await CupsResolutionService.changeResolutionStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedResolution
        });
    });
}

export default new CupsResolutionController();