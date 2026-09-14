// src/routes/complexityRoutes.js
import express from 'express';
import complexityController from '../controllers/complexity.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

// Ruta pública o sin contexto
router.get('/all-complexities', complexityController.getComplexities);

// Todas las rutas debajo de aquí requerirán autenticación y contexto
router.use(protect, requireContext);

// Rutas con permisos específicos para 'complexities'
router.route('/')
    .get(checkPermission('complexities', 'read'), complexityController.getComplexities)
    .post(checkPermission('complexities', 'create'), complexityController.createComplexity);

router.route('/:id')
    .get(checkPermission('complexities', 'read'), complexityController.getComplexityById)
    .put(checkPermission('complexities', 'update'), complexityController.updateComplexity)
    .patch(checkPermission('complexities', 'update'), complexityController.updateComplexity) // Para actualizaciones parciales o completas
    .delete(checkPermission('complexities', 'delete'), complexityController.deleteComplexity);

router.patch('/:id/status', checkPermission('complexities', 'update'), complexityController.changeComplexityStatus);

export default router;