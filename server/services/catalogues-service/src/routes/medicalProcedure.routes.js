import express from 'express';
import medicalProcedureController from '../controllers/medicalProcedure.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

router.get('/all-medical-procedures-public', medicalProcedureController.getMedicalProcedures);

router.use(protect, requireContext); // Aplica middlewares de autenticación y contexto a todas las rutas

// Rutas con permisos específicos para 'medical_procedures'
router.route('/')
    .get(checkPermission('medical_procedures', 'read'), medicalProcedureController.getMedicalProcedures)
    .post(checkPermission('medical_procedures', 'create'), medicalProcedureController.createMedicalProcedure);

router.route('/:id')
    .get(checkPermission('medical_procedures', 'read'), medicalProcedureController.getMedicalProcedureById)
    .put(checkPermission('medical_procedures', 'update'), medicalProcedureController.updateMedicalProcedure)
    .patch(checkPermission('medical_procedures', 'update'), medicalProcedureController.updateMedicalProcedure)
    .delete(checkPermission('medical_procedures', 'delete'), medicalProcedureController.deleteMedicalProcedure);

router.patch('/:id/status', checkPermission('medical_procedures', 'update'), medicalProcedureController.changeMedicalProcedureStatus);

export default router;