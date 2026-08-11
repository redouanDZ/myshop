const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/orders', orderController.createOrder);
router.get('/orders', requireAuth, orderController.getOrders);
router.get('/orders/:id', requireAuth, orderController.getOrderById);
router.get('/order-items/:orderId', requireAuth, orderController.getOrderItems);

module.exports = router;
