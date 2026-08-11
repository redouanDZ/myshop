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

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://gc.kis.v2.scr.kaspersky-labs.com'],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com'],
            connectSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com', 'https://geoip.maxmind.com', 'ws:', 'wss:'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"]
        }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'DENY' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: config.isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}));

// Rate Limiters
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

// CORS Config
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
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

// Body Parsers & Path Guard
app.use(express.json({ limit: '1mb' }));
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
app.use(express.static(rootDir));
app.use('/admin', express.static(path.join(rootDir, 'admin')));
app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/images', express.static(path.join(rootDir, 'images')));

// API Routes
app.use('/api', apiRoutes);

// Root Page fallback
app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// Error handling middlewares
app.use(errorHandler);

module.exports = app;
