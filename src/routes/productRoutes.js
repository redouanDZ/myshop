const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/autocomplete', productController.autocomplete);
router.get('/recommendations', productController.recommendations);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', requireAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', requireAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', requireAdmin, productController.deleteProduct);

module.exports = router;
