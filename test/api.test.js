const test = require('node:test');
const assert = require('node:assert');

test('Product Search and Filters Logic Test', async () => {
    const db = require('../js/db-connection.js');
    const result = await db.getProducts({ search: 'حاسوب' });
    assert.ok(result.products, 'Result should have products array');
    assert.strictEqual(Array.isArray(result.products), true);
});

test('User Database Credentials Verification Test', async () => {
    const db = require('../js/db-connection.js');
    const user = await db.verifyUserCredentials('user@example.com', 'password123');
    assert.ok(user, 'User should be authenticated successfully');
    assert.strictEqual(user.email, 'user@example.com');
});

test('Cart Calculation Test', async () => {
    const db = require('../js/db-connection.js');
    const orderId = await db.createOrder({
        userId: 1,
        total: 125000,
        cart: [{ id: 1, name: 'Test Product', price: 125000, quantity: 1 }]
    });
    assert.ok(orderId, 'Order ID should be returned');
    const order = await db.getOrderById(orderId);
    assert.ok(order, 'Order should exist in database');
    assert.strictEqual(order.total, 125000);
});
