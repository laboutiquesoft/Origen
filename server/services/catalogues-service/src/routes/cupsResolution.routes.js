import express from 'express';
import cupsResolutionController from '../controllers/cupsResolution.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

router.use(protect, requireContext); // Aplica middlewares de autenticación y contexto a todas las rutas de resolución

// Rutas con permisos específicos para 'cups_resolutions'
router.route('/')
    .get(checkPermission('cups_resolutions', 'read'), cupsResolutionController.getResolutions)
    .post(checkPermission('cups_resolutions', 'create'), cupsResolutionController.createResolution);

router.route('/:id')
    .get(checkPermission('cups_resolutions', 'read'), cupsResolutionController.getResolutionById)
    .put(checkPermission('cups_resolutions', 'update'), cupsResolutionController.updateResolution)
    .patch(checkPermission('cups_resolutions', 'update'), cupsResolutionController.updateResolution)
    .delete(checkPermission('cups_resolutions', 'delete'), cupsResolutionController.deleteResolution);

router.patch('/:id/status', checkPermission('cups_resolutions', 'update'), cupsResolutionController.changeResolutionStatus);

export default router;