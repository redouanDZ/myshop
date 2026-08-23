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

// --- Customers Handlers ---
async function getAdminUsers(req, res) {
    try {
        const { search, page, limit } = req.query;
        const result = await db.getAdminUsers({ search, page, limit });
        res.json(result);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ error: 'خطأ في جلب قائمة العملاء' });
    }
}

async function getAdminUserById(req, res) {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) return res.status(400).json({ error: 'معرف المستخدم غير صالح' });
        const user = await db.getAdminUserById(userId);
        if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching admin user details:', error);
        res.status(500).json({ error: 'خطأ في جلب بيانات العميل' });
    }
}

// --- Coupons Handlers ---
async function getAdminCoupons(req, res) {
    try {
        const { search, status } = req.query;
        const coupons = await db.getCoupons({ search, status });
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'خطأ في جلب قسائم الخصم' });
    }
}

async function createCoupon(req, res) {
    try {
        const { code, discountPercent, discountAmount, minOrderAmount, maxUses, status, expiresAt } = req.body;
        if (!code || !String(code).trim()) {
            return res.status(400).json({ error: 'رمز الكوبون مطلوب' });
        }
        const cleanCode = String(code).trim().toUpperCase();
        const existing = await db.getCouponByCode(cleanCode);
        if (existing) {
            return res.status(400).json({ error: 'رمز الكوبون موجود بالفعل' });
        }

        const id = await db.createCoupon({
            code: cleanCode,
            discountPercent: Number(discountPercent) || 0,
            discountAmount: Number(discountAmount) || 0,
            minOrderAmount: Number(minOrderAmount) || 0,
            maxUses: Number(maxUses) || 100,
            status: status || 'active',
            expiresAt: expiresAt || null
        });

        res.status(201).json({ message: 'تم إنشاء قسيمة الخصم بنجاح', id });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: error.message || 'خطأ في إنشاء قسيمة الخصم' });
    }
}

async function updateCoupon(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'معرف الكوبون غير صالح' });
        const success = await db.updateCoupon(id, req.body);
        if (!success) return res.status(404).json({ error: 'الكوبون غير موجود' });
        res.json({ message: 'تم تحديث الكوبون بنجاح' });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ error: 'خطأ في تحديث الكوبون' });
    }
}

async function deleteCoupon(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'معرف الكوبون غير صالح' });
        const success = await db.deleteCoupon(id);
        if (!success) return res.status(404).json({ error: 'الكوبون غير موجود' });
        res.json({ message: 'تم حذف الكوبون بنجاح' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ error: 'خطأ في حذف الكوبون' });
    }
}

// --- Reviews Handlers ---
async function getAdminReviews(req, res) {
    try {
        const { status, productId, search, page, limit } = req.query;
        const result = await db.getAdminReviews({ status, productId, search, page, limit });
        res.json(result);
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        res.status(500).json({ error: 'خطأ في جلب التقييمات' });
    }
}

async function updateReviewStatus(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const { status } = req.body;
        if (isNaN(id)) return res.status(400).json({ error: 'معرف التقييم غير صالح' });
        if (!['approved', 'pending', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'حالة التقييم غير صالحة' });
        }
        const success = await db.updateReviewStatus(id, status);
        if (!success) return res.status(404).json({ error: 'التقييم غير موجود' });
        res.json({ message: 'تم تحديث حالة التقييم بنجاح' });
    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ error: 'خطأ في تحديث حالة التقييم' });
    }
}

async function deleteReview(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'معرف التقييم غير صالح' });
        const success = await db.deleteReview(id);
        if (!success) return res.status(404).json({ error: 'التقييم غير موجود' });
        res.json({ message: 'تم حذف التقييم بنجاح' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'خطأ في حذف التقييم' });
    }
}

module.exports = {
    getDashboardStats,
    getPublicConfig,
    getAdminUsers,
    getAdminUserById,
    getAdminCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAdminReviews,
    updateReviewStatus,
    deleteReview
};
