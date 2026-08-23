const db = require('../data/db-connection.js');
const config = require('../config/database');
const {
    randomToken,
    hashToken,
    setCookie,
    clearCookie,
    getCookie,
    sanitizeUser,
    markLoginFailure,
    clearLoginFailure,
    createAccessToken,
    createRefreshToken,
    issueSession,
    revokeSession,
    activeSessions,
    refreshTokens,
    loginAttempts
} = require('../utils/tokenUtils');
const { sanitizeString } = require('../utils/helpers');

const emailVerificationTokens = new Map();
const emailVerificationStatus = new Map();
const passwordResetTokens = new Map();

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

async function register(req, res) {
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
        if (!config.isProduction) {
            payload.verificationToken = verificationToken;
        }
        res.status(201).json(payload);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: error.message || 'خطأ أثناء تسجيل الحساب' });
    }
}

async function login(req, res) {
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
        const sessionId = await issueSession(user, req);
        const accessToken = createAccessToken(user, sessionId);
        const refreshToken = createRefreshToken(user, sessionId);
        const csrfToken = randomToken();

        setCookie(res, 'access_token', accessToken, { httpOnly: true, sameSite: 'lax', secure: config.isProduction, maxAge: 15 * 60 * 1000 });
        setCookie(res, 'refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', secure: config.isProduction, maxAge: 7 * 24 * 60 * 60 * 1000 });
        setCookie(res, 'csrf_token', csrfToken, { httpOnly: false, sameSite: 'lax', secure: config.isProduction, maxAge: 60 * 60 * 1000 });

        const { password: _, ...userWithoutPass } = user;
        res.json({
            message: 'تم تسجيل الدخول بنجاح!',
            user: userWithoutPass,
            sessionId,
            token: accessToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'خطأ أثناء تسجيل الدخول' });
    }
}

function getCsrfToken(req, res) {
    const csrfToken = randomToken();
    setCookie(res, 'csrf_token', csrfToken, { httpOnly: false, sameSite: 'lax', secure: config.isProduction, maxAge: 60 * 60 * 1000 });
    res.json({ csrfToken });
}

async function verifyEmail(req, res) {
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
}

async function forgotPassword(req, res) {
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

        if (!config.isProduction) {
            return res.json({ message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال تعليمات استعادة كلمة المرور.', resetToken });
        }

        res.json({ message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال تعليمات استعادة كلمة المرور.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'فشل طلب استعادة كلمة المرور' });
    }
}

async function resetPassword(req, res) {
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
}

async function refreshSession(req, res) {
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

        const newSessionId = await issueSession(user, req);
        const newAccessToken = createAccessToken(user, newSessionId);
        const newRefreshToken = createRefreshToken(user, newSessionId);
        const csrfToken = randomToken();

        refreshTokens.delete(hashToken(refreshTokenValue));
        await revokeSession(tokenRecord.sessionId);

        setCookie(res, 'access_token', newAccessToken, { httpOnly: true, sameSite: 'lax', secure: config.isProduction, maxAge: 15 * 60 * 1000 });
        setCookie(res, 'refresh_token', newRefreshToken, { httpOnly: true, sameSite: 'lax', secure: config.isProduction, maxAge: 7 * 24 * 60 * 60 * 1000 });
        setCookie(res, 'csrf_token', csrfToken, { httpOnly: false, sameSite: 'lax', secure: config.isProduction, maxAge: 60 * 60 * 1000 });

        res.json({ message: 'تم تجديد الجلسة بنجاح', user: sanitizeUser(user) });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'فشل في تحديث الجلسة' });
    }
}

async function getSession(req, res) {
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
}

async function listSessions(req, res) {
    try {
        const sessions = await db.getUserSessions(req.userId);
        res.json({ sessions });
    } catch (error) {
        console.error('Session listing error:', error);
        res.status(500).json({ message: 'فشل في جلب جلسات المستخدم' });
    }
}

async function revokeUserSession(req, res) {
    try {
        const session = await db.getSession(req.params.sessionId);
        if (!session || session.userId !== req.userId) {
            return res.status(404).json({ message: 'الجلسة غير موجودة' });
        }
        await revokeSession(req.params.sessionId);
        res.json({ message: 'تم إلغاء الجلسة بنجاح.' });
    } catch (error) {
        console.error('Revoke session error:', error);
        res.status(500).json({ message: 'فشل في إلغاء الجلسة' });
    }
}

async function logout(req, res) {
    try {
        let sessionId = req.sessionId || null;
        if (!sessionId) {
            const token = getAccessTokenFromRequest(req);
            if (token) {
                try {
                    const decoded = jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true });
                    if (decoded && decoded.sessionId) {
                        sessionId = decoded.sessionId;
                    }
                } catch (e) {}
            }
        }

        if (sessionId) {
            await revokeSession(sessionId);
        }

        const refreshTokenValue = getCookie(req, 'refresh_token');
        if (refreshTokenValue) {
            refreshTokens.delete(hashToken(refreshTokenValue));
        }

        clearCookie(res, 'access_token');
        clearCookie(res, 'refresh_token');
        clearCookie(res, 'csrf_token');
        res.json({ message: 'تم تسجيل الخروج بنجاح' });
    } catch (err) {
        console.error('Logout error:', err);
        clearCookie(res, 'access_token');
        clearCookie(res, 'refresh_token');
        clearCookie(res, 'csrf_token');
        res.json({ message: 'تم تسجيل الخروج بنجاح' });
    }
}

module.exports = {
    register,
    login,
    getCsrfToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    refreshSession,
    getSession,
    listSessions,
    revokeUserSession,
    logout
};
