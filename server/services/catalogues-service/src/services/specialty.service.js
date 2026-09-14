import ServiceGroupRepository from '../repositories/serviceGroup.repository.js';
import ServiceGroup from '../entities/serviceGroup.js';
import { AppError } from '@origen/common';

class ServiceGroupService {

    /**
     * Crea un nuevo grupo de servicio.
     * @param {object} serviceGroupData - Datos del grupo (code, service_group_name, description, status).
     * @returns {Promise<ServiceGroup>} El nuevo grupo de servicio creado.
     * @throws {AppError} Si el código o nombre del grupo ya existe.
     */
    async createServiceGroup(serviceGroupData) {
        if (!serviceGroupData.code) throw new AppError('Group code is required', 400);
        if (!serviceGroupData.service_group_name) throw new AppError('Group name is required', 400); // Usando service_group_name

        serviceGroupData.code = serviceGroupData.code.trim().toUpperCase();
        serviceGroupData.service_group_name = serviceGroupData.service_group_name.trim(); // Usando service_group_name

        const existingByCode = await ServiceGroupRepository.findByCode(serviceGroupData.code);
        if (existingByCode) {
            throw new AppError(`Service group with code '${serviceGroupData.code}' already exists`, 409);
        }

        const existingByName = await ServiceGroupRepository.findByName(serviceGroupData.service_group_name); // Usando service_group_name
        if (existingByName) {
            throw new AppError(`Service group with name '${serviceGroupData.service_group_name}' already exists`, 409); // Usando service_group_name
        }

        const newServiceGroup = new ServiceGroup(serviceGroupData);
        const created = await ServiceGroupRepository.create(newServiceGroup);
        return created;
    }

    /**
     * Obtiene un grupo de servicio por su ID.
     * @param {string} id - El UUID del grupo de servicio.
     * @returns {Promise<ServiceGroup>} El grupo de servicio encontrado.
     * @throws {AppError} Si el grupo de servicio no se encuentra.
     */
    async getServiceGroupById(id) {
        const serviceGroup = await ServiceGroupRepository.findById(id);
        if (!serviceGroup) {
            throw new AppError('Service group not found', 404);
        }
        return serviceGroup;
    }

    /**
     * Obtiene todos los grupos de servicio con paginación y filtrado.
     * @param {number} skip - Número de registros a omitir.
     * @param {number} take - Número de registros a tomar.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @returns {Promise<{data: ServiceGroup[], total: number}>} Lista de grupos de servicio y el total.
     */
    async getServiceGroups(skip, take, where, orderBy, orderDirection) {
        const data = await ServiceGroupRepository.findAll(skip, take, where, orderBy, orderDirection);
        const total = await ServiceGroupRepository.count(where);
        return { data, total };
    }

    /**
     * Actualiza un grupo de servicio existente.
     * @param {string} id - El UUID del grupo de servicio a actualizar.
     * @param {object} updateData - Datos para actualizar el grupo de servicio.
     * @returns {Promise<ServiceGroup>} El grupo de servicio actualizado.
     * @throws {AppError} Si el grupo de servicio no se encuentra o el código/nombre ya existe para otro grupo.
     */
    async updateServiceGroup(id, updateData) {
        const existingServiceGroup = await ServiceGroupRepository.findById(id);
        if (!existingServiceGroup) {
            throw new AppError('Service group not found', 404);
        }

        // Validar código si se intenta cambiar
        if (updateData.code && updateData.code.trim().toUpperCase() !== existingServiceGroup.code) {
            updateData.code = updateData.code.trim().toUpperCase();
            const groupWithNewCode = await ServiceGroupRepository.findByCode(updateData.code);
            if (groupWithNewCode && groupWithNewCode.id_service_group !== id) {
                throw new AppError(`Service group with code '${updateData.code}' already exists`, 409);
            }
        }

        // Validar nombre si se intenta cambiar
        if (updateData.service_group_name && updateData.service_group_name.trim() !== existingServiceGroup.service_group_name) { // Usando service_group_name
            updateData.service_group_name = updateData.service_group_name.trim(); // Usando service_group_name
            const groupWithNewName = await ServiceGroupRepository.findByName(updateData.service_group_name); // Usando service_group_name
            if (groupWithNewName && groupWithNewName.id_service_group !== id) {
                throw new AppError(`Service group with name '${updateData.service_group_name}' already exists`, 409); // Usando service_group_name
            }
        }

        const updatedServiceGroupInstance = new ServiceGroup({ ...existingServiceGroup, ...updateData });

        const updated = await ServiceGroupRepository.update(id, {
            code: updatedServiceGroupInstance.code,
            service_group_name: updatedServiceGroupInstance.service_group_name, // Usando service_group_name
            description: updatedServiceGroupInstance.description,
            status: updatedServiceGroupInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update service group', 500);
        }
        return updated;
    }

    /**
     * Elimina un grupo de servicio por su ID.
     * @param {string} id - El UUID del grupo de servicio a eliminar.
     * @returns {Promise<boolean>} True si el grupo de servicio fue eliminado.
     * @throws {AppError} Si el grupo de servicio no se encuentra.
     */
    async deleteServiceGroup(id) {
        const existingServiceGroup = await ServiceGroupRepository.findById(id);
        if (!existingServiceGroup) {
            throw new AppError('Service group not found', 404);
        }

        // Considerar aquí si hay dependencias (ej. en la tabla `services.id_service_group`).
        // Si hay, PostgreSQL fallará si tienes FKs que impiden la eliminación y ON DELETE SET NULL no está configurado.
        // Asegúrate de manejar esto o de que el diseño de la DB sea adecuado.

        const deleted = await ServiceGroupRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete service group', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de un grupo de servicio (activo/inactivo).
     * @param {string} id - El UUID del grupo de servicio.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<ServiceGroup>} El grupo de servicio con el estado actualizado.
     * @throws {AppError} Si el grupo de servicio no se encuentra.
     */
    async changeServiceGroupStatus(id, status) {
        const existingServiceGroup = await ServiceGroupRepository.findById(id);
        if (!existingServiceGroup) {
            throw new AppError('Service group not found', 404);
        }
        const updated = await ServiceGroupRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change service group status', 500);
        }
        return updated;
    }
}

export default new ServiceGroupService();