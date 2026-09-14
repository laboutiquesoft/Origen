import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware.js';

/**
 * Fábrica de middleware 'protect' que recibe la instancia del pool de BD del microservicio.
 * Permite mantener las consultas SQL a users, roles y sites dentro del paquete común.
 */
export const createProtect = (pool) => async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 1️⃣ Buscar usuario
        const userResult = await pool.query(
            `SELECT * FROM users WHERE id_user = $1`,
            [decoded.id]
        );

        if (!userResult.rows.length) {
            return next(new AppError('The user belonging to this token does no longer exist.', 401));
        }

        const user = userResult.rows[0];

        // 2️⃣ Traer roles
        const rolesResult = await pool.query(`
            SELECT r.*
            FROM user_roles ur
            JOIN roles r ON r.id_role = ur.id_role
            WHERE ur.id_user = $1
        `, [user.id_user]);

        // 3️⃣ Traer sites
        const sitesResult = await pool.query(`
            SELECT s.*
            FROM user_sites us
            JOIN sites s ON s.id_site = us.id_site
            WHERE us.id_user = $1
        `, [user.id_user]);

        user.user_roles = rolesResult.rows.map(role => ({
            role: {
                ...role,
                name: role.role_name // Alias for compatibility with services
            }
        }));

        user.user_sites = sitesResult.rows;

        req.user = user;

        next();
    } catch (error) {
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
};

/**
 * Middleware para extraer el contexto (Tenant / Site) de la petición.
 * No requiere interacción con la BD.
 */
export const requireContext = (req, res, next) => {
    let tid, sid;

    const headerTid = req.headers['x-tenant-id'];
    const headerSid = req.headers['x-site-id'];
    const queryTid = req.query.tenantId || req.query.id_tenant;
    const querySid = req.query.siteId || req.query.id_site;

    if (req.cookies?.ctx && req.cookies.ctx !== 'loggedout') {
        try {
            const decodedCtx = jwt.verify(req.cookies.ctx, process.env.JWT_SECRET);
            tid = decodedCtx.tid;
            sid = decodedCtx.sid;
        } catch (err) {
            // Silently ignore invalid context cookies as fallback
        }
    }

    const userRoles = (req.user?.user_roles || []).map(ur => ur.role.name);
    const isAllMighty = userRoles.includes('AllMighty');
    const isAdmin = userRoles.includes('Admin');

    const userTenantId = req.user ? req.user.id_tenant : null;

    // PRIORIDADES: Query > Header > Cookie > Profile Fallback
    let finalTid = (queryTid !== undefined) ? queryTid : headerTid;
    if (finalTid === undefined) finalTid = tid;

    if (finalTid === undefined) finalTid = isAllMighty ? null : userTenantId;

    req.tenantId = finalTid;

    let finalSid = (querySid !== undefined) ? querySid : headerSid;
    if (finalSid === undefined) finalSid = sid;
    req.siteId = finalSid;

    if (!req.user) {
        return next(new AppError('Sesión requerida para esta operación.', 401));
    }

    // Auto-populate siteId si es el único
    if (!req.siteId && req.user.user_sites?.length === 1 && !isAllMighty) {
        req.siteId = req.user.user_sites[0].id_site;
    }

    // AllMighty bypass total si no hay tenantId (global operations)
    if (isAllMighty && !req.tenantId) {
        return next();
    }

    if (!req.tenantId) {
        return next(new AppError('Seleccione un tenant para continuar.', 401));
    }

    // Si solo consultamos la raíz (sitios), solo necesitamos el tenant
    if ((req.path === '/' || req.path === '/sites') && req.method === 'GET' && !req.siteId) {
        return next();
    }

    // Validación final
    if (!isAllMighty && !isAdmin && !req.siteId) {
        return next(new AppError('Seleccione una sede para continuar.', 401));
    }

    next();
};

/**
 * Fábrica de middleware 'optionalProtect' que recibe el pool de BD.
 */
export const createOptionalProtect = (pool) => async (req, res, next) => {
    let token;

    if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userResult = await pool.query(
            `SELECT * FROM users WHERE id_user = $1`,
            [decoded.id]
        );

        if (!userResult.rows.length) return next();

        const user = userResult.rows[0];

        const rolesResult = await pool.query(`
            SELECT r.*
            FROM user_roles ur
            JOIN roles r ON r.id_role = ur.id_role
            WHERE ur.id_user = $1
        `, [user.id_user]);

        user.user_roles = rolesResult.rows.map(role => ({
            role: {
                ...role,
                name: role.role_name // Alias for compatibility
            }
        }));

        req.user = user;

        next();
    } catch (error) {
        next();
    }
};

/**
 * Restringe acceso según roles definidos.
 */
export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.user_roles) {
            return next(new AppError('No roles found for this user', 403));
        }

        const userRoles = req.user.user_roles.map(r => r.role.name);

        // AllMighty bypass
        if (userRoles.some(role => role?.toLowerCase() === 'allmighty')) {
            return next();
        }

        if (!allowedRoles.some(role => userRoles.includes(role))) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};


/**
 * Fábrica de middleware para verificar permisos en base de datos.
 */
// export const createCheckPermission = (pool) => (resource, action) => {
//     return async (req, res, next) => {
//         const userRoles = req.user.user_roles;
//         const roleNames = userRoles.map(ur => ur.role?.name?.toLowerCase() || ur.role_name?.toLowerCase());

//         const isAllMighty = roleNames.includes('allmighty');
//         const isAdmin = roleNames.includes('admin');
//         const isSiteAdmin = roleNames.includes('siteadmin');

//         if (isAllMighty) return next();

//         // Admin and SiteAdmin can read by default
//         if ((isAdmin || isSiteAdmin) && action === 'read') return next();

//         const roleIds = userRoles.map(r => r.role.id_role);

//         if (!roleIds.length) {
//             return next(new AppError(`No tienes permiso para ${action} en ${resource}`, 403));
//         }

//         const permissionResult = await pool.query(`
//             SELECT 1
//             FROM role_permissions rp
//             JOIN permissions p ON p.id_permission = rp.id_permission
//             WHERE rp.id_role = ANY($1)
//             AND p.permission_resource = $2
//             AND p.permission_action = $3
//             LIMIT 1
//         `, [roleIds, resource, action]);

//         if (!permissionResult.rows.length) {
//             return next(new AppError(`No tienes permiso para ${action} en ${resource}`, 403));
//         }

//         next();
//     };
// };