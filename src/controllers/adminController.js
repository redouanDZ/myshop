const db = require('../data/db-connection.js');
const storeConfig = require('../config/storeConfig');

async function getDashboardStats(req, res) {
    try {
        const stats = await db.getAdminDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'خطأ في جلب إحصائيات لوحة التحكم' });
    }
}

async function getPublicConfig(req, res) {
    try {
        res.json({
            storeName: storeConfig.storeName,
            storeTagline: storeConfig.storeTagline,
            storePhone: storeConfig.storePhone,
            storeEmail: storeConfig.storeEmail,
            storeAddress: storeConfig.storeAddress,
            currencySymbol: storeConfig.currencySymbol,
            currencyCode: storeConfig.currencyCode,
            chargilyEnabled: Boolean(storeConfig.chargily.publicKey),
            chargilyPublicKey: storeConfig.chargily.publicKey,
            chargilyMode: storeConfig.chargily.mode
        });
    } catch (error) {
        res.status(500).json({ error: 'خطأ في جلب إعدادات المتجر' });
    }
}

module.exports = {
    getDashboardStats,
    getPublicConfig
};
