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

test('Cart Calculation Test', async () => {
    const db = require('../src/data/db-connection.js');
    const productsRes = await db.getProducts({ limit: 1 });
    const product = (productsRes.products && productsRes.products[0]) || { id: 1, price: 125000, name: 'Test Product' };
    const orderId = await db.createOrder({
        userId: 1,
        total: Number(product.price),
        cart: [{ id: product.id, name: product.name, price: Number(product.price), quantity: 1 }]
    });
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

test.after(async () => {
    const db = require('../src/data/db-connection.js');
    if (db.pool && typeof db.pool.end === 'function') {
        try { await db.pool.end(); } catch (e) {}
    }
    process.exit(0);
});
