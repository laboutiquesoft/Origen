import dotenv from 'dotenv';
dotenv.config();

const config = {
    PORT: process.env.PORT || 3001,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN || 1,
    SMTP: {
        HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
        PORT: process.env.SMTP_PORT || 587,
        USER: process.env.SMTP_USER,
        PASS: process.env.SMTP_PASS
    },
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    DB: {
        USER: process.env.DB_USER,
        HOST: process.env.DB_HOST,
        DATABASE: process.env.DB_NAME,
        PASSWORD: process.env.DB_PASSWORD,
        PORT: process.env.DB_PORT || 5432
    }
};

export default config;