/**
 * إعدادات وتكوين قاعدة البيانات
 */
const path = require('path');
const dbConfig = require('../../config/database.js');

module.exports = {
  getConfig: () => dbConfig.getConfig(),
  isProduction: process.env.NODE_ENV === 'production',
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => {
    throw new Error('JWT_SECRET environment variable is required in production.');
  })() : 'development-only-secret-change-me'),
  COOKIE_SECRET: process.env.COOKIE_SECRET || (process.env.NODE_ENV === 'production' ? (() => {
    throw new Error('COOKIE_SECRET environment variable is required in production.');
  })() : 'development-cookie-secret-change-me'),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(o => o.trim()).filter(Boolean)
};
