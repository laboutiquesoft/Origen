import userService from '../services/user.service.js';

class UserController {
    async createUser(req, res, next) {
        try {
            const userRoles = req.user.user_roles.map(ur => ur.role.name);
            const isAllMighty = userRoles.includes('AllMighty');
            const isAdmin = userRoles.includes('Admin');

            if (!isAllMighty && !isAdmin) {
                // Should be caught by restrictTo, but double check
                return res.status(403).json({ status: 'fail', message: 'Not authorized' });
            }

            const userData = { ...req.body };

            if (!isAllMighty) {
                // Force tenant ID for non-AllMighty
                userData.id_tenant = req.user.id_tenant;
            }

            // Sanitización del campo signature (convierte strings vacíos a null)
            if (userData.signature !== undefined) {
                userData.signature = userData.signature && userData.signature.trim() !== '' 
                    ? userData.signature 
                    : null;
            }

            // TODO: Validate that roles being assigned are allowed? 
            // For now assume Admin can assign any role.

            const user = await userService.createUser(userData, req.user);
            res.status(201).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req, res, next) {
        try {
            const userRoles = req.user.user_roles.map(ur => ur.role.name);
            const isAllMighty = userRoles.includes('AllMighty');

            const where = {};
            if (req.tenantId) {
                where.id_tenant = req.tenantId;
            } else if (isAllMighty && req.query.id_tenant && req.query.id_tenant !== '') {
                where.id_tenant = req.query.id_tenant;
            }

            // Status filter
            if (req.query.status !== undefined && req.query.status !== '') {
                where.status = req.query.status === 'true';
            }

            // Site filter
            if (req.query.id_site) {
                where.id_site = req.query.id_site;
            }

            // Search filter
            if (req.query.search) {
                where.OR = [
                    { first_name: { contains: req.query.search, mode: 'insensitive' } },
                    { last_name: { contains: req.query.search, mode: 'insensitive' } },
                    { email: { contains: req.query.search, mode: 'insensitive' } }
                ];
            }

            const users = await userService.getAllUsers(where, req.user);
            res.status(200).json({
                status: 'success',
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id);
            const userRoles = req.user.user_roles.map(ur => ur.role.name);
            const isAllMighty = userRoles.includes('AllMighty');

            if (!isAllMighty && user.id_tenant !== req.user.id_tenant) {
                return res.status(403).json({ status: 'fail', message: 'Not authorized to view this user' });
            }

            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {            
            const existingUser = await userService.getUserById(req.params.id);
            const userRoles = req.user.user_roles.map(ur => ur.role.name);
            const isAllMighty = userRoles.includes('AllMighty');

            if (!isAllMighty && existingUser.id_tenant !== req.user.id_tenant) {
                return res.status(403).json({ status: 'fail', message: 'Not authorized to update this user' });
            }

            const updateData = { ...req.body };
            if (!isAllMighty) {                
                delete updateData.id_tenant;
            }

            // Sanitización del campo signature en actualización
            if (updateData.signature !== undefined) {
                updateData.signature = updateData.signature && updateData.signature.trim() !== '' 
                    ? updateData.signature 
                    : null;
            }

            const user = await userService.updateUser(req.params.id, updateData, req.user);
            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const existingUser = await userService.getUserById(req.params.id);
            const userRoles = req.user.user_roles.map(ur => ur.role.name);
            const isAllMighty = userRoles.includes('AllMighty');

            if (!isAllMighty && existingUser.id_tenant !== req.user.id_tenant) {
                return res.status(403).json({ status: 'fail', message: 'Not authorized to delete this user' });
            }

            await userService.deleteUser(req.params.id);
            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();