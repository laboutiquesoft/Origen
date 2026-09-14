import pool from '../config/db.js';
import { 
    createProtect, 
    createOptionalProtect, 
    checkPermission as createCheckPermission,
    requireContext, 
    restrictTo 
} from '@origen/common';

// Se inyecta la BD local una sola vez
export const protect = createProtect(pool);
export const optionalProtect = createOptionalProtect(pool);
export const checkPermission = createCheckPermission(pool);

// Estos no usan BD, se reexportan tal cual desde @origen/common
export { requireContext, restrictTo };