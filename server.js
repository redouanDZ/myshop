const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./js/db-connection.js');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? (() => {
    throw new Error('JWT_SECRET environment variable is required in production.');
})() : 'development-only-secret-change-me');
const COOKIE_SECRET = process.env.COOKIE_SECRET || (isProduction ? (() => {
    throw new Error('COOKIE_SECRET environment variable is required in production.');
})() : 'development-cookie-secret-change-me');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(origin => origin.trim()).filter(Boolean);
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const ACCESS_TOKEN_TTL = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;
const activeSessions = new Map();
const refreshTokens = new Map();
const passwordResetTokens = new Map();
const emailVerificationTokens = new Map();
const loginAttempts = new Map();
const emailVerificationStatus = new Map();

function randomToken() {
    return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
    return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function secureCompare(a, b) {
    if (!a || !b) return false;
    const bufferA = Buffer.from(String(a));
    const bufferB = Buffer.from(String(b));
    if (bufferA.length !== bufferB.length) return false;
    return crypto.timingSafeEqual(bufferA, bufferB);
}

function getCookie(req, name) {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`));
    if (!match) return null;
    return decodeURIComponent(match.substring(name.length + 1));
}

function setCookie(res, name, value, options = {}) {
    const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        path: '/',
        ...options
    };
    res.cookie(name, value, cookieOptions);
}

function clearCookie(res, name) {
    res.clearCookie(name, { path: '/', httpOnly: true, sameSite: 'lax', secure: isProduction });
}

function sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
}

function markLoginFailure(identifier) {
    const key = String(identifier || 'unknown').trim().toLowerCase();
    const current = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
    const nextCount = current.count + 1;
    const nextLocked = nextCount >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_WINDOW_MS : 0;
    loginAttempts.set(key, { count: nextCount, lockedUntil: nextLocked });
    return nextLocked;
}

function clearLoginFailure(identifier) {
    loginAttempts.delete(String(identifier || '').trim().toLowerCase());
}

function isEmailVerified(userId) {
    const value = emailVerificationStatus.get(String(userId));
    return value === undefined ? true : Boolean(value);
}

function setEmailVerificationState(userId, verified) {
    emailVerificationStatus.set(String(userId), Boolean(verified));
}

function getLoginAttemptKey(email, req) {
    return `${String(req.ip || 'unknown')}|${String(email || '').trim().toLowerCase()}`;
}

function createAccessToken(user, sessionId) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'customer', sessionId, type: 'access' },
        JWT_SECRET,
        { expiresIn: '15m', issuer: 'myshop' }
    );
}

function createRefreshToken(user, sessionId) {
    const tokenValue = randomToken();
    refreshTokens.set(hashToken(tokenValue), {
        userId: Number(user.id),
        sessionId,
        expiresAt: Date.now() + REFRESH_TOKEN_TTL
    });
    return tokenValue;
}

function issueSession(user, req) {
    const sessionId = randomToken();
    const sessionRecord = {
        userId: Number(user.id),
        sessionId,
        userAgent: req.headers['user-agent'] || 'unknown',
        ip: req.ip || 'unknown',
        createdAt: new Date().toISOString(),
        lastSeen: Date.now(),
        revoked: false,
        expiresAt: Date.now() + SESSION_TTL
    };
    activeSessions.set(sessionId, sessionRecord);
    return sessionId;
}

function revokeSession(sessionId) {
    if (!sessionId) return false;
    const session = activeSessions.get(sessionId);
    if (!session) return false;
    session.revoked = true;
    activeSessions.delete(sessionId);
    return true;
}

function getAccessTokenFromRequest(req) {
    const cookieToken = getCookie(req, 'access_token');
    if (cookieToken) return cookieToken;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    return null;
}

function getCsrfTokenFromRequest(req) {
    return req.get('x-csrf-token') || (req.body && req.body.csrfToken) || '';
}

function requireCsrf(req, res, next) {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    const exemptPaths = [
        '/api/login',
        '/api/register',
        '/api/auth/refresh',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/verify-email'
    ];

    if (exemptPaths.includes(req.path)) {
        return next();
    }

    const cookieToken = getCookie(req, 'csrf_token');
    const headerToken = getCsrfTokenFromRequest(req);

    if (!cookieToken || !headerToken || !secureCompare(cookieToken, headerToken)) {
        return res.status(403).json({ message: 'CSRF token missing or invalid' });
    }

    next();
}

function parseUserFromReq(req) {
    const token = getAccessTokenFromRequest(req);
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id || !decoded.sessionId) {
            return null;
        }

        const session = activeSessions.get(decoded.sessionId);
        if (!session || session.userId !== Number(decoded.id) || session.revoked || session.expiresAt <= Date.now()) {
            return null;
        }

        session.lastSeen = Date.now();
        return Number(decoded.id);
    } catch (error) {
        if (token.startsWith('token_user_')) {
            const legacyId = parseInt(token.replace('token_user_', ''), 10);
            if (!Number.isNaN(legacyId)) {
                return legacyId;
            }
        }
        return null;
    }
}

function generateToken(user) {
    const sessionId = issueSession(user, { headers: { 'user-agent': 'legacy-token' }, ip: 'legacy' });
    return createAccessToken(user, sessionId);
}

app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"]
        }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'DENY' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}));

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة بعد 15 دقيقة' }
});

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة بعد 15 دقيقة' }
});

app.use('/api', apiRateLimiter);
app.use('/api/login', authRateLimiter);
app.use('/api/register', authRateLimiter);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
app.options('*', cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
    const requestPath = req.originalUrl || req.url || '';
    if (requestPath.includes('..')) {
        return res.status(400).json({ error: 'طلب غير صالح' });
    }
    next();
});
app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        return next();
    }
    return requireCsrf(req, res, next);
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, 'images'));
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!file || !file.mimetype || !file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files are allowed.'));
            return;
        }
        cb(null, true);
    }
});

app.use(express.static(path.join(__dirname)));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

function parseUserFromReq(req) {
    const token = getAccessTokenFromRequest(req);
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id || !decoded.sessionId) {
            return null;
        }

        const session = activeSessions.get(decoded.sessionId);
        if (!session || session.userId !== Number(decoded.id) || session.revoked || session.expiresAt <= Date.now()) {
            return null;
        }

        session.lastSeen = Date.now();
        return Number(decoded.id);
    } catch (error) {
        if (token.startsWith('token_user_')) {
            const legacyId = parseInt(token.replace('token_user_', ''), 10);
            if (!Number.isNaN(legacyId)) {
                return legacyId;
            }
        }
        return null;
    }
}

function sanitizeString(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    const clean = value.trim().slice(0, 250);
    return clean || fallback;
}

function requireAuth(req, res, next) {
    const userId = parseUserFromReq(req);
    if (!userId) {
        return res.status(401).json({ message: 'غير مصرح لك، يرجى تسجيل الدخول' });
    }
    req.userId = userId;
    const accessToken = getAccessTokenFromRequest(req);
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, JWT_SECRET);
            req.sessionId = decoded.sessionId || null;
        } catch (error) {
            req.sessionId = null;
        }
    }
    next();
}

function requireAdmin(req, res, next) {
    const userId = parseUserFromReq(req);
    if (!userId) {
        return res.status(401).json({ message: 'غير مصرح لك، يرجى تسجيل الدخول' });
    }

    db.findUserById(userId)
        .then((user) => {
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ message: 'هذه العملية متاحة فقط للمسؤولين' });
            }
            req.userId = userId;
            next();
        })
        .catch((error) => {
            console.error('Admin authorization error:', error);
            res.status(500).json({ message: 'خطأ في التحقق من صلاحيات المسؤول' });
        });
}

function generateToken(user) {
    const sessionId = issueSession(user, { headers: { 'user-agent': 'legacy-token' }, ip: 'legacy' });
    return createAccessToken(user, sessionId);
}

// API Routes

// Create product
app.post('/api/products', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const name = sanitizeString(req.body.name);
        const category = sanitizeString(req.body.category);
        const price = Number(req.body.price);
        const stock = Number(req.body.stock);
        const status = sanitizeString(req.body.status, 'active');
        const description = sanitizeString(req.body.description || '', '');

        if (!name || !category || !Number.isFinite(price) || !Number.isFinite(stock) || stock < 0 || price < 0) {
            return res.status(400).json({ error: 'جميع الحقول مطلوبة (الاسم، القسم، السعر، الكمية)' });
        }

        const productData = {
            name,
            category,
            price,
            stock: Math.trunc(stock),
            status,
            description,
            image_url: req.file ? `/images/${req.file.filename}` : '/images/product-placeholder.jpg'
        };

        const id = await db.createProduct(productData);

        res.status(201).json({
            id,
            message: 'تم إنشاء المنتج بنجاح',
            product: { id, ...productData }
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'خطأ أثناء إنشاء المنتج' });
    }
});

// Get products (with pagination, search, price range & category filter)
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sortBy, page, limit } = req.query;
        const result = await db.getProducts({
            category,
            search,
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            sortBy,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 100
        });
        res.json(result);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'خطأ في جلب المنتجات' });
    }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await db.getProductById(req.params.id);
        if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'خطأ في جلب المنتج' });
    }
});

// Update product
app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const success = await db.updateProduct(req.params.id, req.body);
        if (!success) return res.status(404).json({ error: 'المنتج غير موجود' });
        res.json({ message: 'تم تحديث المنتج بنجاح' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'خطأ في تحديث المنتج' });
    }
});

// Delete product
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const success = await db.deleteProduct(req.params.id);
        if (!success) return res.status(404).json({ error: 'المنتج غير موجود' });
        res.json({ message: 'تم حذف المنتج بنجاح' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'خطأ في حذف المنتج' });
    }
});

// Cart API
app.post('/api/cart/add', async (req, res) => {
    try {
        const authUserId = parseUserFromReq(req);
        const requestedUserId = Number(req.body.userId);
        if (!authUserId && requestedUserId) {
            return res.status(400).json({ error: 'يجب تسجيل الدخول لتحديد مستخدم آخر' });
        }
        if (authUserId && requestedUserId && authUserId !== requestedUserId) {
            return res.status(403).json({ error: 'لا يمكنك تعديل سلة مستخدم آخر' });
        }
        const userId = authUserId || requestedUserId || 1;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'معرّف المنتج مطلوب' });
        }

        const sanitizedQty = Number(quantity);
        const cartItemId = await db.addToCart(userId, productId, Number.isFinite(sanitizedQty) && sanitizedQty > 0 ? sanitizedQty : 1);
        res.status(201).json({ id: cartItemId, message: 'تم الإضافة إلى العربة بنجاح' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'خطأ في الإضافة إلى العربة' });
    }
});

app.get('/api/cart/:userId', async (req, res) => {
    try {
        const authUserId = parseUserFromReq(req);
        const requestedUserId = Number(req.params.userId);
        const targetUserId = authUserId || requestedUserId || 1;

        if (authUserId && requestedUserId && authUserId !== requestedUserId) {
            return res.status(403).json({ error: 'لا يمكنك عرض سلة مستخدم آخر' });
        }

        const cartItems = await db.getCartItems(targetUserId);
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'خطأ في جلب العربة' });
    }
});

app.put('/api/cart/:cartItemId', requireAuth, async (req, res) => {
    try {
        const cartItems = await db.getCartItems(req.userId);
        const cartItemId = Number(req.params.cartItemId);
        if (!cartItems.some(item => item.id === cartItemId)) {
            return res.status(403).json({ error: 'لا يمكنك تعديل عنصر في سلة مستخدم آخر' });
        }

        const success = await db.updateCartItem(cartItemId, req.body.quantity);
        if (!success) return res.status(404).json({ error: 'العنصر غير موجود في العربة' });
        res.json({ message: 'تم تحديث العربة بنجاح' });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'خطأ في تحديث العربة' });
    }
});

app.delete('/api/cart/:cartItemId', requireAuth, async (req, res) => {
    try {
        const cartItems = await db.getCartItems(req.userId);
        const cartItemId = Number(req.params.cartItemId);
        if (!cartItems.some(item => item.id === cartItemId)) {
            return res.status(403).json({ error: 'لا يمكنك حذف عنصر من سلة مستخدم آخر' });
        }

        const success = await db.removeCartItem(cartItemId);
        if (!success) return res.status(404).json({ error: 'العنصر غير موجود في العربة' });
        res.json({ message: 'تم الحذف من العربة بنجاح' });
    } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ error: 'خطأ في الحذف' });
    }
});

// Orders API
app.post('/api/orders', async (req, res) => {
    try {
        const authUserId = parseUserFromReq(req);
        const orderData = req.body || {};
        const requestedUserId = Number(orderData.userId);

        if (!authUserId && requestedUserId) {
            return res.status(400).json({ error: 'يجب تسجيل الدخول لتحديد مستخدم آخر' });
        }

        if (authUserId && requestedUserId && authUserId !== requestedUserId) {
            return res.status(403).json({ error: 'لا يمكنك إنشاء طلب باسم مستخدم آخر' });
        }

        if (authUserId) {
            orderData.userId = authUserId;
        } else if (!requestedUserId) {
            orderData.userId = 1;
        }

        if (!orderData.cart && !orderData.total) {
            return res.status(400).json({ error: 'السلة أو الإجمالي مطلوب' });
        }

        const orderId = await db.createOrder(orderData);
        res.status(201).json({ id: orderId, message: 'تم إنشاء الطلب بنجاح' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message || 'خطأ في إنشاء الطلب' });
    }
});

app.get('/api/orders', requireAuth, async (req, res) => {
    try {
        const orders = await db.getOrders(req.userId);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'خطأ في جلب الطلبات' });
    }
});

app.get('/api/orders/:id', requireAuth, async (req, res) => {
    try {
        const order = await db.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
        if (order.user_id !== req.userId) {
            return res.status(403).json({ error: 'لا يمكنك الوصول إلى طلب مستخدم آخر' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'خطأ في جلب الطلب' });
    }
});

app.get('/api/order-items/:orderId', requireAuth, async (req, res) => {
    try {
        const order = await db.getOrderById(req.params.orderId);
        if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
        if (order.user_id !== req.userId) {
            return res.status(403).json({ error: 'لا يمكنك الوصول إلى عناصر طلب مستخدم آخر' });
        }

        const items = await db.getOrderItems(req.params.orderId);
        res.json(items);
    } catch (error) {
        console.error('Error fetching order items:', error);
        res.status(500).json({ error: 'خطأ في جلب عناصر الطلب' });
    }
});

// Authentication & User Accounts API

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const username = sanitizeString(req.body.username || req.body.name, 'مستخدم');
        const email = sanitizeString(req.body.email || '', '').toLowerCase();
        const phone = sanitizeString(req.body.phone || '', '');
        const password = typeof req.body.password === 'string' ? req.body.password : '';

        if (!email || !password) {
            return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
        }

        const user = await db.createUser({ username, email, phone, password });
        const verificationToken = randomToken();
        emailVerificationTokens.set(verificationToken, {
            userId: user.id,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
        });
        setEmailVerificationState(user.id, false);

        const payload = { message: 'تم إنشاء الحساب بنجاح! يرجى التحقق من البريد الإلكتروني.', user: sanitizeUser(user), verificationRequired: true };
        if (!isProduction) {
            payload.verificationToken = verificationToken;
        }
        res.status(201).json(payload);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: error.message || 'خطأ أثناء تسجيل الحساب' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const email = sanitizeString(req.body.email || '', '').toLowerCase();
        const password = typeof req.body.password === 'string' ? req.body.password : '';

        if (!email || !password) {
            return res.status(400).json({ message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
        }

        const lockKey = getLoginAttemptKey(email, req);
        const currentAttempt = loginAttempts.get(lockKey) || { count: 0, lockedUntil: 0 };
        if (currentAttempt.lockedUntil && currentAttempt.lockedUntil > Date.now()) {
            return res.status(429).json({ message: 'تم قفل الحساب مؤقتاً بسبب محاولات تسجيل دخول متكررة. حاول مرة أخرى لاحقاً.' });
        }

        const user = await db.verifyUserCredentials(email, password);
        if (!user) {
            markLoginFailure(lockKey);
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        if (!isEmailVerified(user.id)) {
            return res.status(403).json({ message: 'يرجى التحقق من البريد الإلكتروني قبل تسجيل الدخول.' });
        }

        clearLoginFailure(lockKey);
        const sessionId = issueSession(user, req);
        const accessToken = createAccessToken(user, sessionId);
        const refreshToken = createRefreshToken(user, sessionId);
        const csrfToken = randomToken();

        setCookie(res, 'access_token', accessToken, { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: ACCESS_TOKEN_TTL });
        setCookie(res, 'refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: REFRESH_TOKEN_TTL });
        setCookie(res, 'csrf_token', csrfToken, { httpOnly: false, sameSite: 'lax', secure: isProduction, maxAge: 60 * 60 * 1000 });

        const { password: _, ...userWithoutPass } = user;
        res.json({
            message: 'تم تسجيل الدخول بنجاح!',
            user: userWithoutPass,
            sessionId
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'خطأ أثناء تسجيل الدخول' });
    }
});

app.get('/api/csrf-token', (req, res) => {
    const csrfToken = randomToken();
    setCookie(res, 'csrf_token', csrfToken, { httpOnly: false, sameSite: 'lax', secure: isProduction, maxAge: 60 * 60 * 1000 });
    res.json({ csrfToken });
});

app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const token = (req.body && req.body.token) || (req.query && req.query.token) || '';
        if (!token) {
            return res.status(400).json({ message: 'رمز التحقق مطلوب' });
        }

        const verification = emailVerificationTokens.get(token);
        if (!verification || verification.expiresAt <= Date.now()) {
            return res.status(400).json({ message: 'رمز التحقق غير صالح أو منتهي الصلاحية' });
        }

        emailVerificationTokens.delete(token);
        setEmailVerificationState(verification.userId, true);
        res.json({ message: 'تم التحقق من البريد الإلكتروني بنجاح.' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'فشل التحقق من البريد الإلكتروني' });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const email = sanitizeString(req.body.email || '', '').toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
        }

        const user = await db.findUserByEmail(email);
        if (!user) {
            return res.json({ message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال تعليمات استعادة كلمة المرور.' });
        }

        const resetToken = randomToken();
        passwordResetTokens.set(resetToken, {
            userId: Number(user.id),
            expiresAt: Date.now() + 60 * 60 * 1000
        });

        if (!isProduction) {
            return res.json({ message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال تعليمات استعادة كلمة المرور.', resetToken });
        }

        res.json({ message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال تعليمات استعادة كلمة المرور.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'فشل طلب استعادة كلمة المرور' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const token = String(req.body.token || '');
        const password = typeof req.body.password === 'string' ? req.body.password : '';

        if (!token || !password || password.length < 6) {
            return res.status(400).json({ message: 'الرمز وكلمة المرور الجديدة مطلوبة ويجب أن تكون 6 أحرف على الأقل' });
        }

        const record = passwordResetTokens.get(token);
        if (!record || record.expiresAt <= Date.now()) {
            return res.status(400).json({ message: 'رمز استعادة كلمة المرور غير صالح أو منتهي الصلاحية' });
        }

        const user = await db.findUserById(record.userId);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        await db.updateUserProfile(user.id, { password });
        passwordResetTokens.delete(token);
        res.json({ message: 'تم تحديث كلمة المرور بنجاح.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'فشل تحديث كلمة المرور' });
    }
});

app.post('/api/auth/refresh', async (req, res) => {
    try {
        const refreshTokenValue = getCookie(req, 'refresh_token');
        if (!refreshTokenValue) {
            return res.status(401).json({ message: 'جلسة المستخدم غير موجودة' });
        }

        const tokenRecord = refreshTokens.get(hashToken(refreshTokenValue));
        if (!tokenRecord || tokenRecord.expiresAt <= Date.now()) {
            clearCookie(res, 'refresh_token');
            clearCookie(res, 'access_token');
            return res.status(401).json({ message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' });
        }

        const user = await db.findUserById(tokenRecord.userId);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        const newSessionId = issueSession(user, req);
        const newAccessToken = createAccessToken(user, newSessionId);
        const newRefreshToken = createRefreshToken(user, newSessionId);
        const csrfToken = randomToken();

        refreshTokens.delete(hashToken(refreshTokenValue));
        revokeSession(tokenRecord.sessionId);

        setCookie(res, 'access_token', newAccessToken, { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: ACCESS_TOKEN_TTL });
        setCookie(res, 'refresh_token', newRefreshToken, { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: REFRESH_TOKEN_TTL });
        setCookie(res, 'csrf_token', csrfToken, { httpOnly: false, sameSite: 'lax', secure: isProduction, maxAge: 60 * 60 * 1000 });

        res.json({ message: 'تم تجديد الجلسة بنجاح', user: sanitizeUser(user) });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'فشل في تحديث الجلسة' });
    }
});

app.get('/api/auth/session', requireAuth, async (req, res) => {
    try {
        const user = await db.findUserById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }
        res.json({ user: sanitizeUser(user) });
    } catch (error) {
        console.error('Session fetch error:', error);
        res.status(500).json({ message: 'فشل في جلب جلسة المستخدم' });
    }
});

app.get('/api/auth/sessions', requireAuth, async (req, res) => {
    try {
        const sessions = Array.from(activeSessions.values())
            .filter(session => session.userId === req.userId && session.expiresAt > Date.now() && !session.revoked)
            .map(session => ({
                sessionId: session.sessionId,
                userAgent: session.userAgent,
                ip: session.ip,
                createdAt: session.createdAt,
                lastSeen: new Date(session.lastSeen).toISOString()
            }));
        res.json({ sessions });
    } catch (error) {
        console.error('Session listing error:', error);
        res.status(500).json({ message: 'فشل في جلب جلسات المستخدم' });
    }
});

app.post('/api/auth/sessions/:sessionId/revoke', requireAuth, async (req, res) => {
    try {
        const session = activeSessions.get(req.params.sessionId);
        if (!session || session.userId !== req.userId) {
            return res.status(404).json({ message: 'الجلسة غير موجودة' });
        }
        revokeSession(req.params.sessionId);
        res.json({ message: 'تم إلغاء الجلسة بنجاح.' });
    } catch (error) {
        console.error('Revoke session error:', error);
        res.status(500).json({ message: 'فشل في إلغاء الجلسة' });
    }
});

// User Logout
app.post('/api/logout', requireAuth, (req, res) => {
    const sessionId = req.sessionId || null;
    if (sessionId) {
        revokeSession(sessionId);
    }
    const refreshTokenValue = getCookie(req, 'refresh_token');
    if (refreshTokenValue) {
        refreshTokens.delete(hashToken(refreshTokenValue));
    }
    clearCookie(res, 'access_token');
    clearCookie(res, 'refresh_token');
    clearCookie(res, 'csrf_token');
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

// Get User Profile
app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const user = await db.findUserById(req.userId);
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        const { password: _, ...userWithoutPass } = user;
        res.json(userWithoutPass);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'خطأ في جلب بيانات الملف الشخصي' });
    }
});

// Update User Profile
app.put('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const updatedUser = await db.updateUserProfile(req.userId, req.body);
        if (!updatedUser) return res.status(404).json({ message: 'المستخدم غير موجود' });

        const { password: _, ...userWithoutPass } = updatedUser;
        res.json({ message: 'تم تحديث البيانات بنجاح', user: userWithoutPass });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ message: error.message || 'خطأ في تحديث البيانات' });
    }
});

// Add User Address
app.post('/api/user/addresses', requireAuth, async (req, res) => {
    try {
        const address = await db.addUserAddress(req.userId, req.body);
        res.status(201).json({ message: 'تمت إضافة العنوان بنجاح', address });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'خطأ في إضافة العنوان' });
    }
});

// Delete User Address
app.delete('/api/user/addresses/:addressId', requireAuth, async (req, res) => {
    try {
        const success = await db.deleteUserAddress(req.userId, req.params.addressId);
        if (!success) return res.status(404).json({ message: 'العنوان غير موجود' });
        res.json({ message: 'تم حذف العنوان بنجاح' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'خطأ في حذف العنوان' });
    }
});

// Health check & Monitoring
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage()
    });
});

// Product search autocomplete
app.get('/api/products/autocomplete', async (req, res) => {
    try {
        const query = (req.query.q || '').trim().toLowerCase();
        if (!query) return res.json([]);
        const all = await db.getProducts({ search: query, limit: 5 });
        const results = (all.products || []).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            image_url: p.image_url
        }));
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في جلب المقترحات' });
    }
});

// Product recommendations
app.get('/api/products/recommendations', async (req, res) => {
    try {
        const productId = parseInt(req.query.productId, 10);
        const all = await db.getProducts({ limit: 10 });
        let items = all.products || [];
        if (!isNaN(productId)) {
            items = items.filter(p => p.id !== productId);
        }
        res.json(items.slice(0, 4));
    } catch (err) {
        res.status(500).json({ error: 'خطأ في جلب التوصيات' });
    }
});

// Catch-all route to serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'حدث خطأ غير متوقع في الخادم', message: err.message });
});

// Start Server - Bind to 0.0.0.0 and Port 3000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

