const mysql = require('mysql2/promise');
const { createMysqlRepository, createFallbackRepository } = require('./repositories/mysql-repository');
const { createStoreService } = require('./services/store-service');

let serviceInstance = null;
let poolInstance = null;

async function initializeDatabase() {
    if (serviceInstance) return serviceInstance;

    const dbConfig = require('../config/database.js').getConfig();
    const connectionConfig = {
        ...dbConfig,
        connectTimeout: 20000,
        charset: 'utf8mb4'
    };

    try {
        poolInstance = mysql.createPool(connectionConfig);
        const repository = createMysqlRepository(poolInstance);
        await repository.initializeSchema();
        serviceInstance = createStoreService(repository);
        return serviceInstance;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        throw error;
    }
}

function buildProxy(methodName) {
    return async (...args) => {
        const service = await initializeDatabase();
        return service[methodName](...args);
    };
}

Object.defineProperty(module.exports, 'pool', {
    get() {
        return poolInstance;
    },
    enumerable: true
});

module.exports = {
    initializeDatabase,
    getProductById: buildProxy('getProductById'),
    getProducts: buildProxy('getProducts'),
    createProduct: buildProxy('createProduct'),
    updateProduct: buildProxy('updateProduct'),
    deleteProduct: buildProxy('deleteProduct'),
    addToCart: buildProxy('addToCart'),
    getCartItems: buildProxy('getCartItems'),
    updateCartItem: buildProxy('updateCartItem'),
    removeCartItem: buildProxy('removeCartItem'),
    createOrder: buildProxy('createOrder'),
    getOrderById: buildProxy('getOrderById'),
    getOrderByNumber: buildProxy('getOrderByNumber'),
    getOrderByTracking: buildProxy('getOrderByTracking'),
    updateOrderStatus: buildProxy('updateOrderStatus'),
    updateOrderPaymentStatus: buildProxy('updateOrderPaymentStatus'),
    getOrderItems: buildProxy('getOrderItems'),
    getOrders: buildProxy('getOrders'),
    createUser: buildProxy('createUser'),
    verifyUserCredentials: buildProxy('verifyUserCredentials'),
    findUserByEmail: buildProxy('findUserByEmail'),
    findUserById: buildProxy('findUserById'),
    updateUserProfile: buildProxy('updateUserProfile'),
    addUserAddress: buildProxy('addUserAddress'),
    deleteUserAddress: buildProxy('deleteUserAddress'),
    getWilayas: buildProxy('getWilayas'),
    getWilayaById: buildProxy('getWilayaById'),
    updateWilayaPrice: buildProxy('updateWilayaPrice'),
    getAdminDashboardStats: buildProxy('getAdminDashboardStats')
};
