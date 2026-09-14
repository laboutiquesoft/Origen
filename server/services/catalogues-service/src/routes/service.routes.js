import express from 'express';
import serviceController from '../controllers/service.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

// Ruta pública si necesitas listar todos los servicios sin autenticación/autorización
// Se puede usar ?include=serviceGroup para incluir los datos del grupo
router.get('/all-services-public', serviceController.getServices);

router.use(protect, requireContext);

// Rutas con permisos específicos para 'services'
router.route('/')
    .get(checkPermission('services', 'read'), serviceController.getServices)
    .post(checkPermission('services', 'create'), serviceController.createService);

router.route('/:id')
    .get(checkPermission('services', 'read'), serviceController.getServiceById)
    .put(checkPermission('services', 'update'), serviceController.updateService)
    .patch(checkPermission('services', 'update'), serviceController.updateService)
    .delete(checkPermission('services', 'delete'), serviceController.deleteService);

router.patch('/:id/status', checkPermission('services', 'update'), serviceController.changeServiceStatus);

export default router;