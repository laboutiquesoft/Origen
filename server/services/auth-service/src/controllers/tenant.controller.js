import tenantService from '../services/tenant.service.js';

class TenantController {
    async createTenant(req, res, next) {
        try {
            // Expect body: { name: "TenantName", initials, nit, ... adminUser: { email, password, etc } }
            const { adminUser, ...tenantData } = req.body;
            const result = await tenantService.createTenant(tenantData, adminUser);

            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllTenants(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';

            const result = await tenantService.getAllTenants(page, limit, search);

            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    async getTenant(req, res, next) {
        try {
            const result = await tenantService.getTenantById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTenant(req, res, next) {
        try {
            const result = await tenantService.updateTenant(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTenant(req, res, next) {
        try {
            await tenantService.deleteTenant(req.params.id);
            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
    async updateMicroservices(req, res, next) {
        try {
            // Body: { microservices: ["id1", "id2"] }
            await tenantService.updateMicroservices(req.params.id, req.body.microservices);
            res.status(200).json({
                status: 'success',
                message: 'Microservices updated'
            });
        } catch (error) {
            next(error);
        }
    }

    async getDashboardStats(req, res, next) {
        try {
            const stats = await tenantService.getDashboardStats(req.params.id);
            res.status(200).json({
                status: 'success',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TenantController();