import express from 'express';
import modalityController from '../controllers/modality.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();


router.get('/all-modalities-public', modalityController.getModalities);

router.use(protect, requireContext);

// Rutas con permisos específicos para 'modalities'
router.route('/')
    .get(checkPermission('modalities', 'read'), modalityController.getModalities)
    .post(checkPermission('modalities', 'create'), modalityController.createModality);

router.route('/:id')
    .get(checkPermission('modalities', 'read'), modalityController.getModalityById)
    .put(checkPermission('modalities', 'update'), modalityController.updateModality)
    .patch(checkPermission('modalities', 'update'), modalityController.updateModality)
    .delete(checkPermission('modalities', 'delete'), modalityController.deleteModality);

router.patch('/:id/status', checkPermission('modalities', 'update'), modalityController.changeModalityStatus);

export default router;