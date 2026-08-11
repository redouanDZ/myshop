/**
 * إعدادات قاعدة البيانات
 * يومل هذا الملف إعدادات الاتصال بقاعدة البيانات
 */

module.exports = {
    development: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'ecommerce_user',
        password: process.env.DB_PASSWORD || '***REMOVED***',
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
        password: process.env.DB_PASSWORD || '***REMOVED***',
        database: process.env.DB_NAME || 'ecommerce_store',
        waitForConnections: true,
        connectionLimit: 20,
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
        password: process.env.DB_PASSWORD || '***REMOVED***',
        database: process.env.DB_NAME || 'ecommerce_store_test',
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
        namedPlaceholders: true,
        dateStrings: true,
        multipleStatements: false,
        charset: 'utf8mb4'
    },

    getConfig: function() {
        const env = process.env.NODE_ENV || 'development';
        return this[env] || this.development;
    }
};
