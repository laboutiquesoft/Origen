import express from 'express';
import epsController from '../controllers/eps.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

router.get('/all-eps-public', epsController.getEps);

router.use(protect, requireContext);

// Rutas con permisos específicos para 'eps'
router.route('/')
    .get(checkPermission('eps', 'read'), epsController.getEps)
    .post(checkPermission('eps', 'create'), epsController.createEps);

router.route('/:id')
    .get(checkPermission('eps', 'read'), epsController.getEpsById)
    .put(checkPermission('eps', 'update'), epsController.updateEps)
    .patch(checkPermission('eps', 'update'), epsController.updateEps)
    .delete(checkPermission('eps', 'delete'), epsController.deleteEps);

router.patch('/:id/status', checkPermission('eps', 'update'), epsController.changeEpsStatus);

export default router;