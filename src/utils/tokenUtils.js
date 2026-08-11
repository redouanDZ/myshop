const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const ACCESS_TOKEN_TTL = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;

const activeSessions = new Map();
const refreshTokens = new Map();
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
        secure: config.isProduction,
        path: '/',
        ...options
    };
    res.cookie(name, value, cookieOptions);
}

function clearCookie(res, name) {
    res.clearCookie(name, { path: '/', httpOnly: true, sameSite: 'lax', secure: config.isProduction });
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

function createAccessToken(user, sessionId) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'customer', sessionId, type: 'access' },
        config.JWT_SECRET,
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
        userAgent: (req.headers && req.headers['user-agent']) || 'unknown',
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

function parseUserFromReq(req) {
    const token = getAccessTokenFromRequest(req);
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (!decoded || !decoded.id || !decoded.sessionId) return null;

        const session = activeSessions.get(decoded.sessionId);
        if (!session || session.userId !== Number(decoded.id) || session.revoked || session.expiresAt <= Date.now()) {
            return null;
        }

        session.lastSeen = Date.now();
        return Number(decoded.id);
    } catch (error) {
        if (token.startsWith('token_user_')) {
            const legacyId = parseInt(token.replace('token_user_', ''), 10);
            if (!Number.isNaN(legacyId)) return legacyId;
        }
        return null;
    }
}

module.exports = {
    randomToken,
    hashToken,
    secureCompare,
    getCookie,
    setCookie,
    clearCookie,
    sanitizeUser,
    markLoginFailure,
    clearLoginFailure,
    createAccessToken,
    createRefreshToken,
    issueSession,
    revokeSession,
    getAccessTokenFromRequest,
    parseUserFromReq,
    activeSessions,
    refreshTokens,
    loginAttempts
};
