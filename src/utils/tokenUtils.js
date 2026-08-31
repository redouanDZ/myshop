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
    const jwtSecret = config.JWT_SECRET || process.env.JWT_SECRET || 'myshop_production_jwt_fallback_secret_2026_key_dz';
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'customer', sessionId, type: 'access' },
        jwtSecret,
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

const db = require('../data/db-connection.js');

async function issueSession(user, req) {
    const userId = Number(user && (user.id || user.userId));
    if (!userId) throw new Error('معرف المستخدم غير صالح للجلسة');

    const sessionId = randomToken();
    const userAgent = (req.headers && req.headers['user-agent']) || 'unknown';
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
    const now = Date.now();
    const expiresAt = now + SESSION_TTL;

    const sessionRecord = {
        userId,
        sessionId,
        userAgent: String(userAgent).substring(0, 255),
        ip: String(ip).substring(0, 64),
        createdAt: new Date().toISOString(),
        lastSeen: now,
        revoked: false,
        expiresAt
    };
    activeSessions.set(sessionId, sessionRecord);

    try {
        await db.createSession({
            sessionId,
            userId,
            userAgent,
            ip,
            expiresAt,
            lastSeen: now
        });
    } catch (err) {
        console.error('Failed to persist session to database:', err.message);
    }

    return sessionId;
}

async function revokeSession(sessionId) {
    if (!sessionId) return false;
    const session = activeSessions.get(sessionId);
    if (session) {
        session.revoked = true;
        activeSessions.delete(sessionId);
    }
    try {
        await db.revokeSession(sessionId);
    } catch (err) {
        console.error('Failed to revoke session in database:', err.message);
    }
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

async function parseUserFromReq(req) {
    const token = getAccessTokenFromRequest(req);
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (!decoded || !decoded.id || !decoded.sessionId) return null;

        let session = activeSessions.get(decoded.sessionId);
        if (!session) {
            try {
                session = await db.getSession(decoded.sessionId);
                if (session) {
                    activeSessions.set(decoded.sessionId, session);
                }
            } catch (err) {
                console.error('Failed to fetch session from database:', err.message);
            }
        }

        // Strict session check: session must exist, match user, not revoked, and not expired
        if (!session || session.userId !== Number(decoded.id) || session.revoked || session.expiresAt <= Date.now()) {
            return null;
        }

        session.lastSeen = Date.now();
        db.touchSession(decoded.sessionId, session.lastSeen).catch(() => {});

        return Number(decoded.id);
    } catch (error) {
        return null;
    }
}

function purgeExpiredMemoryRecords() {
    const now = Date.now();
    for (const [key, val] of loginAttempts.entries()) {
        if (val.lockedUntil && val.lockedUntil < now) {
            loginAttempts.delete(key);
        }
    }
    for (const [key, val] of refreshTokens.entries()) {
        if (val.expiresAt && val.expiresAt < now) {
            refreshTokens.delete(key);
        }
    }
    for (const [key, val] of activeSessions.entries()) {
        if (val.expiresAt && val.expiresAt < now) {
            activeSessions.delete(key);
        }
    }
}

const purgeTimer = setInterval(purgeExpiredMemoryRecords, 30 * 60 * 1000);
if (purgeTimer && typeof purgeTimer.unref === 'function') {
    purgeTimer.unref();
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
    purgeExpiredMemoryRecords,
    activeSessions,
    refreshTokens,
    loginAttempts
};
