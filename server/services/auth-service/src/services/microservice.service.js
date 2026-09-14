import microserviceRepository from '../repositories/microservice.repository.js';
import { AppError } from '@origen/common';

class MicroserviceService {
    async getAllMicroservices(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const data = await microserviceRepository.findAll(skip, limit, where);
        const total = await microserviceRepository.count(where);

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

    async createMicroservice(data) {
        let existing = await microserviceRepository.findByCode(data.code);
        if (existing) {
            throw new AppError('Microservice with this code already exists', 400);
        }

        existing = await microserviceRepository.findByName(data.name);
        if (existing) {
            throw new AppError('Microservice with this name already exists', 400);
        }

        return await microserviceRepository.create(data);
    }

    async updateMicroservice(id, data) {
        // Prevent changing code if it conflicts? For now let DB handle unique constraint or check here
        if (data.code) {
            const existing = await microserviceRepository.findByCode(data.code);
            if (existing && existing.id_microservice !== id) {
                throw new AppError('Microservice code already in use', 400);
            }
        }

        if (data.name) {
            const existing = await microserviceRepository.findByName(data.name);
            if (existing && existing.id_microservice !== id) {
                throw new AppError('Microservice name already in use', 400);
            }
        }

        return await microserviceRepository.update(id, data);
    }

    async deleteMicroservice(id) {
        // Warning: Cascade delete is configured in schema, so this will remove assignments from tenants/users
        return await microserviceRepository.delete(id);
    }
}

export default new MicroserviceService();