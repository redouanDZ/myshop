const db = require('../data/db-connection.js');
const { validatePositiveInteger, validateId } = require('../utils/helpers');

async function addToCart(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'يجب تسجيل الدخول لإضافة منتجات إلى السلة' });
        }

        const productId = validateId(req.body.productId);
        if (!productId) {
            return res.status(400).json({ error: 'معرّف المنتج غير صالح' });
        }

        const quantity = validatePositiveInteger(req.body.quantity, 1, 100);
        if (!quantity) {
            return res.status(400).json({ error: 'الكمية غير صالحة (يجب أن تكون عدداً صحيحاً بين 1 و 100)' });
        }

        // Verify product exists and is active
        const product = await db.getProductById(productId);
        if (!product || product.status !== 'active') {
            return res.status(404).json({ error: 'المنتج غير متوفر أو غير موجود' });
        }

        const cartItemId = await db.addToCart(userId, productId, quantity);
        res.status(201).json({ id: cartItemId, message: 'تم الإضافة إلى العربة بنجاح' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'خطأ في الإضافة إلى العربة' });
    }
}

async function getCartItems(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'يجب تسجيل الدخول لعرض السلة' });
        }

        // Prevent IDOR: If userId is provided in params, ensure it matches req.userId or user is admin
        if (req.params.userId) {
            const requestedId = Number(req.params.userId);
            if (requestedId !== userId && req.userRole !== 'admin') {
                return res.status(403).json({ error: 'غير مصرح لك بعرض سلة مستخدم آخر' });
            }
        }

        const cartItems = await db.getCartItems(userId);
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'خطأ في جلب العربة' });
    }
}

async function updateCartItem(req, res) {
    try {
        const userId = req.userId;
        const cartItemId = validateId(req.params.cartItemId);
        if (!cartItemId) {
            return res.status(400).json({ error: 'معرّف عنصر السلة غير صالح' });
        }

        const quantity = validatePositiveInteger(req.body.quantity, 1, 100);
        if (!quantity) {
            return res.status(400).json({ error: 'الكمية غير صالحة (يجب أن تكون عدداً صحيحاً بين 1 و 100)' });
        }

        const cartItems = await db.getCartItems(userId);
        if (!cartItems.some(item => item.id === cartItemId)) {
            return res.status(403).json({ error: 'لا يمكنك تعديل عنصر في سلة مستخدم آخر' });
        }

        const success = await db.updateCartItem(cartItemId, quantity);
        if (!success) return res.status(404).json({ error: 'العنصر غير موجود في العربة' });
        res.json({ message: 'تم تحديث العربة بنجاح' });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'خطأ في تحديث العربة' });
    }
}

async function removeCartItem(req, res) {
    try {
        const userId = req.userId;
        const cartItemId = validateId(req.params.cartItemId);
        if (!cartItemId) {
            return res.status(400).json({ error: 'معرّف عنصر السلة غير صالح' });
        }

        const cartItems = await db.getCartItems(userId);
        if (!cartItems.some(item => item.id === cartItemId)) {
            return res.status(403).json({ error: 'لا يمكنك حذف عنصر من سلة مستخدم آخر' });
        }

        const success = await db.removeCartItem(cartItemId);
        if (!success) return res.status(404).json({ error: 'العنصر غير موجود في العربة' });
        res.json({ message: 'تم الحذف من العربة بنجاح' });
    } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ error: 'خطأ في الحذف' });
    }
}

module.exports = {
    addToCart,
    getCartItems,
    updateCartItem,
    removeCartItem
};
