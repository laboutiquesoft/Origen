import ServiceGroupService from '../services/serviceGroup.service.js';
import { asyncHandler, AppError } from '@origen/common';

class ServiceGroupController {

    /**
     * @route POST /api/service-groups
     * @desc Crea un nuevo grupo de servicio
     * @access Private (Admin/Configurador)
     */
    createServiceGroup = asyncHandler(async (req, res, next) => {
        const { code, service_group_name, description, status } = req.body; // Usando service_group_name

        if (!code || !service_group_name) { // Usando service_group_name
            return next(new AppError('Group code and name are required', 400));
        }

        const newServiceGroup = await ServiceGroupService.createServiceGroup({ code, service_group_name, description, status }); // Usando service_group_name

        res.status(201).json({
            status: 'success',
            data: newServiceGroup
        });
    });

    /**
     * @route GET /api/service-groups/:id
     * @desc Obtiene un grupo de servicio por su ID
     * @access Private (Read)
     */
    getServiceGroupById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const serviceGroup = await ServiceGroupService.getServiceGroupById(id);

        res.status(200).json({
            status: 'success',
            data: serviceGroup
        });
    });

    /**
     * @route GET /api/service-groups
     * @desc Obtiene todos los grupos de servicio con paginación y filtrado
     * @access Private (Read)
     */
    getServiceGroups = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {}; // Ej: { status: true }
        const orderBy = req.query.orderBy || 'service_group_name'; // Usando service_group_name
        const orderDirection = req.query.orderDirection || 'ASC';

        const { data, total } = await ServiceGroupService.getServiceGroups(skip, take, where, orderBy, orderDirection);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/service-groups/:id
     * @route PATCH /api/service-groups/:id
     * @desc Actualiza un grupo de servicio por su ID
     * @access Private (Admin/Configurador)
     */
    updateServiceGroup = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_service_group;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedServiceGroup = await ServiceGroupService.updateServiceGroup(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedServiceGroup
        });
    });

    /**
     * @route DELETE /api/service-groups/:id
     * @desc Elimina un grupo de servicio por su ID
     * @access Private (Admin/Configurador)
     */
    deleteServiceGroup = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await ServiceGroupService.deleteServiceGroup(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/service-groups/:id/status
     * @desc Cambia el estado (activo/inactivo) de un grupo de servicio
     * @access Private (Admin/Configurador)
     */
    changeServiceGroupStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedServiceGroup = await ServiceGroupService.changeServiceGroupStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedServiceGroup
        });
    });
}

export default new ServiceGroupController();