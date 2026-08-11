/**
 * مشغّل الترحيلات التلقائي لـ MySQL (Automated Database Migration Runner)
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = require('../config/database.js').getConfig();

  console.log(`🚀 بدء الترحيلات لقاعدة البيانات: ${dbConfig.database} على البيئة: [${env}]...`);

  let pool;
  try {
    pool = mysql.createPool({
      ...dbConfig,
      multipleStatements: true,
      waitForConnections: true,
      connectionLimit: 5
    });

    // 1. إنشاء جدول سجل الترحيلات إذا لم يكن موجوداً
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. جلب قائمة الترحيلات المنفذة سابقاً
    const [rows] = await pool.query('SELECT version FROM schema_migrations');
    const executedVersions = new Set(rows.map(r => r.version));

    // 3. قراءة ملفات الترحيل في مجلد migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    let count = 0;
    for (const file of files) {
      if (!executedVersions.has(file)) {
        console.log(`⏳ جاري تنفيذ الترحيل: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        if (sql.trim()) {
          const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();
            await connection.query(sql);
            await connection.query('INSERT INTO schema_migrations (version) VALUES (?)', [file]);
            await connection.commit();
            console.log(`✅ تم تنفيذ الترحيل بنجاح: ${file}`);
            count++;
          } catch (err) {
            await connection.rollback();
            console.error(`❌ فشل الترحيل في الملف [${file}]:`, err.message);
            throw err;
          } finally {
            connection.release();
          }
        }
      }
    }

    if (count === 0) {
      console.log('✨ قاعدة البيانات محدثة بالكامل، لا توجد ترحيلات جديدة لتنفيذها.');
    } else {
      console.log(`🎉 اكتمل تنفيذ ${count} ترحيل(ات) بنجاح!`);
    }
  } catch (error) {
    console.error('❌ خطأ غير متوقع أثناء عملية الترحيل:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
