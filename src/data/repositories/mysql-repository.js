const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    category: 'إلكترونيات',
    name: 'حاسوب محمول احترافي - Laptop Pro 16"',
    price: 125000,
    stock: 10,
    image_url: '/images/christopher-gower-m_HRfLhgABo-unsplash.jpg',
    status: 'active',
    description: 'حاسوب محمول عالي الأداء مع معالج حديث وذاكرة فائقة السرعة 32GB، مناسب للعمل الجاد والمشروعات البرمجية والتصميم.',
    rating: 4.8,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    category: 'إلكترونيات',
    name: 'ذاكرة سامسونج السريعة 5600MHz RAM 32GB',
    price: 18500,
    stock: 15,
    image_url: '/images/samsung-memory-I2HSuD2srjs-unsplash.jpg',
    status: 'active',
    description: 'ذاكرة عشوائية عالية السرعة من سامسونج لتسريع أداء الكمبيوتر وألعاب الفيديو.',
    rating: 4.9,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    category: 'إلكترونيات',
    name: 'قرص تخزين سريع NVMe SSD 1TB Gen4',
    price: 24000,
    stock: 8,
    image_url: '/images/samsung-memory-5Nv7dLG3UQI-unsplash.jpg',
    status: 'active',
    description: 'قرص صلب NVMe M.2 بسعة 1 ترابايت وسرعة قراءة فائقة تصل إلى 7000 ميجابايت/ثانية.',
    rating: 4.7,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    category: 'إلكترونيات',
    name: 'بطاقة ذاكرة MicroSD 256GB EVO Plus',
    price: 8500,
    stock: 20,
    image_url: '/images/samsung-memory-eSRI3iTPkBc-unsplash.jpg',
    status: 'active',
    description: 'بطاقة ذاكرة سامسونج سريعة لتسجيل الفيديوهات بدقة 4K ودعم الكاميرات والهواتف الذكية.',
    rating: 4.6,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    category: 'إلكترونيات',
    name: 'وحدة تخزين خارجية 2TB SSD Portable Touch',
    price: 32000,
    stock: 3,
    image_url: '/images/samsung-memory-RZM2cE0lx0Y-unsplash.jpg',
    status: 'active',
    description: 'وحدة تخزين خارجية محمولة ومقاومة للصدمات بنقل بيانات فائق السرعة وبصمة أصبع للحماية.',
    rating: 4.8,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    category: 'إلكترونيات',
    name: 'شاشة ألعاب منحنية 27 بوصة 165Hz 1ms',
    price: 48000,
    stock: 6,
    image_url: '/images/christopher-gower-m_HRfLhgABo-unsplash.jpg',
    status: 'active',
    description: 'شاشة عرض ألعاب احترافية بدقة QHD وبألوان زاهية لمشاهدة سينمائية وتجربة ألعاب لا مثيل لها.',
    rating: 4.9,
    created_at: new Date().toISOString()
  }
];

function normalizeProductRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category_name || row.category || 'إلكترونيات',
    category_id: row.category_id ? Number(row.category_id) : null,
    price: Number(row.price),
    stock: Number(row.stock),
    image_url: row.image_url || '/images/product-placeholder.jpg',
    status: row.status || 'active',
    description: row.description || '',
    rating: Number(row.rating || 5),
    created_at: row.created_at
  };
}

function normalizeUserRow(row) {
  return {
    id: Number(row.id),
    username: row.username,
    email: row.email,
    phone: row.phone || '',
    password: row.password,
    role: row.role || 'customer',
    addresses: [],
    created_at: row.created_at
  };
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function readMigrationFiles() {
  const schemaDir = path.join(__dirname, '..', '..', '..', 'database', 'migrations');
  const files = fs.readdirSync(schemaDir).filter(file => file.endsWith('.sql')).sort();
  return files.map(file => fs.readFileSync(path.join(schemaDir, file), 'utf8'));
}

function splitSqlStatements(sql) {
  return sql
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);
}

class MysqlRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async initializeSchema() {
    const migrations = readMigrationFiles();
    for (const migration of migrations) {
      for (const statement of splitSqlStatements(migration)) {
        await this.pool.query(statement);
      }
    }
    await this.seedDefaultData();
  }

  async seedDefaultData() {
    const [userCountRow] = await this.pool.query('SELECT COUNT(*) AS total FROM users');
    if (Number(userCountRow[0].total) === 0) {
      const customerHash = await bcrypt.hash('password123', 10);
      const adminHash = await bcrypt.hash('adminpassword', 10);
      await this.pool.query(
        'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
        ['مستخدم تجريبي', 'user@example.com', '0550000000', customerHash, 'customer', 'مدير النظام', 'admin@example.com', '0660000000', adminHash, 'admin']
      );
    }

    const [addressCountRow] = await this.pool.query('SELECT COUNT(*) AS total FROM user_addresses');
    if (Number(addressCountRow[0].total) === 0) {
      const [userRows] = await this.pool.query('SELECT id, email FROM users');
      const customer = userRows.find(row => row.email === 'user@example.com');
      if (customer) {
        await this.pool.query(
          'INSERT INTO user_addresses (user_id, title, full_name, phone, city, address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [customer.id, 'المنزل', 'مستخدم تجريبي', '0550000000', 'الجزائر العاصمة', 'شارع ديدوش مراد رقم 12', 1]
        );
      }
    }

    const [categoryCountRow] = await this.pool.query('SELECT COUNT(*) AS total FROM categories');
    if (Number(categoryCountRow[0].total) === 0) {
      await this.pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', ['إلكترونيات', 'electronics']);
    }

    const [productCountRow] = await this.pool.query('SELECT COUNT(*) AS total FROM products');
    if (Number(productCountRow[0].total) === 0) {
      const [categoryRows] = await this.pool.query('SELECT id, slug FROM categories');
      const categoryId = categoryRows.find(row => row.slug === 'electronics')?.id;
      if (categoryId) {
        const products = [
          ['حاسوب محمول احترافي - Laptop Pro 16"', 125000.00, 10, '/images/christopher-gower-m_HRfLhgABo-unsplash.jpg', 'active', 'حاسوب محمول عالي الأداء مع معالج حديث وذاكرة فائقة السرعة 32GB، مناسب للعمل الجاد والمشروعات البرمجية والتصميم.', 4.8],
          ['ذاكرة سامسونج السريعة 5600MHz RAM 32GB', 18500.00, 15, '/images/samsung-memory-I2HSuD2srjs-unsplash.jpg', 'active', 'ذاكرة عشوائية عالية السرعة من سامسونج لتسريع أداء الكمبيوتر وألعاب الفيديو.', 4.9],
          ['قرص تخزين سريع NVMe SSD 1TB Gen4', 24000.00, 8, '/images/samsung-memory-5Nv7dLG3UQI-unsplash.jpg', 'active', 'قرص صلب NVMe M.2 بسعة 1 ترابايت وسرعة قراءة فائقة تصل إلى 7000 ميجابايت/ثانية.', 4.7],
          ['بطاقة ذاكرة MicroSD 256GB EVO Plus', 8500.00, 20, '/images/samsung-memory-eSRI3iTPkBc-unsplash.jpg', 'active', 'بطاقة ذاكرة سامسونج سريعة لتسجيل الفيديوهات بدقة 4K ودعم الكاميرات والهواتف الذكية.', 4.6],
          ['وحدة تخزين خارجية 2TB SSD Portable Touch', 32000.00, 3, '/images/samsung-memory-RZM2cE0lx0Y-unsplash.jpg', 'active', 'وحدة تخزين خارجية محمولة ومقاومة للصدمات بنقل بيانات فائق السرعة وبصمة أصبع للحماية.', 4.8],
          ['شاشة ألعاب منحنية 27 بوصة 165Hz 1ms', 48000.00, 6, '/images/christopher-gower-m_HRfLhgABo-unsplash.jpg', 'active', 'شاشة عرض ألعاب احترافية بدقة QHD وبألوان زاهية لمشاهدة سينمائية وتجربة ألعاب لا مثيل لها.', 4.9]
        ];

        for (const product of products) {
          await this.pool.query(
            'INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [categoryId, ...product]
          );
        }
      }
    }
  }

  async ensureCategory(categoryName) {
    const name = String(categoryName || 'إلكترونيات').trim();
    if (!name) return 1;
    const slug = slugify(name) || 'electronics';
    const [rows] = await this.pool.query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [slug]);
    if (rows[0]) return Number(rows[0].id);
    const [result] = await this.pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
    return Number(result.insertId);
  }

  async findUserByEmail(email) {
    const safeEmail = String(email || '').trim().toLowerCase();
    if (!safeEmail) return null;
    const [rows] = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [safeEmail]);
    if (!rows[0]) return null;
    const user = normalizeUserRow(rows[0]);
    const [addresses] = await this.pool.query('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [user.id]);
    user.addresses = addresses.map((addr) => ({
      id: Number(addr.id),
      title: addr.title,
      fullName: addr.full_name,
      phone: addr.phone,
      city: addr.city,
      address: addr.address,
      isDefault: Boolean(addr.is_default)
    }));
    return user;
  }

  async findUserById(id) {
    const userId = Number(id);
    if (!userId) return null;
    const [rows] = await this.pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!rows[0]) return null;
    const user = normalizeUserRow(rows[0]);
    const [addresses] = await this.pool.query('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [user.id]);
    user.addresses = addresses.map((addr) => ({
      id: Number(addr.id),
      title: addr.title,
      fullName: addr.full_name,
      phone: addr.phone,
      city: addr.city,
      address: addr.address,
      isDefault: Boolean(addr.is_default)
    }));
    return user;
  }

  async createUser(userData) {
    const username = String(userData.username || userData.name || 'مستخدم').trim();
    const email = String(userData.email || '').trim().toLowerCase();
    const phone = String(userData.phone || '').trim();
    const hashedPassword = await bcrypt.hash(String(userData.password || ''), 10);

    const [result] = await this.pool.query(
      'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, phone, hashedPassword, userData.role || 'customer']
    );

    return this.findUserById(result.insertId);
  }

  async verifyUserCredentials(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user || !user.password) return null;
    const isMatch = await bcrypt.compare(String(password || ''), user.password);
    if (!isMatch) return null;
    return user;
  }

  async updateUserProfile(id, data) {
    const user = await this.findUserById(id);
    if (!user) return null;
    const updates = [];
    const params = [];

    if (data.username !== undefined) {
      updates.push('username = ?');
      params.push(String(data.username || '').trim() || user.username);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      params.push(String(data.phone || ''));
    }
    if (data.email !== undefined) {
      const normalizedEmail = String(data.email || '').trim().toLowerCase();
      const existing = await this.findUserByEmail(normalizedEmail);
      if (existing && existing.id !== user.id) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل من قِبل حساب آخر');
      }
      updates.push('email = ?');
      params.push(normalizedEmail);
    }
    if (data.password) {
      updates.push('password = ?');
      params.push(await bcrypt.hash(String(data.password), 10));
    }

    if (updates.length === 0) return user;
    params.push(Number(id));
    await this.pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    return this.findUserById(id);
  }

  async addUserAddress(userId, addressData) {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('المستخدم غير موجود');

    const isDefault = Boolean(addressData.isDefault || user.addresses.length === 0);
    const [result] = await this.pool.query(
      'INSERT INTO user_addresses (user_id, title, full_name, phone, city, address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        Number(userId),
        String(addressData.title || 'عنوان جديد'),
        String(addressData.fullName || user.username),
        String(addressData.phone || user.phone),
        String(addressData.city || ''),
        String(addressData.address || ''),
        isDefault ? 1 : 0
      ]
    );

    if (isDefault) {
      await this.pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND id != ?', [Number(userId), result.insertId]);
    }

    const [rows] = await this.pool.query('SELECT * FROM user_addresses WHERE id = ? LIMIT 1', [result.insertId]);
    const row = rows[0];
    return {
      id: Number(row.id),
      title: row.title,
      fullName: row.full_name,
      phone: row.phone,
      city: row.city,
      address: row.address,
      isDefault: Boolean(row.is_default)
    };
  }

  async deleteUserAddress(userId, addressId) {
    const [result] = await this.pool.query('DELETE FROM user_addresses WHERE user_id = ? AND id = ?', [Number(userId), Number(addressId)]);
    return result.affectedRows > 0;
  }

  async getProductById(id) {
    const [rows] = await this.pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       WHERE p.id = ? LIMIT 1`,
      [Number(id)]
    );
    return rows[0] ? normalizeProductRow(rows[0]) : null;
  }

  async getProducts(options = {}) {
    const { category, search, minPrice, maxPrice, sortBy, page = 1, limit = 100 } = options;
    const queryParams = [];
    let whereSql = ' WHERE 1 = 1';

    if (category && category !== 'all') {
      whereSql += ' AND c.slug = ?';
      queryParams.push(slugify(category));
    }

    if (search) {
      whereSql += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(c.name) LIKE ?)';
      const term = `%${String(search).trim().toLowerCase()}%`;
      queryParams.push(term, term, term);
    }

    if (minPrice !== null && minPrice !== undefined && !Number.isNaN(Number(minPrice))) {
      whereSql += ' AND p.price >= ?';
      queryParams.push(Number(minPrice));
    }

    if (maxPrice !== null && maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) {
      whereSql += ' AND p.price <= ?';
      queryParams.push(Number(maxPrice));
    }

    let orderSql = ' ORDER BY p.created_at DESC';
    if (sortBy === 'price-asc') orderSql = ' ORDER BY p.price ASC';
    if (sortBy === 'price-desc') orderSql = ' ORDER BY p.price DESC';
    if (sortBy === 'rating') orderSql = ' ORDER BY p.rating DESC';
    if (sortBy === 'newest') orderSql = ' ORDER BY p.created_at DESC';

    const totalQuery = `SELECT COUNT(*) AS total FROM products p INNER JOIN categories c ON c.id = p.category_id${whereSql}`;
    const [countRows] = await this.pool.query(totalQuery, queryParams);
    const total = Number(countRows[0]?.total || 0);

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 100);
    const offset = (pageNum - 1) * limitNum;

    const rowsQuery = `SELECT p.*, c.name AS category_name FROM products p INNER JOIN categories c ON c.id = p.category_id${whereSql}${orderSql} LIMIT ? OFFSET ?`;
    const [rows] = await this.pool.query(rowsQuery, [...queryParams, limitNum, offset]);

    return {
      products: rows.map(normalizeProductRow),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }

  async createProduct(productData) {
    const categoryId = await this.ensureCategory(productData.category);
    const [result] = await this.pool.query(
      'INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        categoryId,
        String(productData.name || '').trim(),
        Number(productData.price || 0),
        Number(productData.stock || 0),
        productData.image_url || '/images/product-placeholder.jpg',
        productData.status || 'active',
        productData.description || '',
        Number(productData.rating || 5)
      ]
    );
    return Number(result.insertId);
  }

  async updateProduct(id, productData) {
    const product = await this.getProductById(id);
    if (!product) return false;

    if (productData.category) {
      const categoryId = await this.ensureCategory(productData.category);
      await this.pool.query('UPDATE products SET category_id = ? WHERE id = ?', [categoryId, Number(id)]);
    }

    const fields = [];
    const params = [];
    if (productData.name !== undefined) {
      fields.push('name = ?'); params.push(String(productData.name || '').trim());
    }
    if (productData.price !== undefined) {
      fields.push('price = ?'); params.push(Number(productData.price));
    }
    if (productData.stock !== undefined) {
      fields.push('stock = ?'); params.push(Number(productData.stock));
    }
    if (productData.image_url !== undefined) {
      fields.push('image_url = ?'); params.push(productData.image_url || '/images/product-placeholder.jpg');
    }
    if (productData.status !== undefined) {
      fields.push('status = ?'); params.push(productData.status || 'active');
    }
    if (productData.description !== undefined) {
      fields.push('description = ?'); params.push(productData.description || '');
    }
    if (productData.rating !== undefined) {
      fields.push('rating = ?'); params.push(Number(productData.rating || 5));
    }

    if (fields.length > 0) {
      params.push(Number(id));
      await this.pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    return true;
  }

  async deleteProduct(id) {
    const [result] = await this.pool.query('DELETE FROM products WHERE id = ?', [Number(id)]);
    return result.affectedRows > 0;
  }

  async addToCart(userId, productId, quantity = 1) {
    const uId = Number(userId) || 1;
    const pId = Number(productId);
    const qty = Math.max(1, Number(quantity) || 1);

    const [rows] = await this.pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND processed = 0 LIMIT 1',
      [uId, pId]
    );

    if (rows[0]) {
      const newQuantity = Number(rows[0].quantity) + qty;
      await this.pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, rows[0].id]);
      return Number(rows[0].id);
    }

    const [result] = await this.pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity, processed) VALUES (?, ?, ?, 0)',
      [uId, pId, qty]
    );
    return Number(result.insertId);
  }

  async getCartItems(userId) {
    const uId = Number(userId) || 1;
    const [rows] = await this.pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, c.name AS category, p.price, p.image_url
       FROM cart_items ci
       INNER JOIN products p ON p.id = ci.product_id
       INNER JOIN categories c ON c.id = p.category_id
       WHERE ci.user_id = ? AND ci.processed = 0 ORDER BY ci.id DESC`,
      [uId]
    );

    return rows.map(row => ({
      id: Number(row.id),
      product_id: Number(row.product_id),
      name: row.name,
      category: row.category,
      price: Number(row.price),
      quantity: Number(row.quantity),
      image_url: row.image_url || '/images/product-placeholder.jpg'
    }));
  }

  async updateCartItem(cartItemId, quantity) {
    const itemId = Number(cartItemId);
    const qty = Math.max(1, Number(quantity) || 1);
    const [result] = await this.pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND processed = 0', [qty, itemId]);
    return result.affectedRows > 0;
  }

  async removeCartItem(cartItemId) {
    const [result] = await this.pool.query('DELETE FROM cart_items WHERE id = ?', [Number(cartItemId)]);
    return result.affectedRows > 0;
  }

  async createOrder(orderData) {
    const userId = Number(orderData.user_id || orderData.userId || 1);
    const shippingInfo = orderData.shippingInfo || {};
    const cartInput = Array.isArray(orderData.cart) ? orderData.cart : null;
    const total = Number(orderData.total || 0);

    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      let cartItems = [];
      if (cartInput && cartInput.length > 0) {
        cartItems = cartInput.map(item => ({
          product_id: Number(item.id || item.product_id),
          quantity: Number(item.quantity) || 1,
          name: item.name || 'منتج',
          price: Number(item.price) || 0,
          image_url: item.image || item.image_url || '/images/product-placeholder.jpg'
        }));
      } else {
        const [rows] = await connection.query(
          'SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url FROM cart_items ci INNER JOIN products p ON p.id = ci.product_id WHERE ci.user_id = ? AND ci.processed = 0',
          [userId]
        );
        cartItems = rows.map(row => ({
          product_id: Number(row.product_id),
          quantity: Number(row.quantity),
          name: row.name,
          price: Number(row.price),
          image_url: row.image_url
        }));
      }

      if (!cartItems.length && total <= 0) {
        throw new Error('السلة فارغة، يتعذر إنشاء الطلب');
      }

      let computedTotal = total;
      if (computedTotal <= 0) {
        computedTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }

      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total, status, shipping_full_name, phone, email, address, city, postal_code, notes, shipping_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          Number(computedTotal),
          'pending',
          shippingInfo.fullName || '',
          shippingInfo.phone || '',
          shippingInfo.email || '',
          shippingInfo.address || '',
          shippingInfo.city || '',
          shippingInfo.postalCode || '',
          shippingInfo.notes || '',
          shippingInfo.shippingMethod || 'standard'
        ]
      );

      const orderId = Number(orderResult.insertId);
      for (const item of cartItems) {
        if (!item.product_id) continue;
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.name, Number(item.price), Number(item.quantity), item.image_url || '/images/product-placeholder.jpg']
        );

        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [Number(item.quantity) || 1, item.product_id]
        );
      }

      await connection.query('UPDATE cart_items SET processed = 1 WHERE user_id = ? AND processed = 0', [userId]);
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getOrderById(id) {
    const [rows] = await this.pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [Number(id)]);
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      ...row,
      id: Number(row.id),
      user_id: Number(row.user_id),
      total: Number(row.total)
    };
  }

  async getOrderItems(orderId) {
    const [rows] = await this.pool.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [Number(orderId)]);
    return rows.map(row => ({
      id: Number(row.id),
      order_id: Number(row.order_id),
      product_id: Number(row.product_id),
      name: row.name,
      price: Number(row.price),
      quantity: Number(row.quantity),
      image_url: row.image_url || '/images/product-placeholder.jpg'
    }));
  }

  async getOrders(userId = null) {
    if (userId) {
      const [rows] = await this.pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [Number(userId)]);
      return rows;
    }
    const [rows] = await this.pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
  }
}

function createMysqlRepository(pool) {
  return new MysqlRepository(pool);
}

function createFallbackRepository() {
  const state = {
    products: [...DEFAULT_PRODUCTS],
    users: [
      {
        id: 1,
        username: 'مستخدم تجريبي',
        email: 'user@example.com',
        phone: '0550000000',
        password: bcrypt.hashSync('password123', 10),
        role: 'customer',
        addresses: [{ id: 101, title: 'المنزل', fullName: 'مستخدم تجريبي', phone: '0550000000', city: 'الجزائر العاصمة', address: 'شارع ديدوش مراد رقم 12', isDefault: true }],
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'مدير النظام',
        email: 'admin@example.com',
        phone: '0660000000',
        password: bcrypt.hashSync('adminpassword', 10),
        role: 'admin',
        addresses: [],
        created_at: new Date().toISOString()
      }
    ],
    cartItems: [],
    orders: [],
    orderItems: [],
    nextUserId: 3,
    nextCartId: 1,
    nextOrderId: 1001,
    nextAddressId: 102,
    nextProductId: 7
  };

  const repo = {
    async initializeSchema() {
      return true;
    },
    async findUserByEmail(email) {
      const target = String(email || '').trim().toLowerCase();
      const user = state.users.find(entry => entry.email.toLowerCase() === target);
      return user ? { ...user, addresses: [...user.addresses] } : null;
    },
    async findUserById(id) {
      const user = state.users.find(entry => Number(entry.id) === Number(id));
      return user ? { ...user, addresses: [...user.addresses] } : null;
    },
    async createUser(userData) {
      const email = String(userData.email || '').trim().toLowerCase();
      const existing = state.users.some(entry => entry.email.toLowerCase() === email);
      if (existing) throw new Error('البريد الإلكتروني مستخدم بالفعل');
      const user = {
        id: state.nextUserId++,
        username: String(userData.username || userData.name || 'مستخدم'),
        email,
        phone: String(userData.phone || ''),
        password: await bcrypt.hash(String(userData.password || ''), 10),
        role: userData.role || 'customer',
        addresses: [],
        created_at: new Date().toISOString()
      };
      state.users.push(user);
      return { ...user, addresses: [...user.addresses] };
    },
    async verifyUserCredentials(email, password) {
      const user = await repo.findUserByEmail(email);
      if (!user) return null;
      const match = await bcrypt.compare(String(password || ''), user.password);
      return match ? { ...user, addresses: [...user.addresses] } : null;
    },
    async updateUserProfile(id, data) {
      const user = state.users.find(entry => Number(entry.id) === Number(id));
      if (!user) return null;
      if (data.username) user.username = String(data.username).trim();
      if (data.phone !== undefined) user.phone = String(data.phone || '');
      if (data.email) {
        const normalized = String(data.email).trim().toLowerCase();
        const duplicate = state.users.find(entry => entry.email.toLowerCase() === normalized && Number(entry.id) !== Number(id));
        if (duplicate) throw new Error('البريد الإلكتروني مستخدم بالفعل من قِبل حساب آخر');
        user.email = normalized;
      }
      if (data.password) user.password = await bcrypt.hash(String(data.password), 10);
      return { ...user, addresses: [...user.addresses] };
    },
    async addUserAddress(userId, addressData) {
      const user = state.users.find(entry => Number(entry.id) === Number(userId));
      if (!user) throw new Error('المستخدم غير موجود');
      const newAddress = {
        id: state.nextAddressId++,
        title: String(addressData.title || 'عنوان جديد'),
        fullName: String(addressData.fullName || user.username),
        phone: String(addressData.phone || user.phone),
        city: String(addressData.city || ''),
        address: String(addressData.address || ''),
        isDefault: Boolean(addressData.isDefault || user.addresses.length === 0)
      };
      if (newAddress.isDefault) user.addresses.forEach(address => { address.isDefault = false; });
      user.addresses.push(newAddress);
      return { ...newAddress };
    },
    async deleteUserAddress(userId, addressId) {
      const user = state.users.find(entry => Number(entry.id) === Number(userId));
      if (!user) return false;
      const before = user.addresses.length;
      user.addresses = user.addresses.filter(address => Number(address.id) !== Number(addressId));
      return user.addresses.length < before;
    },
    async getProductById(id) {
      const item = state.products.find(entry => Number(entry.id) === Number(id));
      return item ? { ...item } : null;
    },
    async getProducts(options = {}) {
      let filtered = [...state.products];
      const { category, search, minPrice, maxPrice, sortBy, page = 1, limit = 100 } = options;
      if (category && category !== 'all') filtered = filtered.filter(item => item.category === category);
      if (search) {
        const term = String(search).trim().toLowerCase();
        filtered = filtered.filter(item => item.name.toLowerCase().includes(term) || (item.description || '').toLowerCase().includes(term) || item.category.toLowerCase().includes(term));
      }
      if (minPrice !== null && minPrice !== undefined && !Number.isNaN(Number(minPrice))) filtered = filtered.filter(item => Number(item.price) >= Number(minPrice));
      if (maxPrice !== null && maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) filtered = filtered.filter(item => Number(item.price) <= Number(maxPrice));
      if (sortBy === 'price-asc') filtered.sort((a, b) => Number(a.price) - Number(b.price));
      if (sortBy === 'price-desc') filtered.sort((a, b) => Number(b.price) - Number(a.price));
      if (sortBy === 'rating') filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
      if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.max(1, Number(limit) || 100);
      const startIndex = (pageNum - 1) * limitNum;
      return { products: filtered.slice(startIndex, startIndex + limitNum), total: filtered.length, page: pageNum, totalPages: Math.ceil(filtered.length / limitNum) || 1 };
    },
    async createProduct(productData) {
      const id = state.nextProductId++;
      const product = { id, name: String(productData.name || '').trim(), category: String(productData.category || 'إلكترونيات'), price: Number(productData.price), stock: Number(productData.stock), image_url: productData.image_url || '/images/product-placeholder.jpg', status: productData.status || 'active', description: productData.description || '', rating: Number(productData.rating || 5), created_at: new Date().toISOString() };
      state.products.push(product);
      return id;
    },
    async updateProduct(id, productData) {
      const product = state.products.find(entry => Number(entry.id) === Number(id));
      if (!product) return false;
      if (productData.name !== undefined) product.name = String(productData.name || '').trim();
      if (productData.category !== undefined) product.category = String(productData.category || 'إلكترونيات');
      if (productData.price !== undefined) product.price = Number(productData.price);
      if (productData.stock !== undefined) product.stock = Number(productData.stock);
      if (productData.image_url !== undefined) product.image_url = productData.image_url || '/images/product-placeholder.jpg';
      if (productData.status !== undefined) product.status = productData.status || 'active';
      if (productData.description !== undefined) product.description = productData.description || '';
      if (productData.rating !== undefined) product.rating = Number(productData.rating || 5);
      return true;
    },
    async deleteProduct(id) {
      const before = state.products.length;
      state.products = state.products.filter(entry => Number(entry.id) !== Number(id));
      return state.products.length < before;
    },
    async addToCart(userId, productId, quantity = 1) {
      const uId = Number(userId) || 1;
      const pId = Number(productId);
      const qty = Math.max(1, Number(quantity) || 1);
      const item = state.cartItems.find(entry => Number(entry.user_id) === uId && Number(entry.product_id) === pId && !entry.processed);
      if (item) {
        item.quantity += qty;
        return item.id;
      }
      const entry = { id: state.nextCartId++, user_id: uId, product_id: pId, quantity: qty, processed: 0, created_at: new Date().toISOString() };
      state.cartItems.push(entry);
      return entry.id;
    },
    async getCartItems(userId) {
      return state.cartItems.filter(entry => Number(entry.user_id) === Number(userId) && !entry.processed).map(entry => {
        const product = state.products.find(item => Number(item.id) === Number(entry.product_id)) || {};
        return { id: entry.id, product_id: entry.product_id, name: product.name || 'منتج', category: product.category || '', price: Number(product.price) || 0, quantity: entry.quantity, image_url: product.image_url || '/images/product-placeholder.jpg' };
      });
    },
    async updateCartItem(cartItemId, quantity) {
      const item = state.cartItems.find(entry => Number(entry.id) === Number(cartItemId) && !entry.processed);
      if (!item) return false;
      item.quantity = Math.max(1, Number(quantity) || 1);
      return true;
    },
    async removeCartItem(cartItemId) {
      const before = state.cartItems.length;
      state.cartItems = state.cartItems.filter(entry => Number(entry.id) !== Number(cartItemId));
      return state.cartItems.length < before;
    },
    async createOrder(orderData) {
      const userId = Number(orderData.user_id || orderData.userId || 1);
      const cartInput = Array.isArray(orderData.cart) ? orderData.cart : null;
      let cartItems = [];
      if (cartInput && cartInput.length > 0) {
        cartItems = cartInput.map(item => ({ product_id: Number(item.id || item.product_id), quantity: Number(item.quantity) || 1, name: item.name || 'منتج', price: Number(item.price) || 0, image_url: item.image || item.image_url || '/images/product-placeholder.jpg' }));
      } else {
        cartItems = await repo.getCartItems(userId);
      }
      if (!cartItems.length && Number(orderData.total || 0) === 0) throw new Error('السلة فارغة، يتعذر إنشاء الطلب');
      const total = Number(orderData.total || cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0));
      const orderId = state.nextOrderId++;
      state.orders.push({ id: orderId, user_id: userId, total, status: 'pending', shippingInfo: orderData.shippingInfo || null, created_at: new Date().toISOString() });
      for (const item of cartItems) {
        state.orderItems.push({ id: Date.now() + Math.random(), order_id: orderId, product_id: item.product_id, name: item.name, price: Number(item.price) || 0, quantity: Number(item.quantity) || 1, image_url: item.image_url || '/images/product-placeholder.jpg' });
        const product = state.products.find(entry => Number(entry.id) === Number(item.product_id));
        if (product) product.stock = Math.max(0, Number(product.stock) - Number(item.quantity || 1));
      }
      state.cartItems.forEach(item => { if (Number(item.user_id) === userId) item.processed = 1; });
      return orderId;
    },
    async getOrderById(id) {
      return state.orders.find(entry => Number(entry.id) === Number(id)) || null;
    },
    async getOrderItems(orderId) {
      return state.orderItems.filter(entry => Number(entry.order_id) === Number(orderId));
    },
    async getOrders(userId = null) {
      if (userId) return state.orders.filter(entry => Number(entry.user_id) === Number(userId));
      return state.orders;
    }
  };
  return repo;
}

module.exports = {
  createMysqlRepository,
  createFallbackRepository,
  DEFAULT_PRODUCTS
};
