# متجر إلكتروني — E-commerce Store (Full-Stack)

مشروع متجر إلكتروني عربي كامل (Full-Stack)، يدعم اللغة العربية بالكامل (RTL) مع باكند حقيقي (Node.js/Express/MySQL) — وليس مجرد واجهة بـ LocalStorage.

## 🌟 الميزات

- واجهة مستخدم عربية بالكامل (RTL) وتصميم متجاوب
- نظام مصادقة كامل (تسجيل/دخول) عبر JWT
- سلة تسوق، صفحة دفع (Checkout)، تأكيد طلب
- نظام تقييمات ومراجعات للمنتجات (Reviews)
- نظام كوبونات خصم (Coupons)
- **لوحة تحكم أدمن فعلية** (إدارة المنتجات، إدارة الطلبات) — وليست "قادمة قريباً"
- حماية أمنية: Helmet, CORS, Rate Limiting, CSRF protection, bcrypt لتشفير كلمات المرور
- Service Worker (`sw.js`) و PWA manifest

## 🛠️ التقنيات المستخدمة

### الواجهة (Frontend)
- HTML5 / CSS3 (متغيرات CSS مخصصة، بدون إطار عمل CSS خارجي)
- JavaScript (Vanilla، بدون React/Vue) — ملفات منظَّمة في `js/`
- Font Awesome للأيقونات

### الخادم (Backend)
- **Node.js + Express** — بنية MVC منظَّمة (`src/controllers`, `src/routes`, `src/middlewares`)
- **MySQL** (عبر `mysql2`) — نظام migrations خاص (`database/migrate.js`)
- **JWT** (`jsonwebtoken`) للمصادقة
- **bcryptjs** لتشفير كلمات المرور
- **Multer** لرفع الملفات/الصور
- **Helmet + CORS + express-rate-limit** للحماية

## 📁 هيكل المشروع الحقيقي

```
myshop/
├── admin/                  # لوحة تحكم الأدمن (منتجات، طلبات) — HTML مستقل
├── config/
│   └── database.js         # إعداد الاتصال بقاعدة البيانات (نسخة legacy)
├── database/
│   ├── migrate.js          # سكربت تشغيل الـ migrations
│   ├── migrations/         # ملفات SQL للـ migrations (schema + reviews/coupons)
│   └── schema/              # مخطط قاعدة البيانات الكامل
├── src/                     # الباكند الفعلي (بنية MVC)
│   ├── app.js               # نقطة تجميع Express app
│   ├── config/database.js   # إعداد الاتصال (النسخة المستخدمة فعلياً)
│   ├── controllers/         # منطق الأعمال (auth, cart, order, product, user)
│   ├── middlewares/         # auth, admin, csrf, upload, error handling
│   └── routes/               # تعريف المسارات API
├── js/                      # كود الفرونت إند (cart, checkout, products, search...)
├── css/style.css            # التصميم الرئيسي
├── images/                  # صور المنتجات
├── server.js                # نقطة تشغيل الخادم
├── test/                    # اختبارات (Node.js built-in test runner)
└── *.html                   # صفحات الموقع (index, shop, product, cart, checkout...)
```

> ⚠️ ملاحظة: يوجد مجلدان لإعداد قاعدة البيانات (`config/database.js` و `src/config/database.js`) — الفعلي المُستخدَم من `server.js` هو `src/config/database.js`. `config/database.js` على الأرجح ملف قديم من مرحلة تطوير سابقة، يستحق مراجعة لاحقة لتوحيدهما أو حذف غير المُستخدَم.

## 🚀 التثبيت والتشغيل

### المتطلبات
- [Node.js](https://nodejs.org/) v18 أو أحدث
- [MySQL](https://www.mysql.com/) v8.0 أو أحدث

### الخطوات

1. استنسخ المشروع وثبّت الحزم:
   ```bash
   git clone https://github.com/redouanDZ/myshop.git
   cd myshop
   npm install
   ```

2. انسخ ملف البيئة:
   ```bash
   cp .env.example .env
   ```
3. عدّل `.env` بمعلوماتك الخاصة — **لا تستخدم القيم الموجودة في `.env.example` كما هي**، خاصة `JWT_SECRET` و `COOKIE_SECRET`. ولّد قيماً عشوائية خاصة بك:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. أنشئ قاعدة بيانات MySQL فارغة، ثم شغّل الـ migrations لإنشاء كل الجداول تلقائياً:
   ```bash
   npm run migrate
   ```

5. شغّل الخادم:
   ```bash
   npm run dev
   ```
   (أو `npm start` للتشغيل بدون إعادة تحميل تلقائي)

6. افتح [http://localhost:3000](http://localhost:3000) — الموقع والباكند يعملان معاً من نفس الخادم.

7. للوصول للوحة تحكم الأدمن، افتح `admin/index.html` (يتطلب حساب أدمن).

## 🧪 الاختبارات

```bash
npm test
```

## 🛡️ ملاحظات أمنية مهمة قبل النشر الفعلي

- **غيّر `JWT_SECRET` و `COOKIE_SECRET` و `DB_PASSWORD`** لقيم فريدة خاصة بك دائماً — لا تنشر المشروع أبداً بالقيم الموجودة في `.env.example`
- تأكد أن `.env` (وليس `.env.example`) مُستثنى من Git (موجود بالفعل في `.gitignore`)
- راجع `src/middlewares/adminMiddleware.js` للتأكد من أن مسارات الأدمن محمية بشكل صحيح قبل أي نشر عام

## 📄 الترخيص

راجع ملف `LICENSE` للتفاصيل.

---

آخر تحديث للتوثيق: أوت 2026
