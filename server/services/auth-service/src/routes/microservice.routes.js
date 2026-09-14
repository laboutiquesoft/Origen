import express from 'express';
import microserviceController from '../controllers/microservice.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', microserviceController.getAllMicroservices);
router.post('/', microserviceController.createMicroservice);

router
    .route('/:id')
    .patch(microserviceController.updateMicroservice)
    .delete(microserviceController.deleteMicroservice);

export default router;