import express from 'express';
import cupsController from '../controllers/cups.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

// Ruta pública para obtener los CUPS actuales
// No requiere autenticación, es de solo lectura del catálogo vigente
router.get('/current', cupsController.getCurrentCups);
router.get('/by-code/:cupsCode', cupsController.getCupsByCode); // Puede ser pública también si solo devuelve info del CUPS vigente

router.use(protect, requireContext); // Aplica middlewares de autenticación y contexto a las rutas siguientes

// Rutas con permisos específicos para 'cups'
router.route('/')
    .get(checkPermission('cups', 'read'), cupsController.getCups) // Obtiene todos los CUPS (de todas las resoluciones)
    .post(checkPermission('cups', 'create'), cupsController.createCups);

router.route('/:id')
    .get(checkPermission('cups', 'read'), cupsController.getCupsById)
    .put(checkPermission('cups', 'update'), cupsController.updateCups)
    .patch(checkPermission('cups', 'update'), cupsController.updateCups)
    .delete(checkPermission('cups', 'delete'), cupsController.deleteCups);

router.patch('/:id/status', checkPermission('cups', 'update'), cupsController.changeCupsStatus);

export default router;