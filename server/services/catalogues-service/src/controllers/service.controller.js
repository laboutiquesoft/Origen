import ServiceService from '../services/service.service.js';
import { asyncHandler, AppError } from '@origen/common';

class ServiceController {

    /**
     * @route POST /api/services
     * @desc Crea un nuevo servicio
     * @access Private (Admin/Configurador)
     */
    createService = asyncHandler(async (req, res, next) => {
        const { code, service_name, description, id_service_group, status } = req.body;

        if (!code || !service_name) {
            return next(new AppError('Service code and name are required', 400));
        }

        const newService = await ServiceService.createService({ code, service_name, description, id_service_group, status });

        res.status(201).json({
            status: 'success',
            data: newService
        });
    });

    /**
     * @route GET /api/services/:id
     * @desc Obtiene un servicio por su ID, con opción de incluir el grupo.
     * @access Private (Read)
     */
    getServiceById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const includeGroup = req.query.include === 'serviceGroup' || req.query.include === 'true';

        const service = await ServiceService.getServiceById(id, includeGroup);

        res.status(200).json({
            status: 'success',
            data: service
        });
    });

    /**
     * @route GET /api/services
     * @desc Obtiene todos los servicios con paginación, filtrado y opción de incluir el grupo.
     * @access Private (Read)
     */
    getServices = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {}; // Ej: { status: true }
        const orderBy = req.query.orderBy || 'service_name';
        const orderDirection = req.query.orderDirection || 'ASC';
        const includeGroup = req.query.include === 'serviceGroup' || req.query.include === 'true';

        const { data, total } = await ServiceService.getServices(skip, take, where, orderBy, orderDirection, includeGroup);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/services/:id
     * @route PATCH /api/services/:id
     * @desc Actualiza un servicio por su ID
     * @access Private (Admin/Configurador)
     */
    updateService = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_service;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedService = await ServiceService.updateService(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedService
        });
    });

    /**
     * @route DELETE /api/services/:id
     * @desc Elimina un servicio por su ID
     * @access Private (Admin/Configurador)
     */
    deleteService = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await ServiceService.deleteService(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/services/:id/status
     * @desc Cambia el estado (activo/inactivo) de un servicio
     * @access Private (Admin/Configurador)
     */
    changeServiceStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedService = await ServiceService.changeServiceStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedService
        });
    });
}

export default new ServiceController();