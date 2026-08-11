const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const userRoutes = require('./userRoutes');

// Mount routes
router.use('/', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/', orderRoutes);
router.use('/user', userRoutes);

module.exports = router;
