import express from 'express';
import siteController from '../controllers/site.controller.js';
import { protect, restrictTo, requireContext } from '../middlewares/auth.middleware.js';
import { validate } from '@origen/common';
import { createSiteSchema, updateSiteSchema } from '../validations/site.validation.js';

const router = express.Router();

router.use(protect);
router.use(requireContext);

router
    .route('/')
    .get(siteController.getAllSites)
    .post(restrictTo('AllMighty', 'Admin'), validate(createSiteSchema), siteController.createSite);

router
    .route('/:id')
    .get(siteController.getSite)
    .patch(restrictTo('AllMighty', 'Admin'), validate(updateSiteSchema), siteController.updateSite)
    .delete(restrictTo('AllMighty', 'Admin'), siteController.deleteSite);

export default router;