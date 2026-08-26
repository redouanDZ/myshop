const { getCookie, secureCompare } = require('../utils/tokenUtils');

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
        '/api/auth/google',
        '/api/auth/refresh',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/verify-email',
        '/api/orders',
        '/api/cart/add',
        '/api/payments/chargily/checkout',
        '/api/payments/chargily/webhook'
    ];

    if (exemptPaths.includes(req.path)) {
        return next();
    }

    const cookieToken = getCookie(req, 'csrf_token');
    const headerToken = getCsrfTokenFromRequest(req);

    if (cookieToken && (!headerToken || !secureCompare(cookieToken, headerToken))) {
        return res.status(403).json({ message: 'CSRF token missing or invalid' });
    }

    next();
}

module.exports = {
    requireCsrf
};
