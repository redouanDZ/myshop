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
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const result = await db.getAdminUsers({ search, page: pageNum, limit: limitNum });
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
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const result = await db.getAdminReviews({ status, productId, search, page: pageNum, limit: limitNum });
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

async function getStoreSettings(req, res) {
    try {
        const settings = await db.getStoreSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching store settings:', error);
        res.status(500).json({ error: 'خطأ في جلب إعدادات المتجر' });
    }
}

async function updateStoreSettings(req, res) {
    try {
        const updated = await db.updateStoreSettings(req.body);
        res.json({ message: 'تم حفظ الإعدادات بنجاح', settings: updated });
    } catch (error) {
        console.error('Error updating store settings:', error);
        res.status(500).json({ error: 'خطأ في حفظ الإعدادات' });
    }
}

async function uploadMedia(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
        }
        const fileUrl = req.file.url || `/images/${req.file.filename}`;
        res.status(201).json({
            message: 'تم رفع الملف بنجاح',
            url: fileUrl,
            storageProvider: req.file.storageProvider || 'local'
        });
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ error: 'خطأ أثناء رفع الملف' });
    }
}

async function updateUserRole(req, res) {
    try {
        const userId = parseInt(req.params.id, 10);
        const { role } = req.body;
        if (isNaN(userId)) return res.status(400).json({ error: 'معرف المستخدم غير صالح' });
        if (!['customer', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'نوع الدور غير صالح (customer أو admin)' });
        }

        // Safety: Prevent admin from changing their own role to prevent lockout
        if (req.userId && Number(req.userId) === userId && role !== 'admin') {
            return res.status(400).json({ error: 'لا يمكنك تغيير صلاحيات حسابك الخاص كمسؤول' });
        }

        const success = await db.updateUserRole(userId, role);
        if (!success) return res.status(404).json({ error: 'المستخدم غير موجود' });
        res.json({ message: 'تم تحديث دور المستخدم بنجاح' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'خطأ في تحديث دور المستخدم' });
    }
}

async function deleteUser(req, res) {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) return res.status(400).json({ error: 'معرف المستخدم غير صالح' });

        // Safety: Prevent admin from deleting their own account
        if (req.userId && Number(req.userId) === userId) {
            return res.status(400).json({ error: 'لا يمكنك حذف حسابك الخاص كمسؤول' });
        }

        const success = await db.deleteUser(userId);
        if (!success) return res.status(404).json({ error: 'المستخدم غير موجود' });
        res.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'خطأ في حذف المستخدم' });
    }
}

// --- Categories Handlers ---
async function getCategories(req, res) {
    try {
        const categories = await db.getCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'خطأ في جلب الأقسام' });
    }
}

async function getCategoryById(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'معرف القسم غير صالح' });
        const category = await db.getCategoryById(id);
        if (!category) return res.status(404).json({ error: 'القسم غير موجود' });
        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'خطأ في جلب بيانات القسم' });
    }
}

async function createCategory(req, res) {
    try {
        const { name, slug } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ error: 'اسم القسم مطلوب' });
        }
        const id = await db.createCategory({ name: String(name).trim(), slug });
        res.status(201).json({ message: 'تم إنشاء القسم بنجاح', id });
    } catch (error) {
        console.error('Error creating category:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'اسم القسم أو الرابط المرجعي موجود بالفعل' });
        }
        res.status(500).json({ error: error.message || 'خطأ في إنشاء القسم' });
    }
}

async function updateCategory(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'معرف القسم غير صالح' });
        const success = await db.updateCategory(id, req.body);
        if (!success) return res.status(404).json({ error: 'القسم غير موجود' });
        res.json({ message: 'تم تحديث القسم بنجاح' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'خطأ في تحديث القسم' });
    }
}

async function deleteCategory(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'معرف القسم غير صالح' });
        const success = await db.deleteCategory(id);
        if (!success) return res.status(404).json({ error: 'القسم غير موجود' });
        res.json({ message: 'تم حذف القسم بنجاح' });
    } catch (error) {
        console.error('Error deleting category:', error);
        if (error.code === 'CATEGORY_HAS_PRODUCTS') {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'خطأ في حذف القسم' });
    }
}

async function testTelegramAlert(req, res) {
    try {
        const { botToken, chatId } = req.body || {};
        const telegramService = require('../services/telegramService');
        const settings = await db.getStoreSettings().catch(() => ({}));
        const token = botToken || settings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
        const id = chatId || settings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

        if (!token || !id) {
            return res.status(400).json({ error: 'يرجى تقديم رمز البوت (Bot Token) ومعرّف المحادثة (Chat ID)' });
        }

        const result = await telegramService.sendTestAlert(token, id);
        if (!result.success) {
            return res.status(400).json({ error: result.error || 'فشل إرسال رسالة الاختبار إلى تيليجرام' });
        }

        res.json({ message: 'تم إرسال رسالة الاختبار بنجاح إلى حساب التيليجرام الخاص بك!' });
    } catch (error) {
        console.error('Error sending test Telegram message:', error);
        res.status(500).json({ error: error.message || 'خطأ أثناء اختبار إشعارات تيليجرام' });
    }
}

module.exports = {
    getDashboardStats,
    getPublicConfig,
    getAdminUsers,
    getAdminUserById,
    updateUserRole,
    deleteUser,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getAdminCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAdminReviews,
    updateReviewStatus,
    deleteReview,
    getStoreSettings,
    updateStoreSettings,
    uploadMedia,
    testTelegramAlert
};
