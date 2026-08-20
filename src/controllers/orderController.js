const db = require('../data/db-connection.js');
const { parseUserFromReq } = require('../utils/tokenUtils');

async function createOrder(req, res) {
    try {
        const authUserId = parseUserFromReq(req);
        const orderData = req.body || {};
        const requestedUserId = Number(orderData.userId);

        if (!authUserId && requestedUserId) {
            return res.status(400).json({ error: 'يجب تسجيل الدخول لتحديد مستخدم آخر' });
        }

        if (authUserId && requestedUserId && authUserId !== requestedUserId) {
            return res.status(403).json({ error: 'لا يمكنك إنشاء طلب باسم مستخدم آخر' });
        }

        if (authUserId) {
            orderData.userId = authUserId;
        } else if (!requestedUserId) {
            orderData.userId = 1;
        }

        if (!orderData.cart && !orderData.total) {
            return res.status(400).json({ error: 'السلة أو الإجمالي مطلوب' });
        }

        const orderId = await db.createOrder(orderData);
        res.status(201).json({ id: orderId, message: 'تم إنشاء الطلب بنجاح' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message || 'خطأ في إنشاء الطلب' });
    }
}

async function getOrders(req, res) {
    try {
        const orders = await db.getOrders(req.userId);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'خطأ في جلب الطلبات' });
    }
}

async function getOrderById(req, res) {
    try {
        const order = await db.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
        if (order.user_id !== req.userId) {
            return res.status(403).json({ error: 'لا يمكنك الوصول إلى طلب مستخدم آخر' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'خطأ في جلب الطلب' });
    }
}

async function getOrderItems(req, res) {
    try {
        const order = await db.getOrderById(req.params.orderId);
        if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
        if (order.user_id !== req.userId) {
            return res.status(403).json({ error: 'لا يمكنك الوصول إلى عناصر طلب مستخدم آخر' });
        }

        const items = await db.getOrderItems(req.params.orderId);
        res.json(items);
    } catch (error) {
        console.error('Error fetching order items:', error);
        res.status(500).json({ error: 'خطأ في جلب عناصر الطلب' });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    getOrderItems
};
