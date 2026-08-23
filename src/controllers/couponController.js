const db = require('../data/db-connection.js');

async function validateCoupon(req, res) {
    try {
        const code = String(req.body.code || '').trim().toUpperCase();
        const orderAmount = Number(req.body.orderAmount || req.body.total || 0);

        if (!code) {
            return res.status(400).json({ valid: false, error: 'يرجى إدخال رمز قسيمة الخصم' });
        }

        const coupon = await db.getCouponByCode(code);
        if (!coupon) {
            return res.status(404).json({ valid: false, error: 'رمز قسيمة الخصم غير موجود أو غير صالح' });
        }

        if (coupon.status !== 'active') {
            return res.status(400).json({ valid: false, error: 'هذه القسيمة غير نشطة حالياً' });
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return res.status(400).json({ valid: false, error: 'انتهت صلاحية قسيمة الخصم هذه' });
        }

        if (coupon.max_uses > 0 && coupon.uses_count >= coupon.max_uses) {
            return res.status(400).json({ valid: false, error: 'تم استنفاد الحد الأقصى لاستخدام هذه القسيمة' });
        }

        if (coupon.min_order_amount > 0 && orderAmount < coupon.min_order_amount) {
            return res.status(400).json({
                valid: false,
                error: `الحد الأدنى لقيمة الطلب لتطبيق هذا الكوبون هو ${coupon.min_order_amount.toLocaleString()} دج`
            });
        }

        let calculatedDiscount = 0;
        if (coupon.discount_percent > 0) {
            calculatedDiscount = Math.round((orderAmount * coupon.discount_percent) / 100);
        } else if (coupon.discount_amount > 0) {
            calculatedDiscount = Math.min(orderAmount, Math.round(coupon.discount_amount));
        }

        res.json({
            valid: true,
            code: coupon.code,
            discountPercent: coupon.discount_percent,
            discountAmount: coupon.discount_amount,
            calculatedDiscount,
            minOrderAmount: coupon.min_order_amount,
            message: 'تم تطبيق قسيمة الخصم بنجاح! 🎉'
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ valid: false, error: 'خطأ أثناء التحقق من قسيمة الخصم' });
    }
}

module.exports = {
    validateCoupon
};
