INSERT INTO categories (name, slug) VALUES
    ('إلكترونيات', 'electronics'),
    ('أجهزة', 'devices'),
    ('ملحقات', 'accessories')
ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug);

INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating)
SELECT c.id, 'حاسوب محمول احترافي - Laptop Pro 16"', 125000.00, 10, '/images/christopher-gower-m_HRfLhgABo-unsplash.jpg', 'active', 'حاسوب محمول عالي الأداء مع معالج حديث وذاكرة فائقة السرعة 32GB، مناسب للعمل الجاد والمشروعات البرمجية والتصميم.', 4.8
FROM categories c WHERE c.slug = 'electronics'
ON DUPLICATE KEY UPDATE
    name = VALUES(name), price = VALUES(price), stock = VALUES(stock), image_url = VALUES(image_url), status = VALUES(status), description = VALUES(description), rating = VALUES(rating);

INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating)
SELECT c.id, 'ذاكرة سامسونج السريعة 5600MHz RAM 32GB', 18500.00, 15, '/images/samsung-memory-I2HSuD2srjs-unsplash.jpg', 'active', 'ذاكرة عشوائية عالية السرعة من سامسونج لتسريع أداء الكمبيوتر وألعاب الفيديو.', 4.9
FROM categories c WHERE c.slug = 'electronics'
ON DUPLICATE KEY UPDATE
    name = VALUES(name), price = VALUES(price), stock = VALUES(stock), image_url = VALUES(image_url), status = VALUES(status), description = VALUES(description), rating = VALUES(rating);

INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating)
SELECT c.id, 'قرص تخزين سريع NVMe SSD 1TB Gen4', 24000.00, 8, '/images/samsung-memory-5Nv7dLG3UQI-unsplash.jpg', 'active', 'قرص صلب NVMe M.2 بسعة 1 ترابايت وسرعة قراءة فائقة تصل إلى 7000 ميجابايت/ثانية.', 4.7
FROM categories c WHERE c.slug = 'electronics'
ON DUPLICATE KEY UPDATE
    name = VALUES(name), price = VALUES(price), stock = VALUES(stock), image_url = VALUES(image_url), status = VALUES(status), description = VALUES(description), rating = VALUES(rating);

INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating)
SELECT c.id, 'بطاقة ذاكرة MicroSD 256GB EVO Plus', 8500.00, 20, '/images/samsung-memory-eSRI3iTPkBc-unsplash.jpg', 'active', 'بطاقة ذاكرة سامسونج سريعة لتسجيل الفيديوهات بدقة 4K ودعم الكاميرات والهواتف الذكية.', 4.6
FROM categories c WHERE c.slug = 'electronics'
ON DUPLICATE KEY UPDATE
    name = VALUES(name), price = VALUES(price), stock = VALUES(stock), image_url = VALUES(image_url), status = VALUES(status), description = VALUES(description), rating = VALUES(rating);

INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating)
SELECT c.id, 'وحدة تخزين خارجية 2TB SSD Portable Touch', 32000.00, 3, '/images/samsung-memory-RZM2cE0lx0Y-unsplash.jpg', 'active', 'وحدة تخزين خارجية محمولة ومقاومة للصدمات بنقل بيانات فائق السرعة وبصمة أصبع للحماية.', 4.8
FROM categories c WHERE c.slug = 'electronics'
ON DUPLICATE KEY UPDATE
    name = VALUES(name), price = VALUES(price), stock = VALUES(stock), image_url = VALUES(image_url), status = VALUES(status), description = VALUES(description), rating = VALUES(rating);

INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating)
SELECT c.id, 'شاشة ألعاب منحنية 27 بوصة 165Hz 1ms', 48000.00, 6, '/images/christopher-gower-m_HRfLhgABo-unsplash.jpg', 'active', 'شاشة عرض ألعاب احترافية بدقة QHD وبألوان زاهية لمشاهدة سينمائية وتجربة ألعاب لا مثيل لها.', 4.9
FROM categories c WHERE c.slug = 'electronics'
ON DUPLICATE KEY UPDATE
    name = VALUES(name), price = VALUES(price), stock = VALUES(stock), image_url = VALUES(image_url), status = VALUES(status), description = VALUES(description), rating = VALUES(rating);
