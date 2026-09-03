require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/database');
const { requireCsrf } = require('./middlewares/csrfMiddleware');
const apiRoutes = require('./routes/index');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net', 'https://accounts.google.com'],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com', 'https://accounts.google.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com', 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', 'data:'],
            connectSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://geoip.maxmind.com', 'https://accounts.google.com', 'https://*.chargily.com', 'https://*.chargily.net', 'ws:', 'wss:'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"],
            frameSrc: ["'self'", 'https://accounts.google.com']
        }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'DENY' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: config.isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}));

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// Rate Limiters
const trackOrderRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'تم تجاوز عدد محاولات التتبع المسموح بها، يرجى المحاولة بعد 15 دقيقة' }
});

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة بعد 15 دقيقة' }
});

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة بعد 15 دقيقة' }
});

app.use('/api/orders/track', trackOrderRateLimiter);
app.use('/api/login', authRateLimiter);
app.use('/api/register', authRateLimiter);
app.use('/api', apiRateLimiter);

// CORS Config
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        // Allow all configured origins, onrender.com subdomains, or localhost
        if (
            config.ALLOWED_ORIGINS.includes(origin) ||
            origin.endsWith('.onrender.com') ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            !config.isProduction
        ) {
            return callback(null, true);
        }
        // Allow any production origin that connects directly to the store
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parsers & Path Guard (Capturing rawBody for webhook HMAC verification)
app.use(express.json({
    limit: '1mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
    const requestPath = req.originalUrl || req.url || '';
    if (requestPath.includes('..')) {
        return res.status(400).json({ error: 'طلب غير صالح' });
    }
    next();
});

// CSRF Middleware for API routes
app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        return next();
    }
    return requireCsrf(req, res, next);
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage()
    });
});

// Static Files & Assets
const rootDir = path.join(__dirname, '..');

// Only serve these specific directories statically
app.use('/admin', express.static(path.join(rootDir, 'admin')));
app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use('/locales', express.static(path.join(rootDir, 'locales')));

// Public HTML Pages
const publicHtmlPages = ['index.html', 'lumiere.html', 'landing.html', 'shop.html', 'product.html', 'cart.html', 'checkout.html', 'order-confirmation.html', 'account.html', 'track-order.html', 'invoice.html', 'wishlist.html'];
publicHtmlPages.forEach((page) => {
    app.get(`/${page}`, (req, res) => res.sendFile(path.join(rootDir, page)));
});

// Root Page fallback
app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// Other Public Files
['manifest.json', 'robots.txt', 'sitemap.xml', 'sw.js'].forEach((file) => {
    app.get(`/${file}`, (req, res) => res.sendFile(path.join(rootDir, file)));
});

// API Routes
app.use('/api', apiRoutes);

// 404 & Error handling middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
