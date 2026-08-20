const db = require('../data/db-connection.js');
const { sanitizeString } = require('../utils/helpers');

async function createProduct(req, res) {
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
}

async function getProducts(req, res) {
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
}

async function getProductById(req, res) {
    try {
        const product = await db.getProductById(req.params.id);
        if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'خطأ في جلب المنتج' });
    }
}

async function updateProduct(req, res) {
    try {
        const success = await db.updateProduct(req.params.id, req.body);
        if (!success) return res.status(404).json({ error: 'المنتج غير موجود' });
        res.json({ message: 'تم تحديث المنتج بنجاح' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'خطأ في تحديث المنتج' });
    }
}

async function deleteProduct(req, res) {
    try {
        const success = await db.deleteProduct(req.params.id);
        if (!success) return res.status(404).json({ error: 'المنتج غير موجود' });
        res.json({ message: 'تم حذف المنتج بنجاح' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'خطأ في حذف المنتج' });
    }
}

async function autocomplete(req, res) {
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
}

async function recommendations(req, res) {
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
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    autocomplete,
    recommendations
};
