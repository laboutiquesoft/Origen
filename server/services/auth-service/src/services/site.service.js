import siteRepository from '../repositories/site.repository.js';
import { AppError } from '@origen/common';

class SiteService {
    async createSite(data, tenantId) {
        return await siteRepository.create({ ...data, id_tenant: tenantId });
    }

    async getAllSites(page = 1, limit = 10, search = '', status, tenantId) {
        const skip = (page - 1) * limit;
        const where = { id_tenant: tenantId };

        if (search) {
            where.OR = [
                { site_name: { contains: search } },
                { site_code: { contains: search } },
                { city: { contains: search } }
            ];
        }

        if (status !== undefined && status !== 'all') {
            where.status = status === 'true' || status === true;
        }

        const data = await siteRepository.findAll(skip, limit, where);
        const total = await siteRepository.count(where);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getSiteById(id, tenantId) {
        const site = await siteRepository.findById(id);
        if (!site || (tenantId && site.id_tenant !== tenantId)) {
            throw new AppError('Site not found', 404);
        }
        return site;
    }

    async updateSite(id, data, tenantId) {
        const site = await this.getSiteById(id, tenantId);
        return await siteRepository.update(id, data);
    }

    async deleteSite(id, tenantId) {
        const site = await this.getSiteById(id, tenantId);
        return await siteRepository.delete(id);
    }
}

export default new SiteService();