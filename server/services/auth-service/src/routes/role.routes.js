import express from 'express';
import roleController from '../controllers/role.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
// Routes
router
    .route('/')
    .get(roleController.getRoles)
    .post(restrictTo('AllMighty', 'Admin', 'SiteAdmin'), roleController.createRole);

router
    .route('/:id')
    .patch(restrictTo('AllMighty', 'Admin', 'SiteAdmin'), roleController.updateRole)
    .delete(restrictTo('AllMighty', 'Admin', 'SiteAdmin'), roleController.deleteRole);

export default router;