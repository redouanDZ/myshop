const jwt = require('jsonwebtoken');
const config = require('../config/database');
const { parseUserFromReq, getAccessTokenFromRequest } = require('../utils/tokenUtils');

function requireAuth(req, res, next) {
    const userId = parseUserFromReq(req);
    if (!userId) {
        return res.status(401).json({ message: 'غير مصرح لك، يرجى تسجيل الدخول' });
    }
    req.userId = userId;
    const accessToken = getAccessTokenFromRequest(req);
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, config.JWT_SECRET);
            req.sessionId = decoded.sessionId || null;
        } catch (error) {
            return res.status(401).json({ message: 'توكن غير صالح' });
        }
    } else {
        return res.status(401).json({ message: 'التوكن مفقود' });
    }
    next();
}

module.exports = {
    requireAuth
};
