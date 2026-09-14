import EpsService from '../services/eps.service.js';
import { asyncHandler, AppError } from '@origen/common';

class EpsController {

    /**
     * @route POST /api/eps
     * @desc Crea una nueva EPS
     * @access Private (Admin/Configurador)
     */
    createEps = asyncHandler(async (req, res, next) => {
        const { eps_name, status } = req.body;

        if (!eps_name) {
            return next(new AppError('EPS name is required', 400));
        }

        const newEps = await EpsService.createEps({ eps_name, status });

        res.status(201).json({
            status: 'success',
            data: newEps
        });
    });

    /**
     * @route GET /api/eps/:id
     * @desc Obtiene una EPS por su ID
     * @access Private (Read)
     */
    getEpsById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const eps = await EpsService.getEpsById(id);

        res.status(200).json({
            status: 'success',
            data: eps
        });
    });

    /**
     * @route GET /api/eps
     * @desc Obtiene todas las EPS con paginación y filtrado
     * @access Private (Read)
     */
    getEps = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {}; // Ej: { status: true }
        const orderBy = req.query.orderBy || 'eps_name';
        const orderDirection = req.query.orderDirection || 'ASC';

        const { data, total } = await EpsService.getEps(skip, take, where, orderBy, orderDirection);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/eps/:id
     * @route PATCH /api/eps/:id
     * @desc Actualiza una EPS por su ID
     * @access Private (Admin/Configurador)
     */
    updateEps = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_eps;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedEps = await EpsService.updateEps(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedEps
        });
    });

    /**
     * @route DELETE /api/eps/:id
     * @desc Elimina una EPS por su ID
     * @access Private (Admin/Configurador)
     */
    deleteEps = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await EpsService.deleteEps(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/eps/:id/status
     * @desc Cambia el estado (activo/inactivo) de una EPS
     * @access Private (Admin/Configurador)
     */
    changeEpsStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedEps = await EpsService.changeEpsStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedEps
        });
    });
}

export default new EpsController();