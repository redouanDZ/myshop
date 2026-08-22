const test = require('node:test');
const assert = require('node:assert');

test('Product Search and Filters Logic Test', async () => {
    const db = require('../src/data/db-connection.js');
    
    // 1. Search term
    const searchRes = await db.getProducts({ search: 'حاسوب' });
    assert.ok(searchRes.products, 'Result should have products array');
    assert.strictEqual(Array.isArray(searchRes.products), true);
    assert.ok(searchRes.products.length > 0, 'Should find product with search term');

    // 2. Price filter
    const priceRes = await db.getProducts({ minPrice: 10000, maxPrice: 30000 });
    assert.ok(Array.isArray(priceRes.products), 'Price filter should return array');
    priceRes.products.forEach(p => {
        assert.ok(p.price >= 10000 && p.price <= 30000, `Product price ${p.price} should be within [10000, 30000]`);
    });

    // 3. Rating filter
    const ratingRes = await db.getProducts({ minRating: 4.7 });
    assert.ok(Array.isArray(ratingRes.products), 'Rating filter should return array');
    ratingRes.products.forEach(p => {
        assert.ok(Number(p.rating) >= 4.7, `Product rating ${p.rating} should be >= 4.7`);
    });

    // 4. In-Stock filter
    const stockRes = await db.getProducts({ inStock: true });
    assert.ok(Array.isArray(stockRes.products), 'In-stock filter should return array');
    stockRes.products.forEach(p => {
        assert.ok(p.stock > 0, `Product stock ${p.stock} should be > 0`);
    });

    // 5. Sorting by price asc
    const sortRes = await db.getProducts({ sortBy: 'price-asc' });
    assert.ok(sortRes.products.length >= 2, 'Should have multiple products to test sorting');
    for (let i = 0; i < sortRes.products.length - 1; i++) {
        assert.ok(sortRes.products[i].price <= sortRes.products[i + 1].price, 'Products should be sorted by price ascending');
    }
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

test('Wishlist Add, Check, List and Remove Test', async () => {
    const db = require('../src/data/db-connection.js');
    const userId = 1;
    const productId = 1;

    // Add to wishlist
    const added = await db.addToWishlist(userId, productId);
    assert.strictEqual(added, true, 'Product should be added to wishlist');

    // Check status
    const inWishlist = await db.isInWishlist(userId, productId);
    assert.strictEqual(inWishlist, true, 'Product should be confirmed in wishlist');

    // Get wishlist items
    const list = await db.getWishlist(userId);
    assert.ok(Array.isArray(list), 'Wishlist items must be returned as array');
    assert.ok(list.some(p => p.id === productId), 'Added product should be present in wishlist array');

    // Remove from wishlist
    const removed = await db.removeFromWishlist(userId, productId);
    assert.strictEqual(removed, true, 'Product should be removed from wishlist');

    // Verify removal
    const stillInWishlist = await db.isInWishlist(userId, productId);
    assert.strictEqual(stillInWishlist, false, 'Product should no longer be in wishlist');
});

test('Multi-language AR/FR/EN Localization Files Test', async () => {
    const fs = require('fs');
    const path = require('path');

    const localesDir = path.join(__dirname, '..', 'locales');
    const arPath = path.join(localesDir, 'ar.json');
    const frPath = path.join(localesDir, 'fr.json');
    const enPath = path.join(localesDir, 'en.json');

    assert.ok(fs.existsSync(arPath), 'ar.json must exist');
    assert.ok(fs.existsSync(frPath), 'fr.json must exist');
    assert.ok(fs.existsSync(enPath), 'en.json must exist');

    const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
    const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    assert.strictEqual(ar.dir, 'rtl', 'Arabic must be RTL');
    assert.strictEqual(fr.dir, 'ltr', 'French must be LTR');
    assert.strictEqual(en.dir, 'ltr', 'English must be LTR');

    assert.ok(ar.nav && ar.common && ar.cart && ar.checkout, 'Arabic dictionary must have core sections');
    assert.ok(fr.nav && fr.common && fr.cart && fr.checkout, 'French dictionary must have core sections');
    assert.ok(en.nav && en.common && en.cart && en.checkout, 'English dictionary must have core sections');
});

test.after(async () => {
    const db = require('../src/data/db-connection.js');
    if (db.pool && typeof db.pool.end === 'function') {
        try { await db.pool.end(); } catch (e) {}
    }
    setTimeout(() => process.exit(0), 150);
});
