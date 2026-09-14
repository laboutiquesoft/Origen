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
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './src/config/config.js';
import authRoutes from './src/routes/auth.routes.js';
import tenantRoutes from './src/routes/tenant.routes.js';
import roleRoutes from './src/routes/role.routes.js';
import permissionRoutes from './src/routes/permission.routes.js';
import userRoutes from './src/routes/user.routes.js';
import microserviceRoutes from './src/routes/microservice.routes.js';
import siteRoutes from './src/routes/site.routes.js';
import { globalErrorHandler } from '@origen/common';

import db from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bannerPath = path.join(__dirname, './banner.txt');
const banner = fs.readFileSync(bannerPath, 'utf8');

const app = express();

const PORT = config.PORT || 3000;

// 1. Core Security & Logging
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan('dev'));

const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',') 
  : [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://192.168.80.16:5173'
    ];

// 2. CORS - Must be BEFORE Limiter
app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como Postman o curl) o en la lista blanca
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // En desarrollo puedes permitir todo o lanzar error
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Swagger Documentation
const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. Rate Limiter - Protect against brute force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        status: 'Error',
        message: 'Has sobrepasado el límite de peticiones. Por favor intenta en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// 5. Parsers
app.use(express.json());
app.use(cookieParser());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Auth microservice is running' });
});

// Route to test database connection
app.get('/db-test', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({
            status: 'OK',
            message: 'Database connection successful',
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/microservices', microserviceRoutes);
app.use('/api/sites', siteRoutes);

// Error Handler
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
    console.log(banner);
    console.log(`Auth microservice running on port ${PORT}`);
});

export default app;
