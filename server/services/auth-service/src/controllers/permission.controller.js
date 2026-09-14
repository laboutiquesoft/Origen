import permissionService from '../services/permission.service.js';

class PermissionController {
    async createPermission(req, res, next) {
        try {
            const permission = await permissionService.createPermission(req.body);
            res.status(201).json({
                status: 'success',
                data: permission
            });
        } catch (error) {
            next(error);
        }
    }

    async getPermissions(req, res, next) {
        try {
            const permissions = await permissionService.getPermissions();
            res.status(200).json({
                status: 'success',
                data: permissions
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePermission(req, res, next) {
        try {
            const permission = await permissionService.updatePermission(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: permission
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePermission(req, res, next) {
        try {
            await permissionService.deletePermission(req.params.id);
            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PermissionController();