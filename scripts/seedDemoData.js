/**
 * Demo Data Seeder for MYSHOP Pro
 * Populates the database with realistic demo products, categories, reviews, coupons, and orders.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/data/db-connection');

async function seedDemoData() {
    console.log('🌱 Starting MYSHOP Pro Demo Data Seeding...');
    await db.initializeDatabase();

    const pool = db.pool;
    if (!pool) {
        console.error('❌ Database pool not available.');
        process.exit(1);
    }

    // 1. Ensure Demo Users
    console.log('👤 Seeding Demo Users...');
    const hashedAdminPass = await bcrypt.hash('demo1234', 10);
    const hashedCustomerPass = await bcrypt.hash('demo1234', 10);

    await pool.query(`
        INSERT INTO users (username, email, password, role, phone)
        VALUES 
            ('مدير المتجر التجريبي', 'demo@myshop.dz', ?, 'admin', '0550000001'),
            ('أحمد بوعلام', 'customer@myshop.dz', ?, 'customer', '0661234567')
        ON DUPLICATE KEY UPDATE 
            username = VALUES(username),
            password = VALUES(password),
            role = VALUES(role),
            phone = VALUES(phone)
    `, [hashedAdminPass, hashedCustomerPass]);

    // 2. Ensure Categories
    console.log('🏷️ Seeding Categories...');
    const categories = [
        { name: 'هواتف وإلكترونيات', slug: 'phones-electronics' },
        { name: 'ساعات وإكسسوارات', slug: 'watches-accessories' },
        { name: 'أزياء وملابس', slug: 'fashion-clothing' },
        { name: 'عطور ومستحضرات تجميل', slug: 'perfumes-beauty' },
        { name: 'منزل وديكور', slug: 'home-decor' }
    ];

    const categoryMap = {};
    for (const cat of categories) {
        const [existing] = await pool.query('SELECT id FROM categories WHERE name = ? LIMIT 1', [cat.name]);
        if (existing.length > 0) {
            categoryMap[cat.name] = existing[0].id;
        } else {
            const [res] = await pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [cat.name, cat.slug]);
            categoryMap[cat.name] = res.insertId;
        }
    }

    // 3. Demo Products
    console.log('📦 Seeding Demo Products...');
    const demoProducts = [
        {
            name: 'ساعة ذكية Ultra Pro Series 9 مع سوارين',
            category_id: categoryMap['ساعات وإكسسوارات'],
            price: 6500.00,
            cost_price: 3800.00,
            stock: 35,
            image_url: '/images/product-placeholder.jpg',
            description: 'ساعة ذكية رياضية فائقة الأداء مزودة بشاشة AMOLED واضحة تحت أشعة الشمس، تدعم قياس نبضات القلب ونسبة الأكسجين ومقاومة للماء IP68 مع عمر بطارية يصل إلى 7 أيام وسوارين سيليكون وقماش هدية.',
            rating: 4.9
        },
        {
            name: 'سماعات لاسلكية Pro ANC عازلة للضوضاء',
            category_id: categoryMap['هواتف وإلكترونيات'],
            price: 4200.00,
            cost_price: 2400.00,
            stock: 48,
            image_url: '/images/samsung-memory-RZM2cE0lx0Y-unsplash.jpg',
            description: 'سماعات بلوتوث 5.3 عصرية مع ميزة العزل النشط للضوضاء (Active Noise Cancellation) وصوت ستيريو نقي ثلاثي الأبعاد مع علبة شحن سريعة تدوم 30 ساعة متواصلة.',
            rating: 4.8
        },
        {
            name: 'ماكينة حلاقة Vintage T9 الذهبية الاحترافية',
            category_id: categoryMap['عطور ومستحضرات تجميل'],
            price: 2800.00,
            cost_price: 1300.00,
            stock: 60,
            image_url: '/images/samsung-memory-5Nv7dLG3UQI-unsplash.jpg',
            description: 'ماكينة حلاقة دقيقة وتشذيب اللحية بتصميم عتيق مميز وهيكل معدني كامل من الفولاذ المقاوم للصدأ، بطارية ليثيوم تدوم طويلاً مع 4 أمشاط مدرجة وشاحن USB سريع.',
            rating: 4.7
        },
        {
            name: 'حقيبة ظهر رجالية مضادة للسرقة مع منفذ USB',
            category_id: categoryMap['أزياء وملابس'],
            price: 3900.00,
            cost_price: 2100.00,
            stock: 22,
            image_url: '/images/christopher-gower-m_HRfLhgABo-unsplash.jpg',
            description: 'حقيبة ظهر عصرية مقاومة للماء والتمزق مع قفل أمان رقمي، تتسع للحواسيب المحمولة حتى 15.6 بوصة ومزودة بمنفذ شحن خارجي ومقصورات متعددة للسفر والعمل اليومي.',
            rating: 4.9
        },
        {
            name: 'مصباح LED كريستالي ذكي يعمل باللمس و16 لوناً',
            category_id: categoryMap['منزل وديكور'],
            price: 2300.00,
            cost_price: 1100.00,
            stock: 40,
            image_url: '/images/samsung-memory-eSRI3iTPkBc-unsplash.jpg',
            description: 'مصباح طاولة كريستالي بتصميم ماسي فاخر يعكس إضاءة ساحرة بزاوية 360 درجة، تحكم كامل باللمس أو بجهاز تحكم عن بعد بـ 16 لوناً مختلفاً وقابل للشحن.',
            rating: 4.8
        },
        {
            name: 'باور بانك 20,000mAh للشحن السريع بقوة 22.5W',
            category_id: categoryMap['هواتف وإلكترونيات'],
            price: 4900.00,
            cost_price: 2900.00,
            stock: 28,
            image_url: '/images/samsung-memory-I2HSuD2srjs-unsplash.jpg',
            description: 'بنك طاقة سعة 20,000 ميلي أمبير بتقنية الشحن فائق السرعة PD/QC 3.0 مع شاشة رقمية لنسبة الشحن ومنافذ متعددة لشحن 3 أجهزة في وقت واحد بأمان.',
            rating: 4.9
        }
    ];

    const insertedProductIds = [];
    for (const p of demoProducts) {
        const [existing] = await pool.query('SELECT id FROM products WHERE name = ? LIMIT 1', [p.name]);
        if (existing.length > 0) {
            await pool.query(
                'UPDATE products SET category_id = ?, price = ?, cost_price = ?, stock = ?, image_url = ?, description = ?, rating = ? WHERE id = ?',
                [p.category_id, p.price, p.cost_price, p.stock, p.image_url, p.description, p.rating, existing[0].id]
            );
            insertedProductIds.push(existing[0].id);
        } else {
            const [res] = await pool.query(
                'INSERT INTO products (category_id, name, price, cost_price, stock, image_url, status, description, rating) VALUES (?, ?, ?, ?, ?, ?, "active", ?, ?)',
                [p.category_id, p.name, p.price, p.cost_price, p.stock, p.image_url, p.description, p.rating]
            );
            insertedProductIds.push(res.insertId);
        }
    }

    // 4. Seed Demo Coupons
    console.log('🎟️ Seeding Demo Coupons...');
    const demoCoupons = [
        { code: 'PROMO10', discount_percent: 10, discount_amount: 0, min_order_amount: 3000, max_uses: 500, uses_count: 34 },
        { code: 'WELCOME500', discount_percent: 0, discount_amount: 500, min_order_amount: 5000, max_uses: 200, uses_count: 18 }
    ];

    for (const c of demoCoupons) {
        await pool.query(`
            INSERT INTO coupons (code, discount_percent, discount_amount, min_order_amount, max_uses, uses_count, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
            ON DUPLICATE KEY UPDATE 
                discount_percent = VALUES(discount_percent),
                discount_amount = VALUES(discount_amount),
                min_order_amount = VALUES(min_order_amount)
        `, [c.code, c.discount_percent, c.discount_amount, c.min_order_amount, c.max_uses, c.uses_count]);
    }

    // 5. Seed Demo Orders
    console.log('🛒 Seeding Demo Orders...');
    const [existingOrders] = await pool.query('SELECT COUNT(*) AS total FROM orders');
    if (Number(existingOrders[0].total) < 5 && insertedProductIds.length >= 3) {
        const wilayas = [
            { id: 16, name: 'الجزائر العاصمة', city: 'باب الزوار', cost: 400 },
            { id: 31, name: 'وهران', city: 'السانية', cost: 600 },
            { id: 19, name: 'سطيف', city: 'العلمة', cost: 550 },
            { id: 25, name: 'قسنطينة', city: 'الخروب', cost: 550 },
            { id: 9, name: 'البليدة', city: 'أولاد يعيش', cost: 450 }
        ];

        const statuses = ['delivered', 'delivered', 'shipped', 'processing', 'pending'];
        const names = ['كريم بلحاج', 'ياسمين قادري', 'عمر منصوري', 'فاطمة الزهراء', 'سمير دراجي'];
        const phones = ['0551234567', '0662345678', '0773456789', '0554567890', '0665678901'];

        const [custRows] = await pool.query('SELECT id FROM users WHERE email = "customer@myshop.dz" LIMIT 1');
        const customerId = custRows.length > 0 ? custRows[0].id : null;

        for (let i = 0; i < 5; i++) {
            const w = wilayas[i];
            const pId1 = insertedProductIds[i % insertedProductIds.length];
            const pId2 = insertedProductIds[(i + 1) % insertedProductIds.length];
            
            const [p1Rows] = await pool.query('SELECT * FROM products WHERE id = ?', [pId1]);
            const [p2Rows] = await pool.query('SELECT * FROM products WHERE id = ?', [pId2]);
            const prod1 = p1Rows[0];
            const prod2 = p2Rows[0];

            const subtotal = Number(prod1.price) + Number(prod2.price);
            const total = subtotal + w.cost;
            const orderNum = `DZ-2026-${10000 + i + 1}`;

            const [orderRes] = await pool.query(`
                INSERT INTO orders (
                    user_id, order_number, total, shipping_cost,
                    status, payment_method, payment_status,
                    shipping_full_name, phone, wilaya_id, wilaya_name, city, address, delivery_type,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, 'cod', ?, ?, ?, ?, ?, ?, ?, 'home', DATE_SUB(NOW(), INTERVAL ? DAY))
            `, [
                customerId, orderNum, total, w.cost,
                statuses[i], statuses[i] === 'delivered' ? 'paid' : 'pending',
                names[i], phones[i], w.id, w.name, w.city, `حي السلام، ${w.city}`,
                (5 - i) * 2
            ]);

            const orderId = orderRes.insertId;

            // Insert order items
            await pool.query(`
                INSERT INTO order_items (order_id, product_id, name, price, quantity)
                VALUES 
                    (?, ?, ?, ?, 1),
                    (?, ?, ?, ?, 1)
            `, [orderId, prod1.id, prod1.name, prod1.price, orderId, prod2.id, prod2.name, prod2.price]);
        }
    }

    // 6. Update Store Settings
    console.log('⚙️ Updating Demo Store Settings...');
    const demoSettings = {
        store_name: 'متجر MYSHOP التجريبي',
        store_currency: 'دج',
        store_phone: '0550 00 00 00',
        store_whatsapp: '213550000000',
        store_email: 'contact@myshop.dz',
        store_address: 'الجزائر العاصمة، الجزائر',
        enable_cod: 'true',
        enable_chargily: 'true',
        announcement_bar_text: '🎉 مرحباً بكم في المتجر التجريبي MYSHOP Pro — توصيل سريع لـ 58 ولاية والدفع عند الاستلام!'
    };

    for (const [key, value] of Object.entries(demoSettings)) {
        await pool.query(
            'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, value, value]
        );
    }

    console.log('✅ MYSHOP Pro Demo Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Demo Admin Credentials:');
    console.log('   Email:    demo@myshop.dz (or admin@example.com)');
    console.log('   Password: demo1234');
    console.log('----------------------------------------------------');
}

seedDemoData().then(async () => {
    if (db.pool) {
        await db.pool.end();
    }
    process.exit(0);
}).catch(async (err) => {
    console.error('❌ Error during demo data seeding:', err);
    if (db.pool) {
        await db.pool.end();
    }
    process.exit(1);
});
