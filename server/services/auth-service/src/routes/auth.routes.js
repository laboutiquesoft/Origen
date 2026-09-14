import express from 'express';
import authController from '../controllers/auth.controller.js';
import { loginSchema } from '../validations/auth.validation.js';
import { validate } from '@origen/common';

import { protect, optionalProtect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', optionalProtect, authController.getCurrentUser);
router.post('/switch-context', protect, authController.switchContext);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

export default router;