import express from 'express';
import serviceGroupController from '../controllers/serviceGroup.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

// Ruta pública si necesitas listar todos los grupos sin autenticación/autorización
router.get('/all-service-groups-public', serviceGroupController.getServiceGroups);

router.use(protect, requireContext);

// Rutas con permisos específicos para 'serviceGroups'
router.route('/')
    .get(checkPermission('serviceGroups', 'read'), serviceGroupController.getServiceGroups)
    .post(checkPermission('serviceGroups', 'create'), serviceGroupController.createServiceGroup);

router.route('/:id')
    .get(checkPermission('serviceGroups', 'read'), serviceGroupController.getServiceGroupById)
    .put(checkPermission('serviceGroups', 'update'), serviceGroupController.updateServiceGroup)
    .patch(checkPermission('serviceGroups', 'update'), serviceGroupController.updateServiceGroup)
    .delete(checkPermission('serviceGroups', 'delete'), serviceGroupController.deleteServiceGroup);

router.patch('/:id/status', checkPermission('serviceGroups', 'update'), serviceGroupController.changeServiceGroupStatus);

export default router;