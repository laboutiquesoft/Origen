import express from 'express';
import specialtyController from '../controllers/specialty.controller.js'; // Asegúrate de que esta ruta sea correcta
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

// Ruta pública para obtener todas las especialidades sin autenticación/autorización
router.get('/all-specialties-public', specialtyController.getSpecialties);

router.use(protect, requireContext); // Aplica middlewares de autenticación y contexto a las rutas siguientes

// Rutas con permisos específicos para 'specialties'
router.route('/')
    .get(checkPermission('specialties', 'read'), specialtyController.getSpecialties)
    .post(checkPermission('specialties', 'create'), specialtyController.createSpecialty);

router.route('/:id')
    .get(checkPermission('specialties', 'read'), specialtyController.getSpecialtyById)
    .put(checkPermission('specialties', 'update'), specialtyController.updateSpecialty)
    .patch(checkPermission('specialties', 'update'), specialtyController.updateSpecialty)
    .delete(checkPermission('specialties', 'delete'), specialtyController.deleteSpecialty);

router.patch('/:id/status', checkPermission('specialties', 'update'), specialtyController.changeSpecialtyStatus);

export default router;