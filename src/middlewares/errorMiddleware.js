function errorHandler(err, req, res, next) {
    console.error('Unhandled Error:', err.stack || err.message || err);

    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'حجم الطلب كبير جداً' });
    }

    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ message: 'يسمح فقط برفع ملفات الصور' });
    }

    res.status(500).json({
        message: 'حدث خطأ داخلي في الخادم',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}

function notFoundHandler(req, res, next) {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'المسار غير موجود' });
    }
    res.status(404).sendFile('index.html', { root: './' });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
