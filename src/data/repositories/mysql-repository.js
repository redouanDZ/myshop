const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

const DEFAULT_WILAYAS = [
  { id: 1, code: '01', name_ar: 'أدرار', name_fr: 'Adrar', home_delivery_price: 1000, desk_delivery_price: 700, delivery_time_days: '3-6 أيام', is_active: 1 },
  { id: 2, code: '02', name_ar: 'الشلف', name_fr: 'Chlef', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 3, code: '03', name_ar: 'الأغواط', name_fr: 'Laghouat', home_delivery_price: 750, desk_delivery_price: 500, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 4, code: '04', name_ar: 'أم البواقي', name_fr: 'Oum El Bouaghi', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 5, code: '05', name_ar: 'باتنة', name_fr: 'Batna', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 6, code: '06', name_ar: 'بجاية', name_fr: 'Béjaïa', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 7, code: '07', name_ar: 'بسكرة', name_fr: 'Biskra', home_delivery_price: 700, desk_delivery_price: 500, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 8, code: '08', name_ar: 'بشار', name_fr: 'Béchar', home_delivery_price: 900, desk_delivery_price: 650, delivery_time_days: '3-5 أيام', is_active: 1 },
  { id: 9, code: '09', name_ar: 'البليدة', name_fr: 'Blida', home_delivery_price: 500, desk_delivery_price: 300, delivery_time_days: '1-2 أيام', is_active: 1 },
  { id: 10, code: '10', name_ar: 'البويرة', name_fr: 'Bouira', home_delivery_price: 550, desk_delivery_price: 350, delivery_time_days: '1-2 أيام', is_active: 1 },
  { id: 11, code: '11', name_ar: 'تمنراست', name_fr: 'Tamanrasset', home_delivery_price: 1300, desk_delivery_price: 950, delivery_time_days: '4-7 أيام', is_active: 1 },
  { id: 12, code: '12', name_ar: 'تبسة', name_fr: 'Tébessa', home_delivery_price: 700, desk_delivery_price: 500, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 13, code: '13', name_ar: 'تلمسان', name_fr: 'Tlemcen', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 14, code: '14', name_ar: 'تيارت', name_fr: 'Tiaret', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 15, code: '15', name_ar: 'تيزي وزو', name_fr: 'Tizi Ouzou', home_delivery_price: 550, desk_delivery_price: 350, delivery_time_days: '1-2 أيام', is_active: 1 },
  { id: 16, code: '16', name_ar: 'الجزائر العاصمة', name_fr: 'Alger', home_delivery_price: 400, desk_delivery_price: 250, delivery_time_days: '24-48 ساعة', is_active: 1 },
  { id: 17, code: '17', name_ar: 'الجلفة', name_fr: 'Djelfa', home_delivery_price: 700, desk_delivery_price: 500, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 18, code: '18', name_ar: 'جيجل', name_fr: 'Jijel', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 19, code: '19', name_ar: 'سطيف', name_fr: 'Sétif', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 20, code: '20', name_ar: 'سعيدة', name_fr: 'Saïda', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 21, code: '21', name_ar: 'سكيكدة', name_fr: 'Skikda', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 22, code: '22', name_ar: 'سيدي بلعباس', name_fr: 'Sidi Bel Abbès', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 23, code: '23', name_ar: 'عنابة', name_fr: 'Annaba', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 24, code: '24', name_ar: 'قالمة', name_fr: 'Guelma', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 25, code: '25', name_ar: 'قسنطينة', name_fr: 'Constantine', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 26, code: '26', name_ar: 'المدية', name_fr: 'Médéa', home_delivery_price: 550, desk_delivery_price: 350, delivery_time_days: '1-2 أيام', is_active: 1 },
  { id: 27, code: '27', name_ar: 'مستغانم', name_fr: 'Mostaganem', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 28, code: '28', name_ar: 'المسيلة', name_fr: 'M\'Sila', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 29, code: '29', name_ar: 'معسكر', name_fr: 'Mascara', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 30, code: '30', name_ar: 'ورقلة', name_fr: 'Ouargla', home_delivery_price: 800, desk_delivery_price: 600, delivery_time_days: '2-5 أيام', is_active: 1 },
  { id: 31, code: '31', name_ar: 'وهران', name_fr: 'Oran', home_delivery_price: 550, desk_delivery_price: 350, delivery_time_days: '1-2 أيام', is_active: 1 },
  { id: 32, code: '32', name_ar: 'البيض', name_fr: 'El Bayadh', home_delivery_price: 800, desk_delivery_price: 600, delivery_time_days: '3-5 أيام', is_active: 1 },
  { id: 33, code: '33', name_ar: 'إليزي', name_fr: 'Illizi', home_delivery_price: 1300, desk_delivery_price: 950, delivery_time_days: '4-7 أيام', is_active: 1 },
  { id: 34, code: '34', name_ar: 'برج بوعريريج', name_fr: 'Bordj Bou Arréridj', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 35, code: '35', name_ar: 'بومرداس', name_fr: 'Boumerdès', home_delivery_price: 500, desk_delivery_price: 300, delivery_time_days: '1-2 أيام', is_active: 1 },
  { id: 36, code: '36', name_ar: 'الطارف', name_fr: 'El Tarf', home_delivery_price: 700, desk_delivery_price: 500, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 37, code: '37', name_ar: 'تندوف', name_fr: 'Tindouf', home_delivery_price: 1300, desk_delivery_price: 950, delivery_time_days: '4-7 أيام', is_active: 1 },
  { id: 38, code: '38', name_ar: 'تسمسيلت', name_fr: 'Tissemsilt', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 39, code: '39', name_ar: 'الوادي', name_fr: 'El Oued', home_delivery_price: 800, desk_delivery_price: 600, delivery_time_days: '2-5 أيام', is_active: 1 },
  { id: 40, code: '40', name_ar: 'خنشلة', name_fr: 'Khenchela', home_delivery_price: 700, desk_delivery_price: 500, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 41, code: '41', name_ar: 'سوق أهراس', name_fr: 'Souk Ahras', home_delivery_price: 700, desk_delivery_price: 500, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 42, code: '42', name_ar: 'تيبازة', name_fr: 'Tipaza', home_delivery_price: 500, desk_delivery_price: 300, delivery_time_days: '1-2 أيام', is_active: 1 },
  { id: 43, code: '43', name_ar: 'ميلة', name_fr: 'Mila', home_delivery_price: 650, desk_delivery_price: 450, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 44, code: '44', name_ar: 'عين الدفلى', name_fr: 'Aïn Defla', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 45, code: '45', name_ar: 'النعامة', name_fr: 'Naâma', home_delivery_price: 850, desk_delivery_price: 650, delivery_time_days: '3-5 أيام', is_active: 1 },
  { id: 46, code: '46', name_ar: 'عين تموشنت', name_fr: 'Aïn Témouchent', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 47, code: '47', name_ar: 'غرداية', name_fr: 'Ghardaïa', home_delivery_price: 800, desk_delivery_price: 600, delivery_time_days: '2-5 أيام', is_active: 1 },
  { id: 48, code: '48', name_ar: 'غليزان', name_fr: 'Relizane', home_delivery_price: 600, desk_delivery_price: 400, delivery_time_days: '2-3 أيام', is_active: 1 },
  { id: 49, code: '49', name_ar: 'تيميمون', name_fr: 'Timimoun', home_delivery_price: 1100, desk_delivery_price: 800, delivery_time_days: '3-6 أيام', is_active: 1 },
  { id: 50, code: '50', name_ar: 'برج باجي مختار', name_fr: 'Bordj Badji Mokhtar', home_delivery_price: 1500, desk_delivery_price: 1100, delivery_time_days: '5-8 أيام', is_active: 1 },
  { id: 51, code: '51', name_ar: 'أولاد جلال', name_fr: 'Ouled Djellal', home_delivery_price: 750, desk_delivery_price: 550, delivery_time_days: '2-4 أيام', is_active: 1 },
  { id: 52, code: '52', name_ar: 'بني عباس', name_fr: 'Béni Abbès', home_delivery_price: 1100, desk_delivery_price: 800, delivery_time_days: '3-6 أيام', is_active: 1 },
  { id: 53, code: '53', name_ar: 'إن صالح', name_fr: 'In Salah', home_delivery_price: 1200, desk_delivery_price: 900, delivery_time_days: '4-7 أيام', is_active: 1 },
  { id: 54, code: '54', name_ar: 'إن قزام', name_fr: 'In Guezzam', home_delivery_price: 1500, desk_delivery_price: 1100, delivery_time_days: '5-8 أيام', is_active: 1 },
  { id: 55, code: '55', name_ar: 'تقرت', name_fr: 'Touggourt', home_delivery_price: 800, desk_delivery_price: 600, delivery_time_days: '2-5 أيام', is_active: 1 },
  { id: 56, code: '56', name_ar: 'جانت', name_fr: 'Djanet', home_delivery_price: 1400, desk_delivery_price: 1000, delivery_time_days: '4-7 أيام', is_active: 1 },
  { id: 57, code: '57', name_ar: 'المغير', name_fr: 'El M\'Ghair', home_delivery_price: 800, desk_delivery_price: 600, delivery_time_days: '2-5 أيام', is_active: 1 },
  { id: 58, code: '58', name_ar: 'المنيعة', name_fr: 'El Meniaa', home_delivery_price: 900, desk_delivery_price: 650, delivery_time_days: '3-5 أيام', is_active: 1 }
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

function normalizeWilayaRow(row) {
  return {
    id: Number(row.id),
    code: String(row.code).padStart(2, '0'),
    name_ar: row.name_ar,
    name_fr: row.name_fr,
    home_delivery_price: Number(row.home_delivery_price),
    desk_delivery_price: Number(row.desk_delivery_price),
    delivery_time_days: row.delivery_time_days || '2-4 أيام',
    is_active: Boolean(row.is_active)
  };
}

function normalizeOrderRow(row) {
  return {
    ...row,
    id: Number(row.id),
    user_id: row.user_id ? Number(row.user_id) : null,
    total: Number(row.total),
    shipping_cost: Number(row.shipping_cost || 0),
    payment_method: row.payment_method || 'cod',
    payment_status: row.payment_status || 'pending',
    order_number: row.order_number || `DZ-${new Date(row.created_at || Date.now()).getFullYear()}-${String(row.id).padStart(5, '0')}`,
    tracking_token: row.tracking_token || null,
    wilaya_id: row.wilaya_id ? Number(row.wilaya_id) : null,
    wilaya_name: row.wilaya_name || '',
    delivery_type: row.delivery_type || 'home'
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
        try {
          await this.pool.query(statement);
        } catch (e) {
          const ignorableCodes = [
            'ER_TABLE_EXISTS_ERROR',
            'ER_DUP_KEYNAME',
            'ER_DUP_FIELDNAME',
            'ER_CANT_DROP_FIELD_OR_KEY'
          ];
          if (!ignorableCodes.includes(e.code) && !e.message.includes('already exists') && !e.message.includes('Duplicate')) {
            console.error(`❌ Migration error in SQL statement [${statement.slice(0, 100)}...]:`, e.message);
            throw e;
          }
        }
      }
    }
    await this.seedDefaultData();
  }

  async seedDefaultData() {
    const isProduction = process.env.NODE_ENV === 'production';

    const [userCountRow] = await this.pool.query('SELECT COUNT(*) AS total FROM users');
    if (Number(userCountRow[0].total) === 0) {
      if (isProduction) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (adminEmail && adminPassword) {
          const adminHash = await bcrypt.hash(adminPassword, 12);
          await this.pool.query(
            'INSERT IGNORE INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            ['مدير النظام', adminEmail.toLowerCase().trim(), '0550000000', adminHash, 'admin']
          );
          console.log(`✅ [Production Init] Initialized admin user from environment (${adminEmail}).`);
        } else {
          console.log('ℹ️ [Production Init] No initial admin seeded. Use "npm run create-admin" to create administrator account.');
        }
      } else {
        const customerHash = await bcrypt.hash('password123', 10);
        const adminHash = await bcrypt.hash('adminpassword', 10);
        await this.pool.query(
          'INSERT IGNORE INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
          ['مستخدم تجريبي', 'user@example.com', '0550000000', customerHash, 'customer', 'مدير النظام', 'admin@example.com', '0660000000', adminHash, 'admin']
        );
      }
    }

    const [addressCountRow] = await this.pool.query('SELECT COUNT(*) AS total FROM user_addresses');
    if (Number(addressCountRow[0].total) === 0 && !isProduction) {
      const [userRows] = await this.pool.query('SELECT id, email FROM users');
      const customer = userRows.find(row => row.email === 'user@example.com');
      if (customer) {
        await this.pool.query(
          'INSERT IGNORE INTO user_addresses (user_id, title, full_name, phone, city, address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
        for (const product of DEFAULT_PRODUCTS) {
          await this.pool.query(
            'INSERT INTO products (category_id, name, price, stock, image_url, status, description, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [categoryId, product.name, product.price, product.stock, product.image_url, product.status, product.description, product.rating]
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
    const { category, search, minPrice, maxPrice, minRating, inStock, status = 'active', sortBy, page = 1, limit = 100 } = options;
    const queryParams = [];
    let whereSql = ' WHERE 1 = 1';

    if (status && status !== 'all') {
      whereSql += ' AND p.status = ?';
      queryParams.push(status);
    }

    if (category && category !== 'all') {
      whereSql += ' AND (c.slug = ? OR c.name = ?)';
      queryParams.push(slugify(category), category);
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

    if (minRating !== null && minRating !== undefined && !Number.isNaN(Number(minRating))) {
      whereSql += ' AND p.rating >= ?';
      queryParams.push(Number(minRating));
    }

    if (inStock === true || inStock === 'true' || inStock === 1 || inStock === '1') {
      whereSql += ' AND p.stock > 0';
    }

    let orderSql = ' ORDER BY p.created_at DESC';
    if (sortBy === 'price-asc') orderSql = ' ORDER BY p.price ASC';
    if (sortBy === 'price-desc') orderSql = ' ORDER BY p.price DESC';
    if (sortBy === 'rating' || sortBy === 'rating-desc') orderSql = ' ORDER BY p.rating DESC, p.created_at DESC';
    if (sortBy === 'name-asc') orderSql = ' ORDER BY p.name ASC';
    if (sortBy === 'name-desc') orderSql = ' ORDER BY p.name DESC';
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
    const uId = Number(userId);
    if (!uId || isNaN(uId) || uId <= 0) {
      throw new Error('معرف المستخدم مطلوب للسلة');
    }
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
    const uId = Number(userId);
    if (!uId || isNaN(uId) || uId <= 0) {
      return [];
    }
    const [rows] = await this.pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, c.name AS category, p.price, p.image_url, p.stock
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
      stock: Number(row.stock),
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

  async getWilayas() {
    try {
      const [rows] = await this.pool.query('SELECT * FROM wilayas ORDER BY code ASC');
      return rows.map(normalizeWilayaRow);
    } catch (e) {
      return DEFAULT_WILAYAS;
    }
  }

  async getWilayaById(id) {
    try {
      const [rows] = await this.pool.query('SELECT * FROM wilayas WHERE id = ? OR code = ? LIMIT 1', [id, String(id)]);
      return rows[0] ? normalizeWilayaRow(rows[0]) : null;
    } catch (e) {
      const found = DEFAULT_WILAYAS.find(w => w.id === Number(id) || w.code === String(id));
      return found || null;
    }
  }

  async updateWilayaPrice(id, data) {
    const updates = [];
    const params = [];
    if (data.home_delivery_price !== undefined) {
      updates.push('home_delivery_price = ?');
      params.push(Number(data.home_delivery_price));
    }
    if (data.desk_delivery_price !== undefined) {
      updates.push('desk_delivery_price = ?');
      params.push(Number(data.desk_delivery_price));
    }
    if (data.delivery_time_days !== undefined) {
      updates.push('delivery_time_days = ?');
      params.push(String(data.delivery_time_days));
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active ? 1 : 0);
    }

    if (!updates.length) return false;
    params.push(Number(id));
    const [res] = await this.pool.query(`UPDATE wilayas SET ${updates.join(', ')} WHERE id = ?`, params);
    return res.affectedRows > 0;
  }

  async createOrder(orderData) {
    const rawUserId = orderData.user_id || orderData.userId;
    const userId = (rawUserId !== null && rawUserId !== undefined && rawUserId !== '') ? Number(rawUserId) : null;
    const shippingInfo = orderData.shippingInfo || {};
    const cartInput = Array.isArray(orderData.cart) ? orderData.cart : null;

    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      let requestedItems = [];
      if (cartInput && cartInput.length > 0) {
        for (const item of cartInput) {
          const pid = Number(item.id || item.product_id);
          const qty = Number(item.quantity);
          if (!Number.isInteger(pid) || pid <= 0) {
            throw new Error('معرف المنتج غير صالح في بيانات السلة');
          }
          if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
            throw new Error('الكمية المطلوبة غير صالحة (يجب أن تكون عدداً صحيحاً بين 1 و 100)');
          }
          requestedItems.push({ product_id: pid, quantity: qty });
        }
      } else if (userId) {
        const [rows] = await connection.query(
          'SELECT ci.product_id, ci.quantity FROM cart_items ci WHERE ci.user_id = ?',
          [userId]
        );
        for (const row of rows) {
          requestedItems.push({ product_id: Number(row.product_id), quantity: Number(row.quantity) });
        }
      }

      if (!requestedItems.length) {
        throw new Error('السلة فارغة، يتعذر إنشاء الطلب');
      }

      // 1. Lock rows, verify stock & calculate true prices directly from Database
      let itemsSubtotal = 0;
      const orderItemsToInsert = [];

      for (const item of requestedItems) {
        const [prodRows] = await connection.query(
          'SELECT id, name, price, stock, status, image_url FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );

        if (!prodRows[0] || prodRows[0].status !== 'active') {
          throw new Error(`المنتج #${item.product_id} غير متوفر حالياً`);
        }

        const prod = prodRows[0];
        const availableStock = Number(prod.stock);
        if (availableStock < item.quantity) {
          throw new Error(`الكمية المطلوبة من "${prod.name}" غير متوفرة (المتبقي في المخزون: ${availableStock})`);
        }

        const realUnitPrice = Number(prod.price);
        const itemTotal = realUnitPrice * item.quantity;
        itemsSubtotal += itemTotal;

        orderItemsToInsert.push({
          product_id: Number(prod.id),
          name: prod.name,
          price: realUnitPrice,
          quantity: item.quantity,
          image_url: prod.image_url || '/images/product-placeholder.jpg'
        });
      }

      // 2. Server-side Shipping calculation from Database
      const rawWilayaId = shippingInfo.wilayaId;
      const wilayaId = (rawWilayaId !== null && rawWilayaId !== undefined && rawWilayaId !== '') ? Number(rawWilayaId) : null;
      const deliveryType = (shippingInfo.deliveryType === 'desk') ? 'desk' : 'home';
      let serverShippingCost = 500; // default standard delivery
      let finalWilayaName = shippingInfo.wilayaName || shippingInfo.city || 'الجزائر';

      if (wilayaId && Number.isInteger(wilayaId) && wilayaId >= 1 && wilayaId <= 58) {
        const [wilayaRows] = await connection.query(
          'SELECT id, name_ar, home_delivery_price, desk_delivery_price FROM wilayas WHERE id = ? LIMIT 1',
          [wilayaId]
        );
        if (wilayaRows[0]) {
          finalWilayaName = wilayaRows[0].name_ar;
          serverShippingCost = deliveryType === 'desk' 
            ? Number(wilayaRows[0].desk_delivery_price) 
            : Number(wilayaRows[0].home_delivery_price);
        }
      }

      // 3. Server-computed Grand Total (Never trusting client total/prices)
      const computedGrandTotal = itemsSubtotal + serverShippingCost;

      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `DZ-${new Date().getFullYear()}-${randomSuffix}`;
      const trackingToken = crypto.randomBytes(24).toString('hex');

      const paymentMethod = (shippingInfo.paymentMethod === 'chargily' || orderData.paymentMethod === 'chargily') ? 'chargily' : 'cod';
      const paymentStatus = 'pending'; // MUST ALWAYS BE PENDING ON CREATION

      const [orderResult] = await connection.query(
        `INSERT INTO orders 
        (order_number, user_id, total, status, payment_method, payment_status, shipping_full_name, phone, email, address, city, wilaya_id, wilaya_name, delivery_type, shipping_cost, postal_code, notes, shipping_method, tracking_token) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          userId,
          computedGrandTotal,
          'pending',
          paymentMethod,
          paymentStatus,
          String(shippingInfo.fullName || '').trim().slice(0, 150),
          String(shippingInfo.phone || '').trim().slice(0, 30),
          String(shippingInfo.email || '').trim().slice(0, 180),
          String(shippingInfo.address || '').trim(),
          String(shippingInfo.city || finalWilayaName).trim().slice(0, 120),
          wilayaId,
          finalWilayaName,
          deliveryType,
          serverShippingCost,
          String(shippingInfo.postalCode || '').trim().slice(0, 20),
          String(shippingInfo.notes || '').trim().slice(0, 500),
          String(shippingInfo.shippingMethod || 'standard').trim().slice(0, 50),
          trackingToken
        ]
      );

      const orderId = Number(orderResult.insertId);

      // 4. Insert order items & atomically decrement stock
      for (const item of orderItemsToInsert) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.name, item.price, item.quantity, item.image_url]
        );

        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      if (userId) {
        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
      }

      await connection.commit();
      return { id: orderId, orderNumber, trackingToken, total: computedGrandTotal };
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
    return normalizeOrderRow(rows[0]);
  }

  async getOrderByNumber(orderNumber) {
    const [rows] = await this.pool.query('SELECT * FROM orders WHERE order_number = ? LIMIT 1', [String(orderNumber)]);
    if (!rows[0]) return null;
    return normalizeOrderRow(rows[0]);
  }

  async getOrderByTracking(orderIdOrNumber, phone) {
    const query = `
      SELECT * FROM orders 
      WHERE (id = ? OR order_number = ?) 
      AND (REPLACE(REPLACE(phone, ' ', ''), '-', '') = REPLACE(REPLACE(?, ' ', ''), '-', '') OR email = ?) 
      LIMIT 1
    `;
    const cleanPhone = String(phone || '').trim();
    const [rows] = await this.pool.query(query, [
      isNaN(Number(orderIdOrNumber)) ? 0 : Number(orderIdOrNumber),
      String(orderIdOrNumber).trim(),
      cleanPhone,
      cleanPhone
    ]);
    if (!rows[0]) return null;
    return normalizeOrderRow(rows[0]);
  }

  async updateOrderStatus(orderId, status) {
    const [result] = await this.pool.query('UPDATE orders SET status = ? WHERE id = ?', [String(status), Number(orderId)]);
    return result.affectedRows > 0;
  }

  async updateOrderPaymentStatus(orderId, paymentStatus, paymentMethod = null) {
    const fields = ['payment_status = ?'];
    const params = [String(paymentStatus)];
    if (paymentMethod) {
      fields.push('payment_method = ?');
      params.push(String(paymentMethod));
    }
    params.push(Number(orderId));
    const [result] = await this.pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);
    return result.affectedRows > 0;
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
      return rows.map(normalizeOrderRow);
    }
    const [rows] = await this.pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows.map(normalizeOrderRow);
  }

  async getAdminDashboardStats() {
    const [totalRevenueRow] = await this.pool.query('SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE status != "cancelled"');
    const [totalOrdersRow] = await this.pool.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [newOrdersRow] = await this.pool.query('SELECT COUNT(*) AS new_orders FROM orders WHERE status = "pending"');
    const [outOfStockRow] = await this.pool.query('SELECT COUNT(*) AS out_of_stock FROM products WHERE stock = 0');
    const [lowStockRow] = await this.pool.query('SELECT COUNT(*) AS low_stock FROM products WHERE stock > 0 AND stock <= 3');
    
    // Status counts
    const [statusCounts] = await this.pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');
    
    // Monthly Orders (Last 6 months)
    const [monthlyRows] = await this.pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS order_count,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    // Top Selling Products
    const [topProducts] = await this.pool.query(`
      SELECT oi.product_id, oi.name, SUM(oi.quantity) as total_sold, SUM(oi.price * oi.quantity) as total_sales
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'cancelled'
      GROUP BY oi.product_id, oi.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Low stock items list
    const [lowStockProducts] = await this.pool.query(`
      SELECT id, name, price, stock, image_url FROM products WHERE stock <= 3 ORDER BY stock ASC LIMIT 6
    `);

    return {
      totalRevenue: Number(totalRevenueRow[0]?.total_revenue || 0),
      totalOrders: Number(totalOrdersRow[0]?.total_orders || 0),
      newOrders: Number(newOrdersRow[0]?.new_orders || 0),
      outOfStockCount: Number(outOfStockRow[0]?.out_of_stock || 0),
      lowStockCount: Number(lowStockRow[0]?.low_stock || 0),
      statusBreakdown: statusCounts.reduce((acc, row) => ({ ...acc, [row.status]: Number(row.count) }), {}),
      monthlyTrends: monthlyRows,
      topProducts,
      lowStockProducts
    };
  }

  async addToWishlist(userId, productId) {
    await this.pool.query(
      'INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
      [Number(userId), Number(productId)]
    );
    return true;
  }

  async removeFromWishlist(userId, productId) {
    const [result] = await this.pool.query(
      'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [Number(userId), Number(productId)]
    );
    return result.affectedRows > 0;
  }

  async getWishlist(userId) {
    const [rows] = await this.pool.query(
      `SELECT p.*, c.name AS category_name, w.created_at AS added_at
       FROM wishlist_items w
       INNER JOIN products p ON p.id = w.product_id
       INNER JOIN categories c ON c.id = p.category_id
       WHERE w.user_id = ?
       ORDER BY w.id DESC`,
      [Number(userId)]
    );
    return rows.map(normalizeProductRow);
  }

  async isInWishlist(userId, productId) {
    const [rows] = await this.pool.query(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ? LIMIT 1',
      [Number(userId), Number(productId)]
    );
    return rows.length > 0;
  }

  async createSession(sessionData) {
    const { sessionId, userId, userAgent = 'unknown', ip = 'unknown', expiresAt, lastSeen } = sessionData;
    await this.pool.query(
      'INSERT INTO sessions (session_id, user_id, user_agent, ip, revoked, expires_at, last_seen) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [
        String(sessionId),
        Number(userId),
        String(userAgent || 'unknown').substring(0, 255),
        String(ip || 'unknown').substring(0, 64),
        Number(expiresAt),
        Number(lastSeen || Date.now())
      ]
    );
    return true;
  }

  async getSession(sessionId) {
    const [rows] = await this.pool.query('SELECT * FROM sessions WHERE session_id = ? LIMIT 1', [String(sessionId)]);
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      sessionId: row.session_id,
      userId: Number(row.user_id),
      userAgent: row.user_agent,
      ip: row.ip,
      revoked: Boolean(row.revoked),
      expiresAt: Number(row.expires_at),
      lastSeen: Number(row.last_seen),
      createdAt: row.created_at
    };
  }

  async touchSession(sessionId, lastSeen = Date.now()) {
    await this.pool.query('UPDATE sessions SET last_seen = ? WHERE session_id = ?', [Number(lastSeen), String(sessionId)]);
    return true;
  }

  async revokeSession(sessionId) {
    const [result] = await this.pool.query('UPDATE sessions SET revoked = 1 WHERE session_id = ?', [String(sessionId)]);
    return result.affectedRows > 0;
  }

  async getUserSessions(userId) {
    const [rows] = await this.pool.query(
      'SELECT * FROM sessions WHERE user_id = ? AND revoked = 0 AND expires_at > ? ORDER BY last_seen DESC',
      [Number(userId), Date.now()]
    );
    return rows.map(row => ({
      sessionId: row.session_id,
      userAgent: row.user_agent,
      ip: row.ip,
      createdAt: row.created_at,
      lastSeen: new Date(Number(row.last_seen)).toISOString()
    }));
  }

  async revokeAllUserSessions(userId) {
    await this.pool.query('UPDATE sessions SET revoked = 1 WHERE user_id = ?', [Number(userId)]);
    return true;
  }

  // --- Admin Customers Management ---
  async getAdminUsers(options = {}) {
    const { search, page = 1, limit = 20 } = options;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const queryParams = [];
    let whereClause = ' WHERE 1 = 1';

    if (search) {
      whereClause += ' AND (LOWER(u.username) LIKE ? OR LOWER(u.email) LIKE ? OR u.phone LIKE ?)';
      const term = `%${String(search).trim().toLowerCase()}%`;
      queryParams.push(term, term, term);
    }

    const countSql = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const [countRows] = await this.pool.query(countSql, queryParams);
    const total = Number(countRows[0]?.total || 0);

    const usersSql = `
      SELECT u.id, u.username, u.email, u.phone, u.role, u.created_at,
             COUNT(DISTINCT o.id) AS orders_count,
             COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0 END), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      ${whereClause}
      GROUP BY u.id, u.username, u.email, u.phone, u.role, u.created_at
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.pool.query(usersSql, [...queryParams, limitNum, offset]);
    return {
      users: rows.map(r => ({
        id: Number(r.id),
        username: r.username,
        email: r.email,
        phone: r.phone,
        role: r.role,
        created_at: r.created_at,
        orders_count: Number(r.orders_count || 0),
        total_spent: Number(r.total_spent || 0)
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }

  async getAdminUserById(userId) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    const orders = await this.getOrders(userId);
    return {
      ...safeUser,
      orders
    };
  }

  // --- Coupons Management ---
  async getCoupons(options = {}) {
    const { search, status } = options;
    let sql = 'SELECT * FROM coupons WHERE 1 = 1';
    const params = [];
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND LOWER(code) LIKE ?';
      params.push(`%${String(search).trim().toLowerCase()}%`);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await this.pool.query(sql, params);
    return rows.map(r => ({
      id: Number(r.id),
      code: r.code,
      discount_percent: Number(r.discount_percent),
      discount_amount: Number(r.discount_amount),
      min_order_amount: Number(r.min_order_amount),
      max_uses: Number(r.max_uses),
      uses_count: Number(r.uses_count),
      status: r.status,
      expires_at: r.expires_at,
      created_at: r.created_at
    }));
  }

  async getCouponByCode(code) {
    if (!code) return null;
    const [rows] = await this.pool.query('SELECT * FROM coupons WHERE LOWER(code) = LOWER(?) LIMIT 1', [String(code).trim()]);
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: Number(r.id),
      code: r.code,
      discount_percent: Number(r.discount_percent),
      discount_amount: Number(r.discount_amount),
      min_order_amount: Number(r.min_order_amount),
      max_uses: Number(r.max_uses),
      uses_count: Number(r.uses_count),
      status: r.status,
      expires_at: r.expires_at,
      created_at: r.created_at
    };
  }

  async createCoupon(data) {
    const code = String(data.code || '').trim().toUpperCase();
    if (!code) throw new Error('رمز الكوبون مطلوب');
    const [result] = await this.pool.query(
      'INSERT INTO coupons (code, discount_percent, discount_amount, min_order_amount, max_uses, status, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        code,
        Math.max(0, Math.min(100, Number(data.discountPercent || data.discount_percent || 0))),
        Math.max(0, Number(data.discountAmount || data.discount_amount || 0)),
        Math.max(0, Number(data.minOrderAmount || data.min_order_amount || 0)),
        Math.max(1, Number(data.maxUses || data.max_uses || 100)),
        data.status || 'active',
        data.expiresAt || data.expires_at || null
      ]
    );
    return Number(result.insertId);
  }

  async updateCoupon(id, data) {
    const updates = [];
    const params = [];
    if (data.status) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.max_uses !== undefined || data.maxUses !== undefined) {
      updates.push('max_uses = ?');
      params.push(Number(data.max_uses || data.maxUses));
    }
    if (data.discount_percent !== undefined || data.discountPercent !== undefined) {
      updates.push('discount_percent = ?');
      params.push(Number(data.discount_percent || data.discountPercent));
    }
    if (data.discount_amount !== undefined || data.discountAmount !== undefined) {
      updates.push('discount_amount = ?');
      params.push(Number(data.discount_amount || data.discountAmount));
    }
    if (data.min_order_amount !== undefined || data.minOrderAmount !== undefined) {
      updates.push('min_order_amount = ?');
      params.push(Number(data.min_order_amount || data.minOrderAmount));
    }
    if (data.expires_at !== undefined || data.expiresAt !== undefined) {
      updates.push('expires_at = ?');
      params.push(data.expires_at || data.expiresAt || null);
    }
    if (!updates.length) return true;
    params.push(Number(id));
    const [result] = await this.pool.query(`UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`, params);
    return result.affectedRows > 0;
  }

  async deleteCoupon(id) {
    const [result] = await this.pool.query('DELETE FROM coupons WHERE id = ?', [Number(id)]);
    return result.affectedRows > 0;
  }

  async incrementCouponUsage(code) {
    if (!code) return;
    await this.pool.query('UPDATE coupons SET uses_count = uses_count + 1 WHERE LOWER(code) = LOWER(?)', [String(code).trim()]);
  }

  // --- Product Reviews Management ---
  async getProductReviews(productId) {
    const [rows] = await this.pool.query(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.status, r.created_at, u.username
       FROM product_reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [Number(productId)]
    );
    return rows.map(r => ({
      id: Number(r.id),
      productId: Number(r.product_id),
      userId: Number(r.user_id),
      username: r.username,
      rating: Number(r.rating),
      comment: r.comment,
      status: r.status,
      created_at: r.created_at
    }));
  }

  async createProductReview(data) {
    const [result] = await this.pool.query(
      'INSERT INTO product_reviews (product_id, user_id, rating, comment, status) VALUES (?, ?, ?, ?, ?)',
      [
        Number(data.productId),
        Number(data.userId),
        Math.max(1, Math.min(5, Math.trunc(Number(data.rating) || 5))),
        String(data.comment || '').trim().substring(0, 1000),
        data.status || 'approved'
      ]
    );
    return Number(result.insertId);
  }

  async getAdminReviews(options = {}) {
    const { status, productId, search, page = 1, limit = 20 } = options;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const queryParams = [];
    let whereClause = ' WHERE 1 = 1';
    if (status && status !== 'all') {
      whereClause += ' AND r.status = ?';
      queryParams.push(status);
    }
    if (productId) {
      whereClause += ' AND r.product_id = ?';
      queryParams.push(Number(productId));
    }
    if (search) {
      whereClause += ' AND (LOWER(p.name) LIKE ? OR LOWER(u.username) LIKE ? OR LOWER(r.comment) LIKE ?)';
      const term = `%${String(search).trim().toLowerCase()}%`;
      queryParams.push(term, term, term);
    }

    const countSql = `SELECT COUNT(*) as total FROM product_reviews r JOIN products p ON p.id = r.product_id JOIN users u ON u.id = r.user_id ${whereClause}`;
    const [countRows] = await this.pool.query(countSql, queryParams);
    const total = Number(countRows[0]?.total || 0);

    const reviewsSql = `
      SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.status, r.created_at,
             p.name AS product_name, p.image_url AS product_image, u.username, u.email
      FROM product_reviews r
      JOIN products p ON p.id = r.product_id
      JOIN users u ON u.id = r.user_id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.pool.query(reviewsSql, [...queryParams, limitNum, offset]);
    return {
      reviews: rows.map(r => ({
        id: Number(r.id),
        productId: Number(r.product_id),
        productName: r.product_name,
        productImage: r.product_image,
        userId: Number(r.user_id),
        username: r.username,
        email: r.email,
        rating: Number(r.rating),
        comment: r.comment,
        status: r.status,
        created_at: r.created_at
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }

  async updateReviewStatus(id, status) {
    const allowed = ['approved', 'pending', 'rejected'];
    if (!allowed.includes(status)) throw new Error('حالة المراجعة غير صالحة');
    const [result] = await this.pool.query('UPDATE product_reviews SET status = ? WHERE id = ?', [status, Number(id)]);
    return result.affectedRows > 0;
  }

  async deleteReview(id) {
    const [result] = await this.pool.query('DELETE FROM product_reviews WHERE id = ?', [Number(id)]);
    return result.affectedRows > 0;
  }
}

function createMysqlRepository(pool) {
  return new MysqlRepository(pool);
}

function createFallbackRepository() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('In-memory fallback repository is strictly disabled in production. A MySQL database connection is required.');
  }

  const isDev = process.env.NODE_ENV !== 'production';
  const state = {
    products: [...DEFAULT_PRODUCTS],
    wilayas: [...DEFAULT_WILAYAS],
    users: isDev ? [
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
    ] : [],
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
      const uId = Number(userId);
      if (!uId) throw new Error('معرف المستخدم مطلوب للسلة');
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
      const uId = Number(userId);
      if (!uId) return [];
      return state.cartItems.filter(entry => Number(entry.user_id) === uId && !entry.processed).map(entry => {
        const product = state.products.find(item => Number(item.id) === Number(entry.product_id)) || {};
        return { id: entry.id, product_id: entry.product_id, name: product.name || 'منتج', category: product.category || '', price: Number(product.price) || 0, quantity: entry.quantity, stock: Number(product.stock || 0), image_url: product.image_url || '/images/product-placeholder.jpg' };
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
    async getWilayas() {
      return [...state.wilayas];
    },
    async getWilayaById(id) {
      return state.wilayas.find(w => w.id === Number(id) || w.code === String(id)) || null;
    },
    async updateWilayaPrice(id, data) {
      const wilaya = state.wilayas.find(w => w.id === Number(id) || w.code === String(id));
      if (!wilaya) return false;
      if (data.home_delivery_price !== undefined) wilaya.home_delivery_price = Number(data.home_delivery_price);
      if (data.desk_delivery_price !== undefined) wilaya.desk_delivery_price = Number(data.desk_delivery_price);
      if (data.delivery_time_days !== undefined) wilaya.delivery_time_days = String(data.delivery_time_days);
      if (data.is_active !== undefined) wilaya.is_active = Boolean(data.is_active);
      return true;
    },
    async createOrder(orderData) {
      const userId = orderData.user_id || orderData.userId ? Number(orderData.user_id || orderData.userId) : null;
      const cartInput = Array.isArray(orderData.cart) ? orderData.cart : null;
      let cartItems = [];
      if (cartInput && cartInput.length > 0) {
        cartItems = cartInput.map(item => ({ product_id: Number(item.id || item.product_id), quantity: Number(item.quantity) || 1, name: item.name || 'منتج', price: Number(item.price) || 0, image_url: item.image || item.image_url || '/images/product-placeholder.jpg' }));
      } else if (userId) {
        cartItems = await repo.getCartItems(userId);
      }
      if (!cartItems.length && Number(orderData.total || 0) === 0) throw new Error('السلة فارغة، يتعذر إنشاء الطلب');

      // Stock guard check
      for (const item of cartItems) {
        const product = state.products.find(entry => Number(entry.id) === Number(item.product_id));
        if (product && Number(product.stock) < Number(item.quantity)) {
          throw new Error(`الكمية المطلوبة من "${product.name}" غير متوفرة (المتبقي في المخزون: ${product.stock})`);
        }
      }

      const shippingInfo = orderData.shippingInfo || {};
      const total = Number(orderData.total || cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0));
      const orderId = state.nextOrderId++;
      const orderNumber = `DZ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const trackingToken = crypto.randomBytes(16).toString('hex');

      const newOrder = {
        id: orderId,
        order_number: orderNumber,
        user_id: userId,
        total,
        status: 'pending',
        payment_method: orderData.paymentMethod || shippingInfo.paymentMethod || 'cod',
        payment_status: orderData.paymentStatus || 'pending',
        shipping_full_name: shippingInfo.fullName || '',
        phone: shippingInfo.phone || '',
        email: shippingInfo.email || '',
        address: shippingInfo.address || '',
        city: shippingInfo.city || '',
        wilaya_id: shippingInfo.wilayaId ? Number(shippingInfo.wilayaId) : null,
        wilaya_name: shippingInfo.wilayaName || shippingInfo.city || '',
        delivery_type: shippingInfo.deliveryType || 'home',
        shipping_cost: Number(shippingInfo.shippingCost || 0),
        postal_code: shippingInfo.postalCode || '',
        notes: shippingInfo.notes || '',
        shipping_method: shippingInfo.shippingMethod || 'standard',
        tracking_token: trackingToken,
        created_at: new Date().toISOString()
      };

      state.orders.push(newOrder);

      for (const item of cartItems) {
        state.orderItems.push({ id: Date.now() + Math.random(), order_id: orderId, product_id: item.product_id, name: item.name, price: Number(item.price) || 0, quantity: Number(item.quantity) || 1, image_url: item.image_url || '/images/product-placeholder.jpg' });
        const product = state.products.find(entry => Number(entry.id) === Number(item.product_id));
        if (product) product.stock = Math.max(0, Number(product.stock) - Number(item.quantity || 1));
      }

      if (userId) {
        state.cartItems.forEach(item => { if (Number(item.user_id) === userId) item.processed = 1; });
      }

      return { id: orderId, orderNumber, trackingToken };
    },
    async getOrderById(id) {
      const order = state.orders.find(entry => Number(entry.id) === Number(id));
      return order ? normalizeOrderRow(order) : null;
    },
    async getOrderByNumber(orderNumber) {
      const order = state.orders.find(entry => String(entry.order_number) === String(orderNumber));
      return order ? normalizeOrderRow(order) : null;
    },
    async getOrderByTracking(orderIdOrNumber, phone) {
      const cleanPhone = String(phone || '').replace(/[\s-]/g, '');
      const order = state.orders.find(entry => {
        const idMatch = String(entry.id) === String(orderIdOrNumber) || String(entry.order_number) === String(orderIdOrNumber);
        const phoneMatch = String(entry.phone || '').replace(/[\s-]/g, '') === cleanPhone || String(entry.email || '').toLowerCase() === cleanPhone.toLowerCase();
        return idMatch && phoneMatch;
      });
      return order ? normalizeOrderRow(order) : null;
    },
    async updateOrderStatus(orderId, status) {
      const order = state.orders.find(entry => Number(entry.id) === Number(orderId));
      if (!order) return false;
      order.status = String(status);
      return true;
    },
    async updateOrderPaymentStatus(orderId, paymentStatus, paymentMethod = null) {
      const order = state.orders.find(entry => Number(entry.id) === Number(orderId));
      if (!order) return false;
      order.payment_status = String(paymentStatus);
      if (paymentMethod) order.payment_method = String(paymentMethod);
      return true;
    },
    async getOrderItems(orderId) {
      return state.orderItems.filter(entry => Number(entry.order_id) === Number(orderId));
    },
    async getOrders(userId = null) {
      if (userId) return state.orders.filter(entry => Number(entry.user_id) === Number(userId)).map(normalizeOrderRow);
      return state.orders.map(normalizeOrderRow);
    },
    async getAdminDashboardStats() {
      const nonCancelled = state.orders.filter(o => o.status !== 'cancelled');
      const totalRevenue = nonCancelled.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalOrders = state.orders.length;
      const newOrders = state.orders.filter(o => o.status === 'pending').length;
      const outOfStockCount = state.products.filter(p => Number(p.stock) === 0).length;
      const lowStockCount = state.products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 3).length;

      const statusBreakdown = state.orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalRevenue,
        totalOrders,
        newOrders,
        outOfStockCount,
        lowStockCount,
        statusBreakdown,
        monthlyTrends: [
          { month: '2026-03', order_count: 5, revenue: 150000 },
          { month: '2026-04', order_count: 8, revenue: 230000 },
          { month: '2026-05', order_count: 12, revenue: 380000 },
          { month: '2026-06', order_count: 15, revenue: 490000 },
          { month: '2026-07', order_count: 22, revenue: 680000 },
          { month: '2026-08', order_count: totalOrders, revenue: totalRevenue }
        ],
        topProducts: state.products.slice(0, 5).map(p => ({
          product_id: p.id,
          name: p.name,
          total_sold: Math.floor(Math.random() * 20) + 5,
          total_sales: p.price * 10
        })),
        lowStockProducts: state.products.filter(p => Number(p.stock) <= 3)
      };
    },
    async addToWishlist(userId, productId) {
      if (!state.wishlist) state.wishlist = [];
      const exists = state.wishlist.some(w => w.userId === Number(userId) && w.productId === Number(productId));
      if (!exists) {
        state.wishlist.push({ userId: Number(userId), productId: Number(productId), createdAt: new Date().toISOString() });
      }
      return true;
    },
    async removeFromWishlist(userId, productId) {
      if (!state.wishlist) state.wishlist = [];
      const initLen = state.wishlist.length;
      state.wishlist = state.wishlist.filter(w => !(w.userId === Number(userId) && w.productId === Number(productId)));
      return state.wishlist.length < initLen;
    },
    async getWishlist(userId) {
      if (!state.wishlist) state.wishlist = [];
      const userItems = state.wishlist.filter(w => w.userId === Number(userId));
      return userItems.map(w => {
        const prod = state.products.find(p => p.id === w.productId);
        return prod ? { ...prod, added_at: w.createdAt } : null;
      }).filter(Boolean);
    },
    async isInWishlist(userId, productId) {
      if (!state.wishlist) state.wishlist = [];
      return state.wishlist.some(w => w.userId === Number(userId) && w.productId === Number(productId));
    },
    async createSession(sessionData) {
      if (!state.sessions) state.sessions = [];
      const session = {
        sessionId: String(sessionData.sessionId),
        userId: Number(sessionData.userId),
        userAgent: String(sessionData.userAgent || 'unknown'),
        ip: String(sessionData.ip || 'unknown'),
        revoked: false,
        expiresAt: Number(sessionData.expiresAt),
        lastSeen: Number(sessionData.lastSeen || Date.now()),
        createdAt: new Date().toISOString()
      };
      state.sessions.push(session);
      return true;
    },
    async getSession(sessionId) {
      if (!state.sessions) state.sessions = [];
      const session = state.sessions.find(s => s.sessionId === String(sessionId));
      if (!session) return null;
      return { ...session };
    },
    async touchSession(sessionId, lastSeen = Date.now()) {
      if (!state.sessions) state.sessions = [];
      const session = state.sessions.find(s => s.sessionId === String(sessionId));
      if (session) session.lastSeen = Number(lastSeen);
      return true;
    },
    async revokeSession(sessionId) {
      if (!state.sessions) state.sessions = [];
      const session = state.sessions.find(s => s.sessionId === String(sessionId));
      if (!session) return false;
      session.revoked = true;
      return true;
    },
    async getUserSessions(userId) {
      if (!state.sessions) state.sessions = [];
      const now = Date.now();
      return state.sessions
        .filter(s => s.userId === Number(userId) && !s.revoked && s.expiresAt > now)
        .map(s => ({
          sessionId: s.sessionId,
          userAgent: s.userAgent,
          ip: s.ip,
          createdAt: s.createdAt,
          lastSeen: new Date(Number(s.lastSeen)).toISOString()
        }));
    },
    async revokeAllUserSessions(userId) {
      if (!state.sessions) state.sessions = [];
      state.sessions.forEach(s => {
        if (s.userId === Number(userId)) s.revoked = true;
      });
      return true;
    },

    // --- In-Memory Admin Customers ---
    async getAdminUsers(options = {}) {
      const { search, page = 1, limit = 20 } = options;
      let list = state.users.map(u => {
        const userOrders = (state.orders || []).filter(o => Number(o.user_id) === Number(u.id));
        const totalSpent = userOrders.reduce((sum, o) => o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum, 0);
        return {
          id: Number(u.id),
          username: u.username,
          email: u.email,
          phone: u.phone,
          role: u.role,
          created_at: u.created_at || new Date().toISOString(),
          orders_count: userOrders.length,
          total_spent: totalSpent
        };
      });

      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q)));
      }

      const total = list.length;
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.max(1, Number(limit) || 20);
      const offset = (pageNum - 1) * limitNum;

      return {
        users: list.slice(offset, offset + limitNum),
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    },

    async getAdminUserById(userId) {
      const user = state.users.find(u => Number(u.id) === Number(userId));
      if (!user) return null;
      const { password: _, ...safeUser } = user;
      const addresses = (user.addresses || []).map(a => ({ ...a }));
      const orders = (state.orders || []).filter(o => Number(o.user_id) === Number(userId));
      return {
        ...safeUser,
        addresses,
        orders
      };
    },

    // --- In-Memory Coupons ---
    async getCoupons(options = {}) {
      if (!state.coupons) {
        state.coupons = [
          { id: 1, code: 'SAVE10', discount_percent: 10, discount_amount: 0, min_order_amount: 1000, max_uses: 500, uses_count: 5, status: 'active', expires_at: null, created_at: new Date().toISOString() },
          { id: 2, code: 'SAVE20', discount_percent: 20, discount_amount: 0, min_order_amount: 3000, max_uses: 200, uses_count: 12, status: 'active', expires_at: null, created_at: new Date().toISOString() },
          { id: 3, code: 'RAMADAN500', discount_percent: 0, discount_amount: 500, min_order_amount: 5000, max_uses: 100, uses_count: 35, status: 'active', expires_at: null, created_at: new Date().toISOString() }
        ];
      }
      let list = [...state.coupons];
      if (options.status && options.status !== 'all') {
        list = list.filter(c => c.status === options.status);
      }
      if (options.search) {
        const q = String(options.search).toUpperCase();
        list = list.filter(c => c.code.includes(q));
      }
      return list;
    },

    async getCouponByCode(code) {
      if (!state.coupons) {
        state.coupons = [
          { id: 1, code: 'SAVE10', discount_percent: 10, discount_amount: 0, min_order_amount: 1000, max_uses: 500, uses_count: 5, status: 'active', expires_at: null, created_at: new Date().toISOString() },
          { id: 2, code: 'SAVE20', discount_percent: 20, discount_amount: 0, min_order_amount: 3000, max_uses: 200, uses_count: 12, status: 'active', expires_at: null, created_at: new Date().toISOString() }
        ];
      }
      const c = state.coupons.find(item => item.code.toUpperCase() === String(code).trim().toUpperCase());
      return c ? { ...c } : null;
    },

    async createCoupon(data) {
      if (!state.coupons) state.coupons = [];
      const code = String(data.code || '').trim().toUpperCase();
      if (!code) throw new Error('رمز الكوبون مطلوب');
      if (state.coupons.some(c => c.code === code)) {
        throw new Error('رمز الكوبون مستخدم مسبقاً');
      }
      const id = state.coupons.length + 1;
      const newCoupon = {
        id,
        code,
        discount_percent: Number(data.discountPercent || data.discount_percent || 0),
        discount_amount: Number(data.discountAmount || data.discount_amount || 0),
        min_order_amount: Number(data.minOrderAmount || data.min_order_amount || 0),
        max_uses: Number(data.maxUses || data.max_uses || 100),
        uses_count: 0,
        status: data.status || 'active',
        expires_at: data.expiresAt || data.expires_at || null,
        created_at: new Date().toISOString()
      };
      state.coupons.push(newCoupon);
      return id;
    },

    async updateCoupon(id, data) {
      if (!state.coupons) state.coupons = [];
      const c = state.coupons.find(item => item.id === Number(id));
      if (!c) return false;
      if (data.status) c.status = data.status;
      if (data.max_uses !== undefined || data.maxUses !== undefined) c.max_uses = Number(data.max_uses || data.maxUses);
      if (data.discount_percent !== undefined || data.discountPercent !== undefined) c.discount_percent = Number(data.discount_percent || data.discountPercent);
      if (data.discount_amount !== undefined || data.discountAmount !== undefined) c.discount_amount = Number(data.discount_amount || data.discountAmount);
      if (data.min_order_amount !== undefined || data.minOrderAmount !== undefined) c.min_order_amount = Number(data.min_order_amount || data.minOrderAmount);
      if (data.expires_at !== undefined || data.expiresAt !== undefined) c.expires_at = data.expires_at || data.expiresAt;
      return true;
    },

    async deleteCoupon(id) {
      if (!state.coupons) state.coupons = [];
      const idx = state.coupons.findIndex(c => c.id === Number(id));
      if (idx === -1) return false;
      state.coupons.splice(idx, 1);
      return true;
    },

    async incrementCouponUsage(code) {
      if (!state.coupons) return;
      const c = state.coupons.find(item => item.code.toUpperCase() === String(code).trim().toUpperCase());
      if (c) c.uses_count = (c.uses_count || 0) + 1;
    },

    // --- In-Memory Product Reviews ---
    async getProductReviews(productId) {
      if (!state.reviews) {
        state.reviews = [
          { id: 1, product_id: 1, user_id: 1, username: 'أحمد بن علي', rating: 5, comment: 'منتج رائع جداً وجودة ممتازة، أنصح به بشدة!', status: 'approved', created_at: new Date().toISOString() },
          { id: 2, product_id: 1, user_id: 2, username: 'سارة مراد', rating: 4, comment: 'توصيل سريع وتغليف احترافي، شكراً لكم.', status: 'approved', created_at: new Date().toISOString() }
        ];
      }
      return state.reviews
        .filter(r => Number(r.product_id) === Number(productId) && r.status === 'approved')
        .map(r => ({
          id: r.id,
          productId: r.product_id,
          userId: r.user_id,
          username: r.username,
          rating: r.rating,
          comment: r.comment,
          status: r.status,
          created_at: r.created_at
        }));
    },

    async createProductReview(data) {
      if (!state.reviews) state.reviews = [];
      const user = state.users.find(u => Number(u.id) === Number(data.userId));
      const id = state.reviews.length + 1;
      const review = {
        id,
        product_id: Number(data.productId),
        user_id: Number(data.userId),
        username: user ? user.username : 'مستخدم',
        rating: Math.max(1, Math.min(5, Math.trunc(Number(data.rating) || 5))),
        comment: String(data.comment || '').trim(),
        status: data.status || 'approved',
        created_at: new Date().toISOString()
      };
      state.reviews.push(review);
      return id;
    },

    async getAdminReviews(options = {}) {
      if (!state.reviews) {
        state.reviews = [
          { id: 1, product_id: 1, user_id: 1, username: 'أحمد بن علي', rating: 5, comment: 'منتج ممتاز، أنصح به', status: 'approved', created_at: new Date().toISOString() },
          { id: 2, product_id: 2, user_id: 1, username: 'أحمد بن علي', rating: 4, comment: 'جيد جداً والتوصيل سريع', status: 'approved', created_at: new Date().toISOString() }
        ];
      }
      let list = state.reviews.map(r => {
        const prod = state.products.find(p => Number(p.id) === Number(r.product_id));
        const user = state.users.find(u => Number(u.id) === Number(r.user_id));
        return {
          id: r.id,
          productId: r.product_id,
          productName: prod ? prod.name : 'منتج',
          productImage: prod ? (prod.image_url || prod.image) : '/images/product-placeholder.jpg',
          userId: r.user_id,
          username: r.username || (user ? user.username : 'مستخدم'),
          email: user ? user.email : '',
          rating: r.rating,
          comment: r.comment,
          status: r.status,
          created_at: r.created_at
        };
      });

      if (options.status && options.status !== 'all') {
        list = list.filter(r => r.status === options.status);
      }
      if (options.productId) {
        list = list.filter(r => Number(r.productId) === Number(options.productId));
      }
      if (options.search) {
        const q = String(options.search).toLowerCase();
        list = list.filter(r => r.productName.toLowerCase().includes(q) || r.username.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q));
      }

      const total = list.length;
      const pageNum = Math.max(1, Number(options.page) || 1);
      const limitNum = Math.max(1, Number(options.limit) || 20);
      const offset = (pageNum - 1) * limitNum;

      return {
        reviews: list.slice(offset, offset + limitNum),
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    },

    async updateReviewStatus(id, status) {
      if (!state.reviews) return false;
      const r = state.reviews.find(item => item.id === Number(id));
      if (!r) return false;
      r.status = status;
      return true;
    },

    async deleteReview(id) {
      if (!state.reviews) return false;
      const idx = state.reviews.findIndex(item => item.id === Number(id));
      if (idx === -1) return false;
      state.reviews.splice(idx, 1);
      return true;
    }
  };
  return repo;
}

module.exports = {
  createMysqlRepository,
  createFallbackRepository,
  DEFAULT_PRODUCTS,
  DEFAULT_WILAYAS
};
