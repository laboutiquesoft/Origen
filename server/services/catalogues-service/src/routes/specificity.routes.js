import express from 'express';
import specificityController from '../controllers/specificity.controller.js'; // Asegúrate de que esta ruta sea correcta
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

// Ruta pública para obtener todas las especificidades sin autenticación/autorización
router.get('/all-specificities-public', specificityController.getSpecificities);

router.use(protect, requireContext); // Aplica middlewares de autenticación y contexto a las rutas siguientes

// Rutas con permisos específicos para 'specificities'
router.route('/')
    .get(checkPermission('specificities', 'read'), specificityController.getSpecificities)
    .post(checkPermission('specificities', 'create'), specificityController.createSpecificity);

router.route('/:id')
    .get(checkPermission('specificities', 'read'), specificityController.getSpecificityById)
    .put(checkPermission('specificities', 'update'), specificityController.updateSpecificity)
    .patch(checkPermission('specificities', 'update'), specificityController.updateSpecificity)
    .delete(checkPermission('specificities', 'delete'), specificityController.deleteSpecificity);

router.patch('/:id/status', checkPermission('specificities', 'update'), specificityController.changeSpecificityStatus);

export default router;