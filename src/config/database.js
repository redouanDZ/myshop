/**
 * إعدادات وتكوين قاعدة البيانات
 */
const path = require('path');

const dbEnvironments = {
    development: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'ecommerce_user',
        password: process.env.DB_PASSWORD || (() => {
            throw new Error('DB_PASSWORD environment variable is required.');
        })(),
        database: process.env.DB_NAME || 'ecommerce_store',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        namedPlaceholders: true,
        dateStrings: true,
        multipleStatements: false,
        charset: 'utf8mb4'
    },
    production: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'ecommerce_user',
        password: process.env.DB_PASSWORD || (() => {
            throw new Error('DB_PASSWORD environment variable is required.');
        })(),
        database: process.env.DB_NAME || 'ecommerce_store',
        waitForConnections: true,
        connectionLimit: 3,
        queueLimit: 0,
        namedPlaceholders: true,
        dateStrings: true,
        multipleStatements: false,
        charset: 'utf8mb4'
    },
    test: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'ecommerce_user',
        password: process.env.DB_PASSWORD || (() => {
            throw new Error('DB_PASSWORD environment variable is required.');
        })(),
        database: process.env.DB_NAME || 'ecommerce_store_test',
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
        namedPlaceholders: true,
        dateStrings: true,
        multipleStatements: false,
        charset: 'utf8mb4'
    }
};

module.exports = {
  getConfig: () => {
      const env = process.env.NODE_ENV || 'development';
      return dbEnvironments[env] || dbEnvironments.development;
  },
  isProduction: process.env.NODE_ENV === 'production',
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'myshop_production_jwt_fallback_secret_2026_key_dz',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'myshop_production_cookie_fallback_secret_2026_key_dz',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(o => o.trim()).filter(Boolean)
};
