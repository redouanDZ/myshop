# إعداد وتشغيل متجر الإلكتروني

## المتطلبات الأساسية

- Node.js (الإصدار 14 أو أحدث)
- MySQL (الإصدار 5.7 أو أحدث)
- npm أو yarn

## إعداد قاعدة البيانات

1. قم بإنشاء قاعدة بيانات جديدة باسم `ecommerce_store`:
   ```sql
   CREATE DATABASE ecommerce_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. قم بتشغيل الخادم:
   ```bash
   npm install
   npm run dev
   ```

3. افتح المتصفح وانتقل إلى `http://localhost:3000`

## إعدادات البيئة

1. انسخ ملف `.env.example` إلى `.env`:
   ```bash
   cp .env.example .env
   ```

2. قم بتعديل ملف `.env` مع إعدادات قاعدة البيانات الخاصة بك:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=ecommerce_store
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   NODE_ENV=development
   ```

## اختبار الاتصال بقاعدة البيانات

1. افتح المتصفح وانتقل إلى `http://localhost:3000/test-db-connection.html`
2. اضغط على أزرار الاختبار للتحقق من الاتصال:
   - اختبار الاتصال المباشر
   - اختبار الاتصال عبر الخادم
   - اختبار استعلام المنتجات
   - اختبار استعلام المستخدمين

## تشغيل المشروع

### بيئة التطوير
```bash
npm run dev
```

### بيئة الإنتاج
```bash
npm start
```

## الهيكل الجديد للمشروع

- `server.js`: الخادم الرئيسي للبرنامج
- `config/database.js`: إعدادات قاعدة البيانات
- `.env`: متغيرات البيئة (يجب نسخه من .env.example)
- `test-db-connection.html`: صفحة لاختبار الاتصال بقاعدة البيانات
- `js/`: ملفات الواجهة الأمامية
  - `db-connection.js`: واجهة الاتصال بقاعدة البيانات
  - `user-system.js`: نظام إدارة المستخدمين
  - `cart-new.js`: نظام عربة التسوق
  - `products.js`: نظام إدارة المنتجات
  - `checkout.js`: نظام الدفع والطلبات
- `admin/`: لوحة تحكم المدير

## ميزات الأمان الجديدة

1. تشفير كلمات المرور باستخدام bcrypt
2. مصادقة المستخدمين باستخدام JWT
3. حماية نقاط النهاية باستخدام Middleware
4. تقييد معدل الطلبات (Rate Limiting)
5. حماية HTTP headers باستخدام Helmet
6. تمكين CORS لطلاب عبر النطاقات

## تحسينات الأداء

1. استخدام connection pooling لقاعدة البيانات
2. تحسين استعلامات قاعدة البيانات
3. تخزين مؤقت (Caching) للجلسات
4. تحسين تحميل الموارد

## ملاحظات هامة

- تأكد من تحديث ملف `.env` مع بيانات قاعدة البيانات الخاصة بك
- قم بتغيير مفتاح JWT_SECRET في بيئة الإنتاج
- تأكد من منح صلاحيات قاعدة البيانات المناسبة
