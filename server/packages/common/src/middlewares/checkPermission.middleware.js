/**
 * Crea un middleware de verificación de permisos independiente del driver/instancia de DB.
 * 
 * @param {Object} dbPool - Instancia del pool de PostgreSQL (ej. 'pg' Pool).
 * @param {Function} AppErrorClass - Clase de error personalizada del proyecto.
 * @returns {Function} Fábrica de middlewares (resource, action) => (req, res, next)
 */
export const checkPermission = (dbPool, AppErrorClass = Error) => {
    if (!dbPool || typeof dbPool.query !== 'function') {
        throw new Error('checkPermission requiere una instancia válida de dbPool con un método query()');
    }

    return (resource, action) => {
        return async (req, res, next) => {
            try {
                // 1. Verificar autenticación
                if (!req.user) {
                    return next(new AppErrorClass('Usuario no autenticado', 401));
                }

                const userRoles = req.user.user_roles || req.user.roles || [];

                // 2. Extraer nombres de roles de forma defensiva
                const roleNames = userRoles.map(ur => {
                    if (typeof ur === 'string') return ur.toLowerCase();
                    return (ur.role?.name || ur.role_name || ur.name || '').toLowerCase();
                });

                // 3. Evaluar superusuarios y acceso de lectura administrativo
                const isAllMighty = roleNames.some(r => r.includes('allmighty'));
                const isAdmin = roleNames.some(r => r.includes('admin') || r.includes('configurador'));
                const isSiteAdmin = roleNames.some(r => r.includes('siteadmin'));

                if (isAllMighty) return next();
                if ((isAdmin || isSiteAdmin) && action === 'read') return next();

                // 4. Extraer IDs de roles válidos
                const roleIds = userRoles
                    .map(ur => ur.role?.id_role || ur.id_role || ur.id)
                    .filter(Boolean);

                if (!roleIds.length) {
                    return next(new AppErrorClass(`No tienes permiso para ${action} en ${resource}`, 403));
                }

                // 5. Consulta parametrizada a BD
                const permissionResult = await dbPool.query(`
                    SELECT 1
                    FROM role_permissions rp
                    JOIN permissions p ON p.id_permission = rp.id_permission
                    WHERE rp.id_role = ANY($1)
                    AND p.permission_resource = $2
                    AND p.permission_action = $3
                    LIMIT 1
                `, [roleIds, resource, action]);

                if (!permissionResult.rows.length) {
                    return next(new AppErrorClass(`No tienes permiso para ${action} en ${resource}`, 403));
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    };
};