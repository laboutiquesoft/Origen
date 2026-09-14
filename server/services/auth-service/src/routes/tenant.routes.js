import express from 'express';
import tenantController from '../controllers/tenant.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { AppError, validate } from '@origen/common';
import { createTenantSchema } from '../validations/tenant.validation.js';

const router = express.Router();

// Only AllMighty can manage tenants
// Protect all routes
router.use(protect);

router
    .route('/')
    .get(restrictTo('AllMighty'), tenantController.getAllTenants)
    .post(restrictTo('AllMighty'), validate(createTenantSchema), tenantController.createTenant);

router
    .route('/:id')
    .get((req, res, next) => {
        // Any authenticated user can see their own tenant
        if (req.user.user_roles.some(ur => ur.role.name === 'AllMighty')) return next();
        if (req.user.id_tenant === req.params.id) return next();
        return next(new AppError('No tienes permiso para acceder a esta institución', 403));
    }, tenantController.getTenant)
    .patch(restrictTo('AllMighty', 'Admin'), tenantController.updateTenant)
    .delete(restrictTo('AllMighty'), tenantController.deleteTenant);

// Microservice management for Tenant
router
    .route('/:id/microservices')
    .post(restrictTo('AllMighty'), tenantController.updateMicroservices);

router
    .route('/:id/dashboard-stats')
    .get((req, res, next) => {
        // Any authenticated user of the tenant should be able to see dashboard stats
        if (req.user.user_roles.some(ur => ur.role.name === 'AllMighty')) return next();
        if (req.user.id_tenant === req.params.id) return next();
        return next(new AppError('No tienes permiso para acceder a las estadísticas de esta institución', 403));
    }, tenantController.getDashboardStats);

export default router;