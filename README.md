# متجر إلكتروني متكامل — MYSHOP E-Commerce Platform (Full-Stack & Production-Ready)

[![CI Quality Gate](https://github.com/redouanDZ/myshop/actions/workflows/ci.yml/badge.svg)](https://github.com/redouanDZ/myshop/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Security Status](https://img.shields.io/badge/security-httpOnly%20cookies%20%7C%20CSRF%20%7C%20CSP-blue.svg)](https://github.com/redouanDZ/myshop)
[![Tests Passing](https://img.shields.io/badge/tests-52%2F52%20passing-success.svg)](https://github.com/redouanDZ/myshop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

منصة متجر إلكتروني تجارية متكاملة وعالية الأداء والأمان مبنية بأحدث معايير الويب والتجارة الإلكترونية في الجزائر والعالم العربي، تدعم 3 لغات (العربية RTL، الفرنسية، الإنجليزية) مع معمارية قوية وقابلة للتوسع (Node.js / Express / MySQL 8.0).

---

## 🌟 الميزات الرئيسية (Key Features)

### 🛒 تجربة التسوق والطلب (Shopping & Checkout):
- **دعم 3 لغات واتجاهات**: تبديل فوري وسلس بين العربية (RTL)، الفرنسية (LTR)، والإنجليزية (LTR).
- **طلب سريع بضغطة زر (1-Click COD Direct Checkout)**: نموذج شراء سريع ومباشر في صفحة كل منتج لزيادة معدل التحويل (Conversion Rate).
- **إدارة السلة والمفضلة**: مزامنة فورية لسلة الضيوف (Guest Cart) والمستخدمين المسجلين.
- **توصيل مخصص لـ 58 ولاية جزائرية**: حساب تلقائي لتكاليف التوصيل للمنزل أو المكتب (Stop Desk).
- **كوبونات الخصم الذكية**: التحقق وتطبيق نسب أو مبالغ الخصم على مستوى السيرفر مع قيود الاستخدام والحد الأدنى.
- **تتبع الطلبات المباشر**: صفحة تتبع فورية برقم الطلب والهاتف/الإيميل.
- **بوابات دفع متعددة**: الدفع عند الاستلام (COD) والدفع الإلكتروني الآمن عبر **Chargily Pay V2** (الذهبية / CIB).

### 📱 الإشعارات الذكية والتواصل (Smart Alerts & Communication):
- **إشعارات تيليجرام الفورية (Telegram Instant Order Alerts)**: استلام تنبيه فوري عبر بوت تيليجرام مع رنة تنبيه وتفاصيل العميل ومحتويات السلة بمجرد تسجيل أي طلب جديد.
- **تأكيد الطلب عبر واتساب بضغطة زر (1-Click WhatsApp Confirmation)**: زر مباشر في جدول الطلبات لفتح محادثة واتساب مع الزبون بنص ترحيبي مهيأ جاهز للتأكيد السريع.
- **إشعارات البريد الإلكتروني التلقائية**: إرسال تأكيد الفاتورة للعميل وتنبيه الأدمن بالطلبات الجديدة.

### 🛡️ الأمان وحماية البيانات (Security & Reliability):
- **مصادقة آمنة عبر كوكيز `httpOnly`**: حماية تامة للتوكنات من ثغرات XSS دون حفظها في `localStorage`.
- **تسجيل الدخول عبر Google OAuth 2.0**: تكامل آمن مع حماية الحسابات من الاستيلاء (Account Takeover Prevention).
- **حماية CSRF**: عبر ترويسات `X-CSRF-Token` لكافة الطلبات المغيرة للحالة.
- **حماية المخزون والسباق البرمجي**: قفل ذكي للأسطر في قاعدة البيانات (`SELECT ... FOR UPDATE`) مع استعادة المخزون تلقائياً عند إلغاء أو حذف الطلبات.
- **التحقق من توقيع الـ Webhook**: تشفير HMAC-SHA256 لمعاملات Chargily Pay.
- **حماية تحميل الصور**: التحقق من الامتدادات والـ Magic Bytes (توقيع الملف الثنائي) لمنع رفع السكربتات الخبيثة.
- **سياسة أمان المحتوى (CSP) وتحديد معدل الطلبات (Rate Limiting)**.

### 📊 لوحة التحكم الإدارية الاحترافية (Admin Suite):
- 📈 **لوحة الإحصائيات والمؤشرات (KPIs)**: متابعة المبيعات الإجمالية، **صافي الأرباح التقديرية (Net Profit)**، عدد الطلبات، وتنبيهات نفاد المخزون.
- 💰 **تتبع سعر التكلفة وهوامش الربح**: إدخال سعر التكلفة/الشراء (`cost_price`) لكل منتج وحساب صافي الأرباح تلقائياً بعد خصم تكاليف المنتجات المباعة.
- 📦 **إدارة المنتجات والمتغيرات**: إضافة وتعديل وحذف المنتجات، إدارة متغيرات الألوان والمقاسات، وتحديد خيارات المخزون.
- 🛒 **إدارة وتجهيز وحذف الطلبات**: فلاتر متقدمة، تغيير الحالات، طباعة الفواتير وبوالص الشحن الحرارية (Thermal Labels)، تصدير CSV لشركات التوصيل، وصلاحية حذف الطلبات مع استرجاع المخزون.
- 👥 **إدارة العملاء وصلاحيات الأدوار**: عرض بيانات المستخدمين، الطلبات السابقة، العناوين، وترقية/تغيير أدوار المستخدمين مع حماية منع قفل الأدمن لنفسه.
- 🎟️ **إدارة الكوبونات**: إنشاء قسائم الخصم وتحديد نسب أو مبالغ الخصم وتواريخ الانتهاء والحد الأدنى.
- ⭐ **إدارة ومراقبة التقييمات**: مراجعة تقييمات الزبائن والموافقة عليها مع تحديث تلقائي لمعدل تقييم المنتج.
- ⚙️ **إعدادات المتجر والتسويق الرقمي**: تحكم كامل في الهوية، الشعار، الأيقونة، أرقام التواصل، روابط الشبكات الاجتماعية، سياسات المتجر، بوابات الدفع، وإعدادات بكسلات التتبع (Meta Pixel, TikTok Pixel, Google Analytics 4, Snapchat Pixel).
- ☁️ **دعم التخزين السحابي للوسائط**: دعم التخزين الدائم للصور عبر Cloudinary أو AWS S3 / Cloudflare R2 لبيئات الإنتاج السحابية.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

* **Frontend**: HTML5, Modern CSS3 (Grid & Flexbox), Vanilla JavaScript (Modular ES6), Font Awesome, Chart.js.
* **Backend**: Node.js, Express.js (RESTful Architecture).
* **Database**: MySQL 8.0 مع نظام Migrations ذكي ومتوافق.
* **Notifications**: Telegram Bot API, Nodemailer.
* **Security & Auth**: JWT, bcryptjs, Helmet, CORS, Express-Rate-Limit, CSRF Tokens, Google OAuth.
* **Storage**: Local Storage, Cloudinary CDN, AWS S3 / R2.
* **DevOps**: Docker, Docker Compose, Alpine Linux, GitHub Actions CI.

---

## 🚀 التثبيت والتشغيل السريع (Quickstart)

### 1. التشغيل عبر Docker (موصى به)

```bash
# 1. نسخ ملف الإعدادات
cp .env.example .env

# 2. بناء وتشغيل الحاويات
docker compose up --build -d
```

### 2. التثبيت المحلي المباشر

#### المتطلبات:
- Node.js v18+
- MySQL Server 8.0+

```bash
# 1. تثبيت الحزم
npm install

# 2. إعداد ملف البيئة
cp .env.example .env

# 3. تشغيل الـ Migrations
npm run migrate

# 4. تشغيل خادم التطبيق
npm start
```

افتح المتصفح على: `http://localhost:3000`

---

## 🧪 أوامر الاختبار والتحقق من الجودة (Quality Gates)

```bash
# تشغيل كامل حزمة الاختبارات الآلية (52 اختباراً بنجاح 100%)
npm test

# فحص جودة الكود والمعايير (ESLint)
npm run lint

# فحص سلامة ملفات الإنتاج والـ Migrations
npm run build
```

---

## 📄 الترخيص (License)
المشروع مرخص تحت رخصة [MIT License](LICENSE).
