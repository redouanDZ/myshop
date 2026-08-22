const db = require('../data/db-connection.js');
const chargilyService = require('../services/chargilyService');
const mailService = require('../services/mailService');

async function createChargilyCheckout(req, res) {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ error: 'معرف الطلب مطلوب' });
        }

        const order = await db.getOrderById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        const checkout = await chargilyService.createCheckout({
            orderId: order.id,
            orderNumber: order.order_number,
            amount: order.total,
            customerName: order.shipping_full_name,
            customerEmail: order.email,
            customerPhone: order.phone
        });

        res.json(checkout);
    } catch (error) {
        console.error('Error creating payment checkout:', error);
        res.status(500).json({ error: error.message || 'خطأ أثناء إنشاء جلسة الدفع' });
    }
}

async function handleChargilyWebhook(req, res) {
    try {
        const signature = req.headers['signature'] || '';
        const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        const isValid = chargilyService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            return res.status(403).json({ error: 'توقيع Webhook غير صالح' });
        }

        const event = req.body;
        if (event && event.type === 'checkout.paid') {
            const checkoutData = event.data;
            const orderId = checkoutData.metadata && checkoutData.metadata.order_id;

            if (orderId) {
                await db.updateOrderPaymentStatus(orderId, 'paid', 'chargily');
                await db.updateOrderStatus(orderId, 'processing');

                const order = await db.getOrderById(orderId);
                if (order) {
                    mailService.sendOrderStatusUpdate(order, 'processing').catch(e => {});
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Chargily Webhook error:', error);
        res.status(500).json({ error: 'خطأ في معالجة إشعار الدفع' });
    }
}

module.exports = {
    createChargilyCheckout,
    handleChargilyWebhook
};
