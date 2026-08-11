const db = require('../../js/db-connection.js');
const { parseUserFromReq } = require('../utils/tokenUtils');

async function addToCart(req, res) {
    try {
        const authUserId = parseUserFromReq(req);
        const requestedUserId = Number(req.body.userId);
        if (!authUserId && requestedUserId) {
            return res.status(400).json({ error: 'يجب تسجيل الدخول لتحديد مستخدم آخر' });
        }
        if (authUserId && requestedUserId && authUserId !== requestedUserId) {
            return res.status(403).json({ error: 'لا يمكنك تعديل سلة مستخدم آخر' });
        }
        const userId = authUserId || requestedUserId || 1;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'معرّف المنتج مطلوب' });
        }

        const sanitizedQty = Number(quantity);
        const cartItemId = await db.addToCart(userId, productId, Number.isFinite(sanitizedQty) && sanitizedQty > 0 ? sanitizedQty : 1);
        res.status(201).json({ id: cartItemId, message: 'تم الإضافة إلى العربة بنجاح' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'خطأ في الإضافة إلى العربة' });
    }
}

async function getCartItems(req, res) {
    try {
        const authUserId = parseUserFromReq(req);
        const requestedUserId = Number(req.params.userId);
        const targetUserId = authUserId || requestedUserId || 1;

        if (authUserId && requestedUserId && authUserId !== requestedUserId) {
            return res.status(403).json({ error: 'لا يمكنك عرض سلة مستخدم آخر' });
        }

        const cartItems = await db.getCartItems(targetUserId);
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'خطأ في جلب العربة' });
    }
}

async function updateCartItem(req, res) {
    try {
        const cartItems = await db.getCartItems(req.userId);
        const cartItemId = Number(req.params.cartItemId);
        if (!cartItems.some(item => item.id === cartItemId)) {
            return res.status(403).json({ error: 'لا يمكنك تعديل عنصر في سلة مستخدم آخر' });
        }

        const success = await db.updateCartItem(cartItemId, req.body.quantity);
        if (!success) return res.status(404).json({ error: 'العنصر غير موجود في العربة' });
        res.json({ message: 'تم تحديث العربة بنجاح' });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'خطأ في تحديث العربة' });
    }
}

async function removeCartItem(req, res) {
    try {
        const cartItems = await db.getCartItems(req.userId);
        const cartItemId = Number(req.params.cartItemId);
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
