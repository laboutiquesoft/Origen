import express from 'express';
import currentCupsVersionController from '../controllers/currentCupsVersion.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

// Ruta para obtener la versión actual (puede ser de lectura pública si se desea,
// pero por seguridad y para fines de administración, la mantendremos privada por ahora)
router.get('/', protect, requireContext, checkPermission('current_cups_version', 'read'), currentCupsVersionController.getCurrentCupsVersion);

// Ruta para establecer la versión actual (siempre privada y con permisos de admin)
router.post('/', protect, requireContext, checkPermission('current_cups_version', 'update'), currentCupsVersionController.setCurrentCupsVersion);

export default router;