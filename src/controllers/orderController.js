const crypto = require('crypto');
const db = require('../data/db-connection.js');
const { parseUserFromReq } = require('../utils/tokenUtils');
const { validateId } = require('../utils/helpers');
const mailService = require('../services/mailService');

async function createOrder(req, res) {
    try {
        const authUserId = await parseUserFromReq(req);
        const orderData = req.body || {};
        const requestedUserId = orderData.userId ? Number(orderData.userId) : null;

        if (!authUserId && requestedUserId) {
            return res.status(400).json({ error: 'يجب تسجيل الدخول لربط الطلب بحساب مستخدم' });
        }

        if (authUserId && requestedUserId && authUserId !== requestedUserId) {
            return res.status(403).json({ error: 'لا يمكنك إنشاء طلب باسم مستخدم آخر' });
        }

        orderData.userId = authUserId || null;

        const result = await db.createOrder(orderData);
        const orderId = typeof result === 'object' ? result.id : result;
        const orderNumber = (typeof result === 'object' && result.orderNumber) || `DZ-${new Date().getFullYear()}-${orderId}`;
        const trackingToken = (typeof result === 'object' && result.trackingToken) || null;
        const finalTotal = (typeof result === 'object' && result.total) || null;

        // Post-order notification (async)
        try {
            const order = await db.getOrderById(orderId);
            const items = await db.getOrderItems(orderId);
            if (order) {
                mailService.sendOrderConfirmation(order, items).catch(e => console.error('Mail confirmation error:', e.message));
                mailService.notifyAdminNewOrder(order).catch(e => console.error('Mail admin notification error:', e.message));
            }
        } catch (mailErr) {
            console.error('Error in post-order notifications:', mailErr.message);
        }

        res.status(201).json({
            id: orderId,
            orderNumber,
            trackingToken,
            total: finalTotal,
            message: 'تم إنشاء الطلب بنجاح'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ error: error.message || 'خطأ في إنشاء الطلب' });
    }
}

async function getOrders(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'يجب تسجيل الدخول لعرض الطلبات' });
        }

        const user = await db.findUserById(userId);
        if (user && user.role === 'admin') {
            const allOrders = await db.getOrders();
            return res.json(allOrders);
        }

        const orders = await db.getOrders(userId);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'خطأ في جلب الطلبات' });
    }
}

async function checkOrderAuthorization(req, order) {
    if (!order) return false;

    const authUserId = await parseUserFromReq(req);

    // 1. Registered Customer Order (order.user_id !== null)
    if (order.user_id !== null && order.user_id !== undefined) {
        if (!authUserId) return false;
        const user = await db.findUserById(authUserId);
        if (!user) return false;
        if (user.role === 'admin' || Number(order.user_id) === Number(authUserId)) {
            return true;
        }
        return false;
    }

    // 2. Guest Order (order.user_id === null)
    if (order.user_id === null) {
        // Admin authorization
        if (authUserId) {
            const user = await db.findUserById(authUserId);
            if (user && user.role === 'admin') {
                return true;
            }
        }

        // Tracking Token Verification (Header 'x-tracking-token', query 'token', or body 'token')
        const token = req.headers['x-tracking-token'] || (req.query && req.query.token) || (req.body && req.body.token);
        if (token && order.tracking_token) {
            const cleanToken = String(token).trim();
            const cleanOrderToken = String(order.tracking_token).trim();
            if (cleanToken.length === cleanOrderToken.length) {
                try {
                    const bufA = Buffer.from(cleanToken, 'utf8');
                    const bufB = Buffer.from(cleanOrderToken, 'utf8');
                    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
                        return true;
                    }
                } catch (e) {}
            }
        }

        // Phone Verification (for guest orders only)
        const phone = (req.query && req.query.phone) || (req.body && req.body.phone) || req.headers['x-verification-phone'];
        if (phone && order.phone) {
            const cleanReqPhone = String(phone).replace(/[\s-]/g, '');
            const cleanOrderPhone = String(order.phone).replace(/[\s-]/g, '');
            if (cleanReqPhone && cleanReqPhone.length >= 8 && cleanReqPhone === cleanOrderPhone) {
                return true;
            }
        }

        return false;
    }

    return false;
}

async function getOrderById(req, res) {
    try {
        const orderId = validateId(req.params.id);
        if (!orderId) {
            return res.status(400).json({ error: 'معرّف الطلب غير صالح' });
        }

        const order = await db.getOrderById(orderId);
        if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

        const isAuthorized = await checkOrderAuthorization(req, order);
        if (!isAuthorized) {
            return res.status(403).json({ error: 'غير مصرح لك بالوصول إلى بيانات هذا الطلب' });
        }

        const items = await db.getOrderItems(order.id);
        res.json({ ...order, items });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'خطأ في جلب الطلب' });
    }
}

async function getOrderItems(req, res) {
    try {
        const orderId = validateId(req.params.orderId);
        if (!orderId) {
            return res.status(400).json({ error: 'معرّف الطلب غير صالح' });
        }

        const order = await db.getOrderById(orderId);
        if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

        const isAuthorized = await checkOrderAuthorization(req, order);
        if (!isAuthorized) {
            return res.status(403).json({ error: 'غير مصرح لك بالوصول إلى عناصر هذا الطلب' });
        }

        const items = await db.getOrderItems(order.id);
        res.json(items);
    } catch (error) {
        console.error('Error fetching order items:', error);
        res.status(500).json({ error: 'خطأ في جلب عناصر الطلب' });
    }
}

async function trackOrder(req, res) {
    try {
        const { orderId, orderNumber, phone, token } = req.query;
        const searchId = orderId || orderNumber;

        if (!searchId || (!phone && !token)) {
            return res.status(400).json({ error: 'يرجى إدخال رقم الطلب ورقم الهاتف أو رمز التتبع' });
        }

        let order = null;
        if (phone) {
            order = await db.getOrderByTracking(searchId, phone);
        } else if (token) {
            const raw = validateId(searchId) ? await db.getOrderById(searchId) : await db.getOrderByNumber(searchId);
            if (raw && raw.tracking_token === token) {
                order = raw;
            }
        }

        if (!order) {
            return res.status(404).json({ error: 'لم يتم العثور على طلب يطابق البيانات المدخلة' });
        }

        const items = await db.getOrderItems(order.id);
        res.json({
            order: {
                id: order.id,
                order_number: order.order_number,
                created_at: order.created_at,
                status: order.status,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                shipping_full_name: order.shipping_full_name,
                phone: order.phone,
                city: order.city,
                wilaya_name: order.wilaya_name,
                delivery_type: order.delivery_type,
                shipping_cost: order.shipping_cost,
                total: order.total
            },
            items
        });
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء تتبع الطلب' });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'حالة الطلب غير صالحة' });
        }

        const orderId = validateId(req.params.id);
        if (!orderId) {
            return res.status(400).json({ error: 'معرّف الطلب غير صالح' });
        }

        const order = await db.getOrderById(orderId);
        if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

        const success = await db.updateOrderStatus(orderId, status);
        if (!success) return res.status(500).json({ error: 'فشل في تحديث حالة الطلب' });

        // Notify customer via email
        try {
            mailService.sendOrderStatusUpdate(order, status).catch(e => console.error('Status mail error:', e.message));
        } catch (e) {}

        res.json({ message: 'تم تحديث حالة الطلب بنجاح', status });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'خطأ في تحديث حالة الطلب' });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    getOrderItems,
    trackOrder,
    updateOrderStatus
};
