# دليل التثبيت والتهيئة (SETUP & DEPLOYMENT GUIDE)

---

## 📋 المتطلبات الأساسية

* **Node.js**: الإصدار 18.x أو 20.x LTS
* **MySQL**: الإصدار 8.0+
* **Docker & Docker Compose** (اختياري للتشغيل بالحاويات)

---

## ⚙️ متغيرات البيئة (Environment Variables)

قم بإنشاء ملف `.env` انطلاقاً من `.env.example`:

| المتغير | الوصف | القيمة الافتراضية / مثال |
|---|---|---|
| `PORT` | منفذ تشغيل خادم التطبيق | `3000` |
| `NODE_ENV` | بيئة التشغيل (`development` أو `production`) | `production` |
| `DB_HOST` | عنوان مضيف MySQL | `127.0.0.1` أو `mysql` (داخل دوكر) |
| `DB_PORT` | منفذ MySQL | `3306` |
| `DB_NAME` | اسم قاعدة البيانات | `myshop_db` |
| `DB_USER` | اسم مستخدم قاعدة البيانات | `myshop_user` |
| `DB_PASSWORD` | كلمة مرور قاعدة البيانات | `your_secure_password` |
| `JWT_SECRET` | مفتاح تشفير التوكن (32 حرفاً عشوائياً على الأقل) | *قيمة عشوائية سرية* |
| `COOKIE_SECRET` | مفتاح تشفير الكوكيز والجلسات | *قيمة عشوائية سرية* |
| `CHARGILY_PUBLIC_KEY` | المفتاح العام لبوابة Chargily Pay | `test_pk_...` |
| `CHARGILY_SECRET_KEY` | المفتاح السري لبوابة Chargily Pay | `test_sk_...` |
| `CHARGILY_MODE` | وضع التشغيل لبوابة الدفع (`test` أو `live`) | `test` |
| `BASE_URL` | الرابط الأساسي للمتجر | `http://localhost:3000` |

---

## 🚀 خيارات النشر والتشغيل

### الخيار 1: التشغيل عبر Docker Compose

1. قم بتهيئة ملف `.env`:
   ```bash
   cp .env.example .env
   ```
2. شغّل الحاويات:
   ```bash
   docker compose up --build -d
   ```
3. للتحقق من جاهزية التطبيق:
   ```bash
   curl http://localhost:3000/health
   # النتيجة المتوقعة: {"status":"UP"}
   ```

---

### الخيار 2: التشغيل المباشر على الخادم المحلي أو VPS

1. تثبيت الحزم:
   ```bash
   npm install
   ```
2. تشغيل الـ Migrations:
   ```bash
   npm run migrate
   ```
3. تشغيل الخادم للإنتاج:
   ```bash
   npm start
   ```

---

## 🧪 التحقق من الاختبارات والإنتاج

قبل الإطلاق في بيئة الإنتاج، تأكد من تنفيذ الفحوصات التالية:

```bash
# 1. اختبارات الوحدة والمسارات (30/30)
npm test

# 2. فحص الأخطاء النحوية والأسلوب (ESLint)
npm run lint

# 3. فحص ملفات الإنتاج والـ Migrations
npm run build

# 4. تدقيق أمان الحزم
npm audit
```
