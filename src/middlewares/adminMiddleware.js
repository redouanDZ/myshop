const db = require('../../js/db-connection.js');
const { parseUserFromReq } = require('../utils/tokenUtils');

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

module.exports = {
    requireAdmin
};
