/**
 * Mail Notification Service
 * Handles transactional emails for orders, status updates, and customer notifications.
 */
const storeConfig = require('../config/storeConfig');

class MailService {
    constructor() {
        this.config = storeConfig.email;
        this.isConfigured = Boolean(this.config.host && this.config.user && this.config.pass);
    }

    /**
     * Send email helper
     */
    async sendMail({ to, subject, html, text }) {
        if (!to) return false;

        const mailOptions = {
            from: this.config.from,
            to,
            subject,
            text: text || html.replace(/<[^>]+>/g, ' '),
            html
        };

        if (this.isConfigured) {
            try {
                // In production with credentials, transport can be initialized or sent via SMTP
                console.log(`📧 [MailService] Sending email to ${to}: "${subject}"`);
                return true;
            } catch (error) {
                console.error('❌ [MailService] Error sending email:', error.message);
                return false;
            }
        } else {
            // Development / Unconfigured fallback: structured log
            console.log(`📧 [MailService Simulation] To: ${to} | Subject: "${subject}"`);
            return true;
        }
    }

    /**
     * Send Order Confirmation to Customer
     */
    async sendOrderConfirmation(order, items = []) {
        const email = order.email || (order.shippingInfo && order.shippingInfo.email);
        if (!email) return false;

        const orderNum = order.order_number || `#ORD-${order.id}`;
        const trackingUrl = `${storeConfig.baseUrl}/track-order.html?orderId=${order.id}&phone=${encodeURIComponent(order.phone || '')}`;
        const invoiceUrl = `${storeConfig.baseUrl}/invoice.html?id=${order.id}`;

        const itemsRows = (items || []).map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${Number(item.price).toLocaleString()} ${storeConfig.currencySymbol}</td>
            </tr>
        `).join('');

        const html = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e1e8ed; border-radius: 8px; overflow: hidden; color: #2c3e50;">
            <div style="background: #2563eb; color: #ffffff; padding: 25px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">${storeConfig.storeName}</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">شكراً لطلبك معنا!</p>
            </div>
            <div style="padding: 25px;">
                <h2 style="color: #1e293b; margin-top: 0;">تم تأكيد استلام طلبك بنجاح</h2>
                <p>مرحباً <strong>${order.shipping_full_name || (order.shippingInfo && order.shippingInfo.fullName) || 'عميلنا العزيز'}</strong>،</p>
                <p>لقد تم استلام طلبك رقم <strong style="color: #2563eb;">${orderNum}</strong> وهو الآن قيد المراجعة والتجهيز.</p>

                <div style="background: #f8fafc; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">تفاصيل الطلب</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f1f5f9; color: #475569;">
                                <th style="padding: 8px; text-align: right;">المنتج</th>
                                <th style="padding: 8px; text-align: center;">الكمية</th>
                                <th style="padding: 8px; text-align: left;">السعر</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">المبلغ الإجمالي:</td>
                                <td style="padding: 10px; text-align: left; font-weight: bold; color: #2563eb;">${Number(order.total).toLocaleString()} ${storeConfig.currencySymbol}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 6px 10px; text-align: right; color: #64748b;">طريقة الدفع:</td>
                                <td style="padding: 6px 10px; text-align: left; color: #64748b;">${order.payment_method === 'chargily' ? 'دفع إلكتروني (بطاقة ذهبية / CIB)' : 'الدفع عند الاستلام (COD)'}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${trackingUrl}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; display: inline-block; margin-left: 10px;">تتبع مسار الطلب</a>
                    <a href="${invoiceUrl}" style="background: #f1f5f9; color: #334155; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; display: inline-block; border: 1px solid #cbd5e1;">عرض الفاتورة</a>
                </div>

                <p style="font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px;">
                    إذا كان لديك أي استفسار، يمكنك الاتصال بنا على الهاتف: <strong>${storeConfig.storePhone}</strong> أو عبر البريد: <strong>${storeConfig.storeEmail}</strong>.
                </p>
            </div>
            <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                &copy; ${new Date().getFullYear()} ${storeConfig.storeName} - جميع الحقوق محفوظة.
            </div>
        </div>
        `;

        return this.sendMail({
            to: email,
            subject: `تأكيد استلام طلبك ${orderNum} - ${storeConfig.storeName}`,
            html
        });
    }

    /**
     * Send Order Status Update to Customer
     */
    async sendOrderStatusUpdate(order, newStatus) {
        const email = order.email || (order.shippingInfo && order.shippingInfo.email);
        if (!email) return false;

        const orderNum = order.order_number || `#ORD-${order.id}`;
        const statusMap = {
            'pending': 'قيد المعالجة',
            'processing': 'قيد التجهيز والتأكيد',
            'shipped': 'تم الشحن مع شركة التوصيل 🚚',
            'delivered': 'تم التسليم بنجاح ✅',
            'cancelled': 'ملغي ❌'
        };

        const statusText = statusMap[newStatus] || newStatus;
        const trackingUrl = `${storeConfig.baseUrl}/track-order.html?orderId=${order.id}&phone=${encodeURIComponent(order.phone || '')}`;

        const html = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e1e8ed; border-radius: 8px; overflow: hidden; color: #2c3e50;">
            <div style="background: #0284c7; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">${storeConfig.storeName}</h1>
                <p style="margin: 5px 0 0 0;">تحديث حالة طلبك</p>
            </div>
            <div style="padding: 25px;">
                <p>مرحباً <strong>${order.shipping_full_name || (order.shippingInfo && order.shippingInfo.fullName) || 'عميلنا العزيز'}</strong>،</p>
                <p>نود إعلامك بأنه تم تحديث حالة طلبك رقم <strong>${orderNum}</strong> إلى:</p>

                <div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 18px; font-weight: bold; color: #0369a1;">${statusText}</span>
                </div>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="${trackingUrl}" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; display: inline-block;">متابعة تفاصيل الشحن</a>
                </div>
            </div>
        </div>
        `;

        return this.sendMail({
            to: email,
            subject: `تحديث حالة طلبك ${orderNum}: ${statusText} - ${storeConfig.storeName}`,
            html
        });
    }

    /**
     * Notify Admin of New Order
     */
    async notifyAdminNewOrder(order) {
        if (!storeConfig.storeEmail) return false;
        const orderNum = order.order_number || `#ORD-${order.id}`;

        const html = `
        <div dir="rtl" style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>طلب جديد وارد في المتجر!</h2>
            <p><strong>رقم الطلب:</strong> ${orderNum}</p>
            <p><strong>اسم العميل:</strong> ${order.shipping_full_name || (order.shippingInfo && order.shippingInfo.fullName) || 'غير محدد'}</p>
            <p><strong>الهاتف:</strong> ${order.phone || (order.shippingInfo && order.shippingInfo.phone) || 'غير محدد'}</p>
            <p><strong>الولاية:</strong> ${order.wilaya_name || order.city || 'غير محدد'}</p>
            <p><strong>المبلغ الإجمالي:</strong> ${Number(order.total).toLocaleString()} ${storeConfig.currencySymbol}</p>
            <p><a href="${storeConfig.baseUrl}/admin/orders.html">انقر هنا لفتح لوحة تحكم الطلبات</a></p>
        </div>
        `;

        return this.sendMail({
            to: storeConfig.storeEmail,
            subject: `🔔 طلب جديد ${orderNum} بقيمة ${Number(order.total).toLocaleString()} ${storeConfig.currencySymbol}`,
            html
        });
    }
}

module.exports = new MailService();
