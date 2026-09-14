import permissionRepository from '../repositories/permission.repository.js';
import { AppError } from '@origen/common';

class PermissionService {
    async createPermission(data) {
        return await permissionRepository.create(data);
    }

    async getPermissions() {
        return await permissionRepository.findAll();
    }

    async updatePermission(id, data) {
        const permission = await permissionRepository.findById(id);
        if (!permission) {
            throw new AppError('Permission not found', 404);
        }
        return await permissionRepository.update(id, data);
    }

    async deletePermission(id) {
        const permission = await permissionRepository.findById(id);
        if (!permission) {
            throw new AppError('Permission not found', 404);
        }
        return await permissionRepository.delete(id);
    }
}

export default new PermissionService();