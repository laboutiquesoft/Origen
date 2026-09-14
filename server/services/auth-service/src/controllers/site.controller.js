import siteService from '../services/site.service.js';

class SiteController {
    async createSite(req, res, next) {
        try {
            // Determine tenant context
            // If user is Admin/SiteAdmin, use their tenantId.
            // If AllMighty, expect header or body.
            const tenantId = req.tenantId;

            if (!tenantId) {
                return res.status(400).json({ status: 'fail', message: 'Tenant ID is required' });
            }

            const result = await siteService.createSite(req.body, tenantId);

            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllSites(req, res, next) {
        try {
            console.log('Backend Request Query:', req.query);

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const status = req.query.status;
            const tenantId = req.tenantId;

            if (!tenantId) {
                return res.status(200).json({ data: [], meta: { total: 0 } });
            }

            const result = await siteService.getAllSites(page, limit, search, status, tenantId);

            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            console.error('Error in getAllSites:', error);
            next(error);
        }
    }

    async getSite(req, res, next) {
        try {
            const tenantId = req.tenantId;
            const result = await siteService.getSiteById(req.params.id, tenantId);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateSite(req, res, next) {
        try {
            const tenantId = req.tenantId;
            const result = await siteService.updateSite(req.params.id, req.body, tenantId);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteSite(req, res, next) {
        try {
            const tenantId = req.tenantId;
            await siteService.deleteSite(req.params.id, tenantId);
            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new SiteController();