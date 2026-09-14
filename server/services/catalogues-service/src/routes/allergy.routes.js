// src/routes/allergyRoutes.js
import express from 'express';
import allergyController from '../controllers/allergy.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';
const router = express.Router();

router.get('/all-alergies', allergyController.getAllergies);

router.use(protect, requireContext);

// Ejemplo de rutas con autenticación y autorización
router.route('/')
    .get(protect, checkPermission('allergies', 'read'), allergyController.getAllergies)
    .post(protect, checkPermission('allergies', 'create'), allergyController.createAllergy)
    

router.route('/:id')
    .get(protect, checkPermission('allergies', 'read'), allergyController.getAllergyById)
    .put(protect, checkPermission('allergies', 'update'), allergyController.updateAllergy)
    .patch(protect, checkPermission('allergies', 'update'), allergyController.updateAllergy) // Para actualizaciones parciales o completas
    .delete(protect, checkPermission('allergies', 'delete'), allergyController.deleteAllergy);

    
export default router;