// src/routes/countryRoutes.js
import express from 'express';
import countryController from '../controllers/country.controller.js';
import { checkPermission, protect, restrictTo, requireContext } from '../middlewares/catalogues.middleware.js';

const router = express.Router();

// Si necesitas una ruta pública para todos los países (sin orden especial, o el orden por defecto del repo)
router.get('/all-countries-public', countryController.getCountries); // 

router.use(protect, requireContext);

// Rutas con permisos específicos para 'countries'
router.route('/')
    .get(checkPermission('countries', 'read'), countryController.getCountries) // Este usará el orden especial
    .post(checkPermission('countries', 'create'), countryController.createCountry);

router.route('/:id')
    .get(checkPermission('countries', 'read'), countryController.getCountryById)
    .put(checkPermission('countries', 'update'), countryController.updateCountry)
    .patch(checkPermission('countries', 'update'), countryController.updateCountry)
    .delete(checkPermission('countries', 'delete'), countryController.deleteCountry);

router.patch('/:id/status', checkPermission('countries', 'update'), countryController.changeCountryStatus);

export default router;