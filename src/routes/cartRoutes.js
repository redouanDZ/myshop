const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/add', cartController.addToCart);
router.get('/:userId', cartController.getCartItems);
router.put('/:cartItemId', requireAuth, cartController.updateCartItem);
router.delete('/:cartItemId', requireAuth, cartController.removeCartItem);

module.exports = router;
