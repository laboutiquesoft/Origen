import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

import allergyRoutes from './routes/allergy.routes.js';
import complexityRoutes from './routes/complexity.routes.js';
import countryRoutes from './routes/country.routes.js';
import epsRoutes from './routes/eps.routes.js';
import modalityRoutes from './routes/modality.routes.js';
import serviceGroupRoutes from './routes/serviceGroup.routes.js';
import serviceRoutes from './routes/service.routes.js';
import specialtyRoutes from './routes/specialty.routes.js';
import specificityRoutes from './routes/specificity.routes.js';
import cupsResolutionRoutes from './routes/cupsResolution.routes.js';
import cupsRoutes from './routes/cups.routes.js';
import currentCupsVersionRoutes from './routes/currentCupsVersion.routes.js';
import medicalProcedureRoutes from './routes/medicalProcedure.routes.js';
import { globalErrorHandler } from '@origen/common';

import db from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://192.168.80.16:5173',
      'http://192.168.80.16:5174'
    ];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    next();
});

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log('--- 🔍 CATALOGUES REQ DEBUG ---');
    console.log(`[REQ] ${req.method} ${req.url}`);
    console.log(`[ORIGIN]`, req.headers.origin);
    console.log(`[RAW COOKIES]`, req.headers.cookie);
    console.log(`[PARSED COOKIES]`, req.cookies);
    console.log('--------------------------------');
    next();
});


// -------------------------------------------------------------
// 2. HELMET
// -------------------------------------------------------------
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 10000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Documentación Swagger
let swaggerDocument;
try {
    swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
    console.warn('⚠️ No se pudo cargar swagger.yaml:', err.message);
}

// Rutas de prueba
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Catalogue microservice is running' });
});

app.get('/db-test', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({
            status: 'OK',
            message: 'Database connection successful - Catalogue module',
            time: result.rows[0].now
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            status: 'Error',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Rutas de la API
app.use('/api/v1/catalogues/allergies', allergyRoutes);
app.use('/api/v1/catalogues/complexities', complexityRoutes);
app.use('/api/v1/catalogues/countries', countryRoutes);
app.use('/api/v1/catalogues/eps', epsRoutes);
app.use('/api/v1/catalogues/modalities', modalityRoutes);
app.use('/api/v1/catalogues/service-groups', serviceGroupRoutes);
app.use('/api/v1/catalogues/services', serviceRoutes);
app.use('/api/v1/catalogues/specialties', specialtyRoutes);
app.use('/api/v1/catalogues/specificities', specificityRoutes);
app.use('/api/v1/catalogues/cups-resolutions', cupsResolutionRoutes);
app.use('/api/v1/catalogues/cups', cupsRoutes);
app.use('/api/v1/catalogues/current-cups-version', currentCupsVersionRoutes);
app.use('/api/v1/catalogues/medical-procedures', medicalProcedureRoutes);

// Manejo global de errores
app.use(globalErrorHandler);

app.use((err, req, res, next) => {
    console.error(`💥 [ERROR CATALOGUES] ${req.method} ${req.originalUrl}:`, err.message);
    console.error(err.stack);

    // Asegurar que las respuestas de error SIEMPRE incluyan los headers CORS
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');

    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

export default app;