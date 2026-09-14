import express from 'express';
import userController from '../controllers/user.controller.js';
import { protect, restrictTo, requireContext } from '../middlewares/auth.middleware.js';
import { validate } from '@origen/common';
import { createUserSchema, updateUserSchema } from '../validations/user.validation.js';

const router = express.Router();

router.use(protect);
router.use(requireContext);

// Routes restricted to AllMighty and Admin
router.use(restrictTo('AllMighty', 'Admin'));

router
    .route('/')
    .get(userController.getUsers)
    .post(validate(createUserSchema), userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(validate(updateUserSchema), userController.updateUser)
    .delete(userController.deleteUser);

export default router;