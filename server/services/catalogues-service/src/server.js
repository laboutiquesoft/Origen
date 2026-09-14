import app from './app.js';
import config from './config/config.js';
import pool from './config/db.js';

const PORT = config.PORT || 3001;

console.log('[LOG-DIAGNOSTICO] 1. Intentando iniciar servidor HTTP...');

const server = app.listen(PORT, () => {
    console.log(`[LOG-DIAGNOSTICO] 2. Catalogue microservice corriendo en puerto ${PORT}`);
    
    // Probar consulta explicita a la base de datos para validar conexion
    pool.query('SELECT NOW()')
        .then(res => {
            console.log('[LOG-DIAGNOSTICO] 3. Conexion DB verificada con exito:', res.rows[0].now);
        })
        .catch(err => {
            console.error('[LOG-DIAGNOSTICO] ERROR en consulta de prueba DB:', err.message);
        });
});

// Temporizador activo para impedir que el Event Loop quede vacio
const keepAliveInterval = setInterval(() => {
    // Mantiene un recurso activo en el Event Loop
}, 10000);

// Rastreo de terminacion de proceso
process.on('beforeExit', (code) => {
    console.log(`[LOG-DIAGNOSTICO] ALERTA: Node.js vació el Event Loop. Proceso por finalizar con código: ${code}`);
});

process.on('exit', (code) => {
    console.log(`[LOG-DIAGNOSTICO] PROCESO FINALIZADO. Código de salida: ${code}`);
});

// Manejo de señales de terminación
process.on('SIGINT', () => {
    console.log('[LOG-DIAGNOSTICO] Recibida señal SIGINT (Ctrl+C). Cerrando...');
    clearInterval(keepAliveInterval);
    server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
    console.log('[LOG-DIAGNOSTICO] Recibida señal SIGTERM. Cerrando...');
    clearInterval(keepAliveInterval);
    server.close(() => process.exit(0));
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[LOG-DIAGNOSTICO] EXCEPCIÓN NO CAPTURADA (Promise Rejection):', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[LOG-DIAGNOSTICO] EXCEPCIÓN NO CAPTURADA (Uncaught Exception):', error);
});