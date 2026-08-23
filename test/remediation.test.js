const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const crypto = require('crypto');
const app = require('../src/app');
const db = require('../src/data/db-connection');
const { issueSession, createAccessToken } = require('../src/utils/tokenUtils');
const storeConfig = require('../src/config/storeConfig');

let server;
let baseUrl;
let userAToken;
let userBToken;
let adminToken;
let userAId;
let userBId;
let adminId;

test.before(async () => {
    server = http.createServer(app);
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    await db.initializeDatabase();

    // Setup User A
    const userA = await db.findUserByEmail('user@example.com') || { id: 1, email: 'user@example.com', role: 'customer' };
    userAId = userA.id;
    const sessionA = await issueSession(userA, { headers: {}, ip: '127.0.0.1' });
    userAToken = createAccessToken(userA, sessionA);

    // Setup User B
    let userB = await db.findUserByEmail('user_b@example.com');
    if (!userB) {
        const created = await db.createUser({
            username: 'مستخدم ب',
            email: 'user_b@example.com',
            phone: '0559998877',
            password: 'password123',
            role: 'customer'
        });
        userB = (created && typeof created === 'object') ? created : await db.findUserByEmail('user_b@example.com');
        userBId = userB.id;
    } else {
        userBId = userB.id;
    }
    const sessionB = await issueSession(userB, { headers: {}, ip: '127.0.0.1' });
    userBToken = createAccessToken(userB, sessionB);

    // Setup Admin
    const adminUser = await db.findUserByEmail('admin@example.com') || { id: 2, email: 'admin@example.com', role: 'admin' };
    adminId = adminUser.id;
    const sessionAdmin = await issueSession(adminUser, { headers: {}, ip: '127.0.0.1' });
    adminToken = createAccessToken(adminUser, sessionAdmin);

    // Replenish stock for tests
    await ensureStock();
});

async function ensureStock() {
    if (db.pool && typeof db.pool.query === 'function') {
        await db.pool.query('UPDATE products SET stock = 100 WHERE id > 0');
    }
}

test.beforeEach(async () => {
    await ensureStock();
});

test.after(async () => {
    if (server) {
        await new Promise(resolve => server.close(resolve));
    }
});

// ==========================================
// PHASE 1 — CART SECURITY & ISOLATION TESTS
// ==========================================
test('Phase 1: Unauthenticated guest cannot add or view database cart directly without auth', async () => {
    // Adding without auth
    const addRes = await fetch(`${baseUrl}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 1, quantity: 1 })
    });
    assert.strictEqual(addRes.status, 401, 'Unauthenticated add to cart must return 401');

    // Getting cart without auth
    const getRes = await fetch(`${baseUrl}/api/cart`);
    assert.strictEqual(getRes.status, 401, 'Unauthenticated get cart must return 401');
});

test('Phase 1: User A cannot inspect or modify User B cart (IDOR Protection)', async () => {
    // User A trying to view User B's cart
    const viewRes = await fetch(`${baseUrl}/api/cart/${userBId}`, {
        headers: { 'Authorization': `Bearer ${userAToken}` }
    });
    assert.strictEqual(viewRes.status, 403, 'User A viewing User B cart must return 403 Forbidden');

    // User A adding item to own cart
    const addRes = await fetch(`${baseUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAToken}`
        },
        body: JSON.stringify({ productId: 1, quantity: 2 })
    });
    assert.strictEqual(addRes.status, 201, 'User A should be able to add to their own cart');
    const addData = await addRes.json();

    // User B trying to modify User A's cart item
    const modifyRes = await fetch(`${baseUrl}/api/cart/${addData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userBToken}`
        },
        body: JSON.stringify({ quantity: 5 })
    });
    assert.strictEqual(modifyRes.status, 403, 'User B modifying User A cart item must return 403');

    // User B trying to delete User A's cart item
    const deleteRes = await fetch(`${baseUrl}/api/cart/${addData.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert.strictEqual(deleteRes.status, 403, 'User B deleting User A cart item must return 403');
});

// ==========================================
// PHASE 2 — ORDER AUTHORIZATION & IDOR TESTS
// ==========================================
test('Phase 2: Order Authorization - Prevent unauthorized cross-user order access', async () => {
    // Create an order for User A
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAToken}`
        },
        body: JSON.stringify({
            userId: userAId,
            shippingInfo: { fullName: 'المستخدم أ', phone: '0550000000', wilayaId: 16 },
            cart: [{ id: 1, quantity: 1 }]
        })
    });
    assert.strictEqual(orderRes.status, 201);
    const orderData = await orderRes.json();
    const orderAId = orderData.id;

    // 1. User B trying to access User A's order by ID alone
    const userBAccess = await fetch(`${baseUrl}/api/orders/${orderAId}`, {
        headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert.strictEqual(userBAccess.status, 403, 'User B accessing User A order must return 403');

    // 2. User B trying to access User A's order items
    const userBItemsAccess = await fetch(`${baseUrl}/api/order-items/${orderAId}`, {
        headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert.strictEqual(userBItemsAccess.status, 403, 'User B accessing User A order items must return 403');

    // 3. Guest trying to access User A's order without auth or token
    const guestAccess = await fetch(`${baseUrl}/api/orders/${orderAId}`);
    assert.strictEqual(guestAccess.status, 403, 'Guest accessing user order by ID alone must return 403');

    // 4. Admin accessing User A's order (should succeed)
    const adminAccess = await fetch(`${baseUrl}/api/orders/${orderAId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminAccess.status, 200, 'Admin should be able to view customer order');
});

test('Phase 2: Guest Order Authorization - Requires valid tracking token or phone', async () => {
    const guestOrderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            shippingInfo: { fullName: 'ضيف مؤقت', phone: '0551239999', wilayaId: 31 },
            cart: [{ id: 1, quantity: 1 }]
        })
    });
    const guestOrderData = await guestOrderRes.json();
    const guestOrderId = guestOrderData.id;
    const trackingToken = guestOrderData.trackingToken;

    // 1. Accessing guest order without token or phone must fail
    const unauthFetch = await fetch(`${baseUrl}/api/orders/${guestOrderId}`);
    assert.strictEqual(unauthFetch.status, 403, 'Guest order access without token must return 403');

    // 2. Accessing with invalid token must fail
    const invalidTokenFetch = await fetch(`${baseUrl}/api/orders/${guestOrderId}?token=wrong_token_123`);
    assert.strictEqual(invalidTokenFetch.status, 403, 'Guest order access with invalid token must return 403');

    // 3. Accessing with correct tracking token must succeed
    const validTokenFetch = await fetch(`${baseUrl}/api/orders/${guestOrderId}?token=${trackingToken}`);
    assert.strictEqual(validTokenFetch.status, 200, 'Guest order access with valid token must return 200');

    // 4. Accessing with correct phone must succeed
    const validPhoneFetch = await fetch(`${baseUrl}/api/orders/${guestOrderId}?phone=0551239999`);
    assert.strictEqual(validPhoneFetch.status, 200, 'Guest order access with correct phone must return 200');
});

// ==========================================
// PHASE 3 — SERVER-SIDE PRICE CALCULATION
// ==========================================
test('Phase 3: Server-side Price Calculation - Tampered client prices & totals are ignored', async () => {
    const prod = await db.getProductById(1);
    const realDbPrice = Number(prod.price);
    assert.ok(realDbPrice > 1000, 'Product price in DB is genuine high value');

    // Client attempts to pay 1 DZD for a product that costs realDbPrice
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            total: 1, // Tampered client grand total
            paymentMethod: 'cod',
            shippingInfo: {
                fullName: 'عميل تلاعب الأسعار',
                phone: '0555001122',
                wilayaId: 16, // Alger home delivery is 400 DZD
                deliveryType: 'home',
                shippingCost: 0 // Tampered shipping cost
            },
            cart: [{
                id: 1,
                name: 'حاسوب بسعر مزور',
                price: 1, // Tampered item unit price
                quantity: 2
            }]
        })
    });
    assert.strictEqual(orderRes.status, 201);
    const orderData = await orderRes.json();

    // Fetch created order from DB
    const createdOrder = await db.getOrderById(orderData.id);
    const items = await db.getOrderItems(orderData.id);

    // Expected: (realDbPrice * 2) + 400 shipping
    const expectedItemSubtotal = realDbPrice * 2;
    const expectedGrandTotal = expectedItemSubtotal + 400;

    assert.strictEqual(Number(items[0].price), realDbPrice, 'Order item unit price must match DB price');
    assert.strictEqual(Number(createdOrder.total), expectedGrandTotal, 'Grand total must be calculated server-side');
});

// ==========================================
// PHASE 4 — QUANTITY VALIDATION
// ==========================================
test('Phase 4: Quantity Validation - Reject invalid quantities (negative, zero, NaN, floats, excessive)', async () => {
    const invalidQuantities = [-5, 0, 'abc', 1.5, 99999999, Infinity, -Infinity];

    for (const invalidQty of invalidQuantities) {
        const res = await fetch(`${baseUrl}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shippingInfo: { fullName: 'اختبار الكمية', phone: '0550000000', wilayaId: 16 },
                cart: [{ id: 1, quantity: invalidQty }]
            })
        });
        assert.strictEqual(res.status, 400, `Quantity "${invalidQty}" must be rejected with 400 Bad Request`);
    }
});

// ==========================================
// PHASE 6 — PAYMENT STATUS SECURITY
// ==========================================
test('Phase 6: Client cannot force paymentStatus = paid on order creation', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            paymentStatus: 'paid', // Client trying to mark unpaid order as paid
            shippingInfo: { fullName: 'محاولة احتيال دفع', phone: '0550000000', wilayaId: 16 },
            cart: [{ id: 1, quantity: 1 }]
        })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();

    const order = await db.getOrderById(data.id);
    assert.strictEqual(order.payment_status, 'pending', 'Order payment status MUST remain pending on creation');
});

// ==========================================
// PHASE 7 & 8 — CHARGILY CHECKOUT & WEBHOOK
// ==========================================
test('Phase 7: Chargily Checkout Authorization - Unauthorized user cannot create checkout session', async () => {
    // Create order for User A
    const orderA = await db.createOrder({
        userId: userAId,
        shippingInfo: { fullName: 'المستخدم أ', phone: '0550000000', wilayaId: 16 },
        cart: [{ id: 1, quantity: 1 }]
    });

    // User B attempts to trigger checkout for User A's order
    const checkoutRes = await fetch(`${baseUrl}/api/payments/chargily/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userBToken}`
        },
        body: JSON.stringify({ orderId: orderA.id })
    });
    assert.strictEqual(checkoutRes.status, 403, 'Unauthorized checkout creation must return 403 Forbidden');
});

test('Phase 8: Chargily Webhook Signature Verification and Idempotency', async () => {
    await ensureStock();
    const order = await db.createOrder({
        userId: null,
        shippingInfo: { fullName: 'عميل ويبهوك', phone: '0550000000', wilayaId: 16 },
        cart: [{ id: 1, quantity: 1 }]
    });

    const webhookSecret = storeConfig.chargily.secretKey || 'test_secret_key';
    storeConfig.chargily.secretKey = webhookSecret;

    const payload = JSON.stringify({
        type: 'checkout.paid',
        data: {
            id: 'chk_12345',
            metadata: { order_id: String(order.id) }
        }
    });

    const validSignature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

    // 1. Invalid signature must return 403
    const badSigRes = await fetch(`${baseUrl}/api/payments/chargily/webhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'signature': 'invalid_signature_hex'
        },
        body: payload
    });
    assert.strictEqual(badSigRes.status, 403, 'Invalid signature webhook must be rejected with 403');

    // 2. Valid signature must succeed
    const validSigRes = await fetch(`${baseUrl}/api/payments/chargily/webhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'signature': validSignature
        },
        body: payload
    });
    assert.strictEqual(validSigRes.status, 200, 'Valid signature webhook must succeed with 200');

    // Verify order status updated to paid
    const updatedOrder = await db.getOrderById(order.id);
    assert.strictEqual(updatedOrder.payment_status, 'paid');
    assert.strictEqual(updatedOrder.status, 'processing');

    // 3. Duplicate Webhook must be idempotent (no error, acknowledged)
    const duplicateRes = await fetch(`${baseUrl}/api/payments/chargily/webhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'signature': validSignature
        },
        body: payload
    });
    assert.strictEqual(duplicateRes.status, 200, 'Duplicate webhook must succeed idempotently');
});

