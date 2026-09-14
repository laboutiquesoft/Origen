import CupsService from '../services/cups.service.js';
import CurrentCupsVersionService from '../services/currentCupsVersion.service.js';
import { asyncHandler, AppError } from '@origen/common';

class CupsController {

    /**
     * @route POST /api/cups
     * @desc Crea un nuevo CUPS.
     * @access Private (Admin)
     */
    createCups = asyncHandler(async (req, res, next) => {
        const { cups_code, cups_description, cups_observation, status, id_resolution } = req.body;

        const newCups = await CupsService.createCups({
            cups_code,
            cups_description,
            cups_observation,
            status,
            id_resolution
        });

        res.status(201).json({
            status: 'success',
            data: newCups
        });
    });

    /**
     * @route GET /api/cups/:id
     * @desc Obtiene un CUPS por su ID.
     * @access Private (Read)
     */
    getCupsById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const includeResolution = req.query.include === 'resolution' || req.query.include === 'true';

        const cups = await CupsService.getCupsById(id, includeResolution);

        res.status(200).json({
            status: 'success',
            data: cups
        });
    });

    /**
     * @route GET /api/cups/by-code/:cupsCode
     * @desc Obtiene CUPS por un código específico (puede haber múltiples versiones).
     * @access Private (Read)
     */
    getCupsByCode = asyncHandler(async (req, res, next) => {
        const { cupsCode } = req.params;
        const includeResolution = req.query.include === 'resolution' || req.query.include === 'true';

        const cups = await CupsService.getCupsByCode(cupsCode, includeResolution);

        res.status(200).json({
            status: 'success',
            data: cups
        });
    });

    /**
     * @route GET /api/cups/current
     * @desc Obtiene todos los CUPS de la resolución actualmente vigente.
     * @access Public o Private (Read)
     */
    getCurrentCups = asyncHandler(async (req, res, next) => {
        const includeResolution = req.query.include === 'resolution' || req.query.include === 'true';
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const orderBy = req.query.orderBy || 'cups_code';
        const orderDirection = req.query.orderDirection || 'ASC';
        const status = req.query.status ? (req.query.status === 'true') : undefined;


        const currentVersion = await CurrentCupsVersionService.getCurrentCupsVersion();
        const where = { id_resolution: currentVersion.id_resolution };
        if (status !== undefined) {
            where.status = status;
        }

        const { data, total } = await CupsService.getCups(skip, take, where, orderBy, orderDirection, includeResolution);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            resolution: currentVersion.resolution_number, // Opcional, para indicar de qué resolución son los CUPS
            data
        });
    });

    /**
     * @route GET /api/cups
     * @desc Obtiene todos los CUPS con paginación, filtrado y opción de incluir la resolución.
     * @access Private (Read)
     */
    getCups = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {}; // Ej: { status: true, id_resolution: 'uuid' }
        const orderBy = req.query.orderBy || 'cups_code';
        const orderDirection = req.query.orderDirection || 'ASC';
        const includeResolution = req.query.include === 'resolution' || req.query.include === 'true';

        const { data, total } = await CupsService.getCups(skip, take, where, orderBy, orderDirection, includeResolution);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/cups/:id
     * @route PATCH /api/cups/:id
     * @desc Actualiza un CUPS por su ID.
     * @access Private (Admin)
     */
    updateCups = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_cups;
        delete updateData.created_at;
        delete updateData.updated_at;
        // Impedir cambiar id_resolution a través de esta ruta
        delete updateData.id_resolution;

        const updatedCups = await CupsService.updateCups(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedCups
        });
    });

    /**
     * @route DELETE /api/cups/:id
     * @desc Elimina un CUPS por su ID.
     * @access Private (Admin)
     */
    deleteCups = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        await CupsService.deleteCups(id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/cups/:id/status
     * @desc Cambia el estado (activo/inactivo) de un CUPS.
     * @access Private (Admin)
     */
    changeCupsStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedCups = await CupsService.changeCupsStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedCups
        });
    });
}

export default new CupsController();