/**
 * Chargily Pay V2 Integration Service
 * Official API Integration for Algerian EDAHABIA & CIB Cards
 */
const crypto = require('crypto');
const storeConfig = require('../config/storeConfig');

class ChargilyService {
    constructor() {
        this.config = storeConfig.chargily;
    }

    /**
     * Create a checkout session on Chargily Pay V2
     */
    async createCheckout({ orderId, orderNumber, amount, customerName, customerEmail, customerPhone }) {
        const successUrl = `${storeConfig.baseUrl}/order-confirmation.html?id=${orderId}&payment=success`;
        const failureUrl = `${storeConfig.baseUrl}/checkout.html?id=${orderId}&payment=failed`;

        // If secret key is configured, invoke Chargily API V2
        if (this.config.secretKey) {
            try {
                const response = await fetch(`${this.config.endpoint}/checkouts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: Math.round(Number(amount)),
                        currency: 'dzd',
                        success_url: successUrl,
                        failure_url: failureUrl,
                        description: `طلب رقم ${orderNumber || orderId} من متجر ${storeConfig.storeName}`,
                        metadata: {
                            order_id: String(orderId),
                            order_number: String(orderNumber || orderId)
                        }
                    })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'خطأ في إنشاء جلسة الدفع لدى Chargily');
                }

                return {
                    checkoutUrl: data.checkout_url,
                    checkoutId: data.id
                };
            } catch (error) {
                console.error('❌ Chargily API error:', error.message);
                throw error;
            }
        }

        // Test Simulation Mode (when CHARGILY_SECRET_KEY is not set)
        console.log(`💳 [Chargily Simulation Mode] Created checkout for Order #${orderId} (${amount} DZD)`);
        return {
            checkoutUrl: `${successUrl}&simulation=chargily_test_mode`,
            checkoutId: `test_chk_${Date.now()}`
        };
    }

    /**
     * Verify Webhook Signature
     */
    verifyWebhookSignature(rawBody, signatureHeader) {
        if (!this.config.secretKey) return true;
        if (!signatureHeader || !rawBody) return false;

        const calculatedSignature = crypto
            .createHmac('sha256', this.config.secretKey)
            .update(rawBody)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(calculatedSignature),
            Buffer.from(signatureHeader)
        );
    }
}

module.exports = new ChargilyService();
