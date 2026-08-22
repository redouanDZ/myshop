const test = require('node:test');
const assert = require('node:assert');

test('Product Search and Filters Logic Test', async () => {
    const db = require('../src/data/db-connection.js');
    const result = await db.getProducts({ search: 'حاسوب' });
    assert.ok(result.products, 'Result should have products array');
    assert.strictEqual(Array.isArray(result.products), true);
});

test('User Database Credentials Verification Test', async () => {
    const db = require('../src/data/db-connection.js');
    const user = await db.verifyUserCredentials('user@example.com', 'password123');
    assert.ok(user, 'User should be authenticated successfully');
    assert.strictEqual(user.email, 'user@example.com');
});

test('Cart Calculation and Order Placement Test', async () => {
    const db = require('../src/data/db-connection.js');
    const productsRes = await db.getProducts({ limit: 1 });
    const product = (productsRes.products && productsRes.products[0]) || { id: 1, price: 125000, name: 'Test Product' };
    const orderRes = await db.createOrder({
        userId: 1,
        total: Number(product.price),
        cart: [{ id: product.id, name: product.name, price: Number(product.price), quantity: 1 }]
    });
    const orderId = typeof orderRes === 'object' ? orderRes.id : orderRes;
    assert.ok(orderId, 'Order ID should be returned');
    const order = await db.getOrderById(orderId);
    assert.ok(order, 'Order should exist in database');
    assert.strictEqual(Number(order.total), Number(product.price));
});

test('Authentication Bypass Prevention Test', async () => {
    const { parseUserFromReq } = require('../src/utils/tokenUtils.js');
    const mockReq = {
        headers: {
            cookie: 'access_token=token_user_1'
        }
    };
    const userId = parseUserFromReq(mockReq);
    assert.strictEqual(userId, null, 'Legacy token_user_ pattern must be rejected and return null');
});

test('Guest Checkout with COD and Wilaya Test', async () => {
    const db = require('../src/data/db-connection.js');
    const guestPhone = '0555123456';
    const orderRes = await db.createOrder({
        userId: null,
        paymentMethod: 'cod',
        total: 18500,
        shippingInfo: {
            fullName: 'عميل زائر',
            phone: guestPhone,
            email: 'guest@example.com',
            address: 'شارع الاستقلال 45',
            city: 'وهران',
            wilayaId: 31,
            wilayaName: 'وهران',
            deliveryType: 'home',
            shippingCost: 550
        },
        cart: [{ id: 2, name: 'ذاكرة سامسونج', price: 18500, quantity: 1 }]
    });

    const orderId = typeof orderRes === 'object' ? orderRes.id : orderRes;
    assert.ok(orderId, 'Guest Order ID should be returned');
    
    const order = await db.getOrderById(orderId);
    assert.ok(order, 'Guest order must exist');
    assert.strictEqual(order.payment_method, 'cod');
    assert.strictEqual(order.phone, guestPhone);

    // Track order as guest
    const tracked = await db.getOrderByTracking(orderId, guestPhone);
    assert.ok(tracked, 'Guest must be able to track their order using ID and phone number');
    assert.strictEqual(tracked.id, orderId);
});

test('Stock Over-ordering Protection Test', async () => {
    const db = require('../src/data/db-connection.js');
    let threwError = false;
    try {
        await db.createOrder({
            userId: null,
            total: 999999,
            cart: [{ id: 1, name: 'حاسوب محمول', price: 125000, quantity: 99999 }]
        });
    } catch (err) {
        threwError = true;
        assert.ok(err.message.includes('غير متوفرة'), 'Should indicate stock shortage in Arabic');
    }
    assert.strictEqual(threwError, true, 'Ordering more than available stock must be rejected');
});

test('Algerian 58 Wilayas Retrieval Test', async () => {
    const db = require('../src/data/db-connection.js');
    const wilayas = await db.getWilayas();
    assert.ok(Array.isArray(wilayas), 'Wilayas must be an array');
    assert.strictEqual(wilayas.length >= 58, true, 'Must contain all 58 Algerian wilayas');
    
    const algiers = wilayas.find(w => w.code === '16' || w.name_ar.includes('الجزائر'));
    assert.ok(algiers, 'Algiers (Wilaya 16) must exist with delivery price');
    assert.ok(algiers.home_delivery_price > 0, 'Home delivery price must be defined');
});

test.after(async () => {
    const db = require('../src/data/db-connection.js');
    if (db.pool && typeof db.pool.end === 'function') {
        try { await db.pool.end(); } catch (e) {}
    }
    process.exit(0);
});
