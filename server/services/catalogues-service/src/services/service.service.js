import ServiceRepository from '../repositories/service.repository.js';
import ServiceGroupRepository from '../repositories/serviceGroup.repository.js'; // Para validar id_service_group
import Service from '../entities/service.js';
import { AppError } from '@origen/common';

class ServiceService {

    /**
     * Crea un nuevo servicio.
     * @param {object} serviceData - Datos del servicio (code, service_name, description, id_service_group, status).
     * @returns {Promise<Service>} El nuevo servicio creado.
     * @throws {AppError} Si el código o nombre del servicio ya existe, o si el id_service_group no es válido.
     */
    async createService(serviceData) {
        if (!serviceData.code) throw new AppError('Service code is required', 400);
        if (!serviceData.service_name) throw new AppError('Service name is required', 400);

        serviceData.code = serviceData.code.trim().toUpperCase();
        serviceData.service_name = serviceData.service_name.trim();

        // Validar que el código del servicio sea único
        const existingByCode = await ServiceRepository.findByCode(serviceData.code);
        if (existingByCode) {
            throw new AppError(`Service with code '${serviceData.code}' already exists`, 409);
        }

        // Validar que el nombre del servicio sea único
        const existingByName = await ServiceRepository.findByName(serviceData.service_name);
        if (existingByName) {
            throw new AppError(`Service with name '${serviceData.service_name}' already exists`, 409);
        }

        // Validar si id_service_group existe
        if (serviceData.id_service_group) {
            const serviceGroup = await ServiceGroupRepository.findById(serviceData.id_service_group);
            if (!serviceGroup) {
                throw new AppError(`Service Group with ID '${serviceData.id_service_group}' not found`, 404);
            }
        }

        const newService = new Service(serviceData);
        const created = await ServiceRepository.create(newService);
        return created;
    }

    /**
     * Obtiene un servicio por su ID.
     * @param {string} id - El UUID del servicio.
     * @param {boolean} [includeGroup=false] - Si es true, incluye los datos del ServiceGroup.
     * @returns {Promise<Service>} El servicio encontrado.
     * @throws {AppError} Si el servicio no se encuentra.
     */
    async getServiceById(id, includeGroup = false) {
        const service = await ServiceRepository.findById(id, includeGroup);
        if (!service) {
            throw new AppError('Service not found', 404);
        }
        return service;
    }

    /**
     * Obtiene todos los servicios con paginación, filtrado y opción de incluir el grupo.
     * @param {number} skip - Número de registros a omitir.
     * @param {number} take - Número de registros a tomar.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @param {boolean} [includeGroup=false] - Si es true, incluye los datos del ServiceGroup.
     * @returns {Promise<{data: Service[], total: number}>} Lista de servicios y el total.
     */
    async getServices(skip, take, where, orderBy, orderDirection, includeGroup = false) {
        const data = await ServiceRepository.findAll(skip, take, where, orderBy, orderDirection, includeGroup);
        const total = await ServiceRepository.count(where);
        return { data, total };
    }

    /**
     * Actualiza un servicio existente.
     * @param {string} id - El UUID del servicio a actualizar.
     * @param {object} updateData - Datos para actualizar el servicio.
     * @returns {Promise<Service>} El servicio actualizado.
     * @throws {AppError} Si el servicio no se encuentra, el código/nombre ya existe para otro servicio, o el id_service_group no es válido.
     */
    async updateService(id, updateData) {
        const existingService = await ServiceRepository.findById(id);
        if (!existingService) {
            throw new AppError('Service not found', 404);
        }

        // Validar código si se intenta cambiar
        if (updateData.code && updateData.code.trim().toUpperCase() !== existingService.code) {
            updateData.code = updateData.code.trim().toUpperCase();
            const serviceWithNewCode = await ServiceRepository.findByCode(updateData.code);
            if (serviceWithNewCode && serviceWithNewCode.id_service !== id) {
                throw new AppError(`Service with code '${updateData.code}' already exists`, 409);
            }
        }

        // Validar nombre si se intenta cambiar
        if (updateData.service_name && updateData.service_name.trim() !== existingService.service_name) {
            updateData.service_name = updateData.service_name.trim();
            const serviceWithNewName = await ServiceRepository.findByName(updateData.service_name);
            if (serviceWithNewName && serviceWithNewName.id_service !== id) {
                throw new AppError(`Service with name '${updateData.service_name}' already exists`, 409);
            }
        }

        // Validar si id_service_group existe si se intenta cambiar
        if (updateData.id_service_group) {
            const serviceGroup = await ServiceGroupRepository.findById(updateData.id_service_group);
            if (!serviceGroup) {
                throw new AppError(`Service Group with ID '${updateData.id_service_group}' not found`, 404);
            }
        } else if (updateData.id_service_group === null) {
            // Permitir desvincular el grupo si se pasa null explícitamente
            updateData.id_service_group = null;
        }


        const updatedServiceInstance = new Service({ ...existingService, ...updateData });

        const updated = await ServiceRepository.update(id, {
            code: updatedServiceInstance.code,
            service_name: updatedServiceInstance.service_name,
            description: updatedServiceInstance.description,
            status: updatedServiceInstance.status,
            id_service_group: updatedServiceInstance.id_service_group,
        });

        if (!updated) {
            throw new AppError('Failed to update service', 500);
        }
        return updated;
    }

    /**
     * Elimina un servicio por su ID.
     * @param {string} id - El UUID del servicio a eliminar.
     * @returns {Promise<boolean>} True si el servicio fue eliminado.
     * @throws {AppError} Si el servicio no se encuentra.
     */
    async deleteService(id) {
        const existingService = await ServiceRepository.findById(id);
        if (!existingService) {
            throw new AppError('Service not found', 404);
        }

        const deleted = await ServiceRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete service', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de un servicio (activo/inactivo).
     * @param {string} id - El UUID del servicio.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<Service>} El servicio con el estado actualizado.
     * @throws {AppError} Si el servicio no se encuentra.
     */
    async changeServiceStatus(id, status) {
        const existingService = await ServiceRepository.findById(id);
        if (!existingService) {
            throw new AppError('Service not found', 404);
        }
        const updated = await ServiceRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change service status', 500);
        }
        return updated;
    }
}

export default new ServiceService();