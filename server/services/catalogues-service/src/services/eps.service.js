import EpsRepository from '../repositories/eps.repository.js';
import Eps from '../entities/eps.js';
import { AppError } from '@origen/common';

class EpsService {

    /**
     * Crea una nueva EPS.
     * @param {object} epsData - Datos de la EPS (eps_name).
     * @returns {Promise<Eps>} La nueva EPS creada.
     * @throws {AppError} Si el nombre de la EPS ya existe.
     */
    async createEps(epsData) {
        if (!epsData.eps_name) throw new AppError('EPS name is required', 400);

        epsData.eps_name = epsData.eps_name.trim();

        const existingByName = await EpsRepository.findByName(epsData.eps_name);
        if (existingByName) {
            throw new AppError(`EPS with name '${epsData.eps_name}' already exists`, 409);
        }

        const newEps = new Eps(epsData);
        const created = await EpsRepository.create(newEps);
        return created;
    }

    /**
     * Obtiene una EPS por su ID.
     * @param {string} id - El UUID de la EPS.
     * @returns {Promise<Eps>} La EPS encontrada.
     * @throws {AppError} Si la EPS no se encuentra.
     */
    async getEpsById(id) {
        const eps = await EpsRepository.findById(id);
        if (!eps) {
            throw new AppError('EPS not found', 404);
        }
        return eps;
    }

    /**
     * Obtiene todas las EPS con paginación y filtrado.
     * @param {number} skip - Número de registros a omitir.
     * @param {number} take - Número de registros a tomar.
     * @param {object} where - Condiciones de filtro.
     * @param {string} orderBy - Columna para ordenar.
     * @param {string} orderDirection - Dirección de ordenamiento.
     * @returns {Promise<{data: Eps[], total: number}>} Lista de EPS y el total.
     */
    async getEps(skip, take, where, orderBy, orderDirection) {
        const data = await EpsRepository.findAll(skip, take, where, orderBy, orderDirection);
        const total = await EpsRepository.count(where);
        return { data, total };
    }

    /**
     * Actualiza una EPS existente.
     * @param {string} id - El UUID de la EPS a actualizar.
     * @param {object} updateData - Datos para actualizar la EPS.
     * @returns {Promise<Eps>} La EPS actualizada.
     * @throws {AppError} Si la EPS no se encuentra o el nombre ya existe para otra EPS.
     */
    async updateEps(id, updateData) {
        const existingEps = await EpsRepository.findById(id);
        if (!existingEps) {
            throw new AppError('EPS not found', 404);
        }

        if (updateData.eps_name && updateData.eps_name.trim() !== existingEps.eps_name) {
            updateData.eps_name = updateData.eps_name.trim();
            const epsWithNewName = await EpsRepository.findByName(updateData.eps_name);
            if (epsWithNewName && epsWithNewName.id_eps !== id) {
                throw new AppError(`EPS with name '${updateData.eps_name}' already exists`, 409);
            }
        }

        const updatedEpsInstance = new Eps({ ...existingEps, ...updateData });

        const updated = await EpsRepository.update(id, {
            eps_name: updatedEpsInstance.eps_name,
            status: updatedEpsInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update EPS', 500);
        }
        return updated;
    }

    /**
     * Elimina una EPS por su ID.
     * @param {string} id - El UUID de la EPS a eliminar.
     * @returns {Promise<boolean>} True si la EPS fue eliminada.
     * @throws {AppError} Si la EPS no se encuentra.
     */
    async deleteEps(id) {
        const existingEps = await EpsRepository.findById(id);
        if (!existingEps) {
            throw new AppError('EPS not found', 404);
        }

        const deleted = await EpsRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete EPS', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de una EPS (activo/inactivo).
     * @param {string} id - El UUID de la EPS.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<Eps>} La EPS con el estado actualizado.
     * @throws {AppError} Si la EPS no se encuentra.
     */
    async changeEpsStatus(id, status) {
        const existingEps = await EpsRepository.findById(id);
        if (!existingEps) {
            throw new AppError('EPS not found', 404);
        }
        const updated = await EpsRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change EPS status', 500);
        }
        return updated;
    }
}

export default new EpsService();