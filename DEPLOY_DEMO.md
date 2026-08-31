# 🚀 دليل إطلاق النسخة التجريبية الحية مجاناً — Live Demo Deployment Guide

هذا الدليل يشرح لك خطوة بخطوة كيفية رفع وتشغيل متجر **MYSHOP Pro** بنسخته التجريبية الحية على منصة **Render** (أو **Railway**) مجاناً وبدون الحاجة لشراء دومين! 🇩🇿

---

## 📋 الخطوات السريعة (في 3 دقائق):

### 1️⃣ الخطوة الأولى: إنشاء قاعدة بيانات MySQL سحابية مجانية
اختر إحدى المنصات المجانية التالية لإنشاء قاعدة بيانات MySQL 8:
* **الخيار الأول (موصى به):** موقع [Aiven.io](https://aiven.io) (يقدم خطة مجانية دائمة Free Tier لـ MySQL).
* **الخيار الثاني:** موقع [Clever Cloud](https://www.clever-cloud.com) (قاعدة بيانات MySQL مجانية).
* **الخيار الثالث:** موقع [TiDB Cloud](https://tidbcloud.com) (Serverless MySQL مجاني).

> 💡 بعد إنشاء قاعدة البيانات، انسخ بيانات الاتصال:
> - `Host` (المضيف)
> - `Port` (المنفذ، عادة 3306)
> - `Database Name` (اسم القاعدة)
> - `User` (اسم المستخدم)
> - `Password` (كلمة المرور)

---

### 2️⃣ الخطوة الثانية: تشغيل المتجر على Render (مجاناً)
1. ادخل إلى **[Render.com](https://render.com)** وسجل الدخول باستخدام حسابك على GitHub.
2. اضغط على الزر الأزرق **New +** واختر **Web Service**.
3. اختر مستودع المشروع: `redouanDZ/myshop`.
4. املأ الإعدادات البسيطة التالية:
   - **Name:** `myshop-demo` (أو أي اسم تختاره)
   - **Region:** `Frankfurt (EU Central)` (أقرب للجزائر)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free` (مجاني)

5. انزل إلى قسم **Environment Variables** (متغيرات البيئة) واضغط **Add Environment Variable** وأضف:
   ```env
   NODE_ENV=production
   PORT=3000
   DB_HOST=ضع_مضيف_قاعدة_البيانات_هنا
   DB_PORT=3306
   DB_NAME=ضع_اسم_قاعدة_البيانات_هنا
   DB_USER=ضع_اسم_المستخدم_هنا
   DB_PASSWORD=ضع_كلمة_المرور_هنا
   JWT_SECRET=myshop_super_secret_jwt_key_2026
   COOKIE_SECRET=myshop_super_secret_cookie_key_2026
   ```

6. اضغط على زر **Create Web Service**.

---

### 3️⃣ الخطوة الثالثة: ملء البيانات التجريبية بضغطة زر (Seeding)
بمجرد تشغيل السيرفر، يمكنك الدخول إلى شاشة الأوامر (Render Shell) وتشغيل:
```bash
npm run seed:demo
```
سيمتلئ المتجر فوراً بالمنتجات، الصور، الأقسام، الكوبونات، والطلبات الإحصائية التجريبية!

---

## 🔑 بيانات الدخول التجريبية (Demo Accounts):

| الحساب | البريد الإلكتروني | كلمة المرور | الصلاحية |
|---|---|---|---|
| **مدير المتجر (Admin)** | `demo@myshop.dz` | `demo1234` | دخول كامل للوحة التحكم والإحصائيات |
| **عميل تجريبي (Customer)** | `customer@myshop.dz` | `demo1234` | تجربة سلة المشتريات والطلبات |

> ✨ كما يتضمن المتجر زر **"الدخول التجريبي السريع بنقرة واحدة (1-Click Demo)"** في نافذة تسجيل الدخول ليتمكن الزبائن من تجربة المتجر دون الحاجة لكتابة أي بريد أو كلمة مرور!

---

## 🌐 الروابط التي ستضعها في إعلاناتك للزبائن:
- **رابط صفحة العرض والميزات:** `https://your-app.onrender.com/landing.html`
- **رابط واجهة المتجر:** `https://your-app.onrender.com/`
- **رابط لوحة التحكم:** `https://your-app.onrender.com/admin/index.html`