// ==========================================
// MANDATORY SECOND-PASS REGRESSION TESTS (A - E)
// ==========================================
test('Test A: Create guest order, then GET /api/orders/{guestOrderId} without token or phone -> 403', async () => {
    await ensureStock();
    const guestOrderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            shippingInfo: { fullName: 'اختبار أ', phone: '0551113344', wilayaId: 16 },
            cart: [{ id: 1, quantity: 1 }]
        })
    });
    assert.strictEqual(guestOrderRes.status, 201);
    const guestData = await guestOrderRes.json();
    const guestOrderId = guestData.id;

    // Fetching without token or phone must fail with 403
    const unauthorizedFetch = await fetch(`${baseUrl}/api/orders/${guestOrderId}`);
    assert.strictEqual(unauthorizedFetch.status, 403, 'Guest order access without credentials must return 403');
});

test('Test B: Create guest order, then GET /api/order-items/{guestOrderId} without token/phone -> 403', async () => {
    await ensureStock();
    const guestOrderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            shippingInfo: { fullName: 'اختبار ب', phone: '0552224455', wilayaId: 16 },
            cart: [{ id: 1, quantity: 1 }]
        })
    });
    assert.strictEqual(guestOrderRes.status, 201);
    const guestData = await guestOrderRes.json();
    const guestOrderId = guestData.id;

    // Fetching order items without token or phone must fail with 403
    const unauthorizedItemsFetch = await fetch(`${baseUrl}/api/order-items/${guestOrderId}`);
    assert.strictEqual(unauthorizedItemsFetch.status, 403, 'Guest order items access without credentials must return 403');
});

test('Test C: Create User A order, User B requests GET /api/order-items/{userAOrderId} -> 403', async () => {
    await ensureStock();
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAToken}`
        },
        body: JSON.stringify({
            userId: userAId,
            shippingInfo: { fullName: 'المستخدم أ', phone: '0550000000', wilayaId: 16 },
            cart: [{ id: 1, quantity: 1 }]
        })
    });
    assert.strictEqual(orderRes.status, 201);
    const orderData = await orderRes.json();
    const userAOrderId = orderData.id;

    // User B attempts to access User A's order items
    const userBItemsRes = await fetch(`${baseUrl}/api/order-items/${userAOrderId}`, {
        headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert.strictEqual(userBItemsRes.status, 403, 'User B accessing User A order items must return 403');
});

test('Test D: Authenticated User A requests GET /api/order-items/{userAOrderId} -> 200', async () => {
    await ensureStock();
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAToken}`
        },
        body: JSON.stringify({
            userId: userAId,
            shippingInfo: { fullName: 'المستخدم أ', phone: '0550000000', wilayaId: 16 },
            cart: [{ id: 1, quantity: 1 }]
        })
    });
    assert.strictEqual(orderRes.status, 201);
    const orderData = await orderRes.json();
    const userAOrderId = orderData.id;

    // Authenticated User A accesses their own order items
    const userAItemsRes = await fetch(`${baseUrl}/api/order-items/${userAOrderId}`, {
        headers: { 'Authorization': `Bearer ${userAToken}` }
    });
    assert.strictEqual(userAItemsRes.status, 200, 'Authenticated User A accessing own order items must return 200');
    const items = await userAItemsRes.json();
    assert.ok(Array.isArray(items) && items.length > 0);
});

test('Test E: Remove all Cart fallback behavior. Confirm no request can resolve to userId = 1', async () => {
    // 1. Unauthenticated request to /api/cart/add with or without { userId: 1 } must fail with 401
    const unauthAdd = await fetch(`${baseUrl}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, productId: 1, quantity: 1 })
    });
    assert.strictEqual(unauthAdd.status, 401, 'Unauthenticated add to cart must return 401');

    // 2. Unauthenticated request to /api/cart/1 must fail with 401
    const unauthGet = await fetch(`${baseUrl}/api/cart/1`);
    assert.strictEqual(unauthGet.status, 401, 'Unauthenticated get cart must return 401');

    // 3. Authenticated User B requesting /api/cart/1 must be rejected with 403 Forbidden
    const crossUserGet = await fetch(`${baseUrl}/api/cart/1`, {
        headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert.strictEqual(crossUserGet.status, 403, 'User B requesting cart for user 1 must return 403');
});

test('Phase 11: Non-existent API route returns 404 JSON', async () => {
    const res = await fetch(`${baseUrl}/api/non_existent_endpoint_123`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.message, 'المسار غير موجود');
});
