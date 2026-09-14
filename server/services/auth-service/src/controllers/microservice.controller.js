import microserviceService from '../services/microservice.service.js';

class MicroserviceController {
    async getAllMicroservices(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';

            const result = await microserviceService.getAllMicroservices(page, limit, search);
            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    async createMicroservice(req, res, next) {
        try {
            const result = await microserviceService.createMicroservice(req.body);
            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateMicroservice(req, res, next) {
        try {
            const result = await microserviceService.updateMicroservice(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteMicroservice(req, res, next) {
        try {
            await microserviceService.deleteMicroservice(req.params.id);
            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MicroserviceController();