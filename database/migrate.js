/**
 * مشغّل الترحيلات التلقائي لـ MySQL (Automated Database Migration Runner)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function splitSqlStatements(sql) {
  return sql
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);
}

async function runMigrations() {
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = require('../src/config/database.js').getConfig();

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

            const statements = splitSqlStatements(sql);
            for (const statement of statements) {
              try {
                await connection.query(statement);
              } catch (stmtErr) {
                const ignorableCodes = [
                  'ER_DUP_FIELDNAME',
                  'ER_DUP_KEYNAME',
                  'ER_TABLE_EXISTS_ERROR',
                  'ER_CANT_DROP_FIELD_OR_KEY'
                ];
                const ignorableErrnos = [1060, 1061, 1050, 1091];

                if (ignorableCodes.includes(stmtErr.code) || ignorableErrnos.includes(stmtErr.errno)) {
                  // Idempotent schema condition (e.g., column/index/table already exists during upgrade or fresh run)
                  console.log(`   ℹ️ [تجاوز آمن]: ${stmtErr.message}`);
                } else {
                  console.error(`❌ خطأ في تنفيذ عبارة SQL [${statement.slice(0, 100)}...]:`, stmtErr.message);
                  throw stmtErr;
                }
              }
            }

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
