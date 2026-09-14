import express from 'express';
import permissionController from '../controllers/permission.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('AllMighty')); // Only AllMighty manages permissions directly

router
    .route('/')
    .get(permissionController.getPermissions)
    .post(permissionController.createPermission);

router
    .route('/:id')
    .patch(permissionController.updatePermission)
    .delete(permissionController.deletePermission);

export default router;