import roleService from '../services/role.service.js';

class RoleController {
    async createRole(req, res, next) {
        try {
            const role = await roleService.createRole(req.body, req.user);
            res.status(201).json({
                status: 'success',
                data: role
            });
        } catch (error) {
            next(error);
        }
    }

    async getRoles(req, res, next) {
        try {
            const roles = await roleService.getRoles(req.user, req.query);
            res.status(200).json({
                status: 'success',
                data: roles
            });
        } catch (error) {
            next(error);
        }
    }

    async updateRole(req, res, next) {
        try {
            const role = await roleService.updateRole(req.params.id, req.body, req.user);
            res.status(200).json({
                status: 'success',
                data: role
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteRole(req, res, next) {
        try {
            await roleService.deleteRole(req.params.id, req.user);
            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new RoleController();