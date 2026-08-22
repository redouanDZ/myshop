const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middlewares/adminMiddleware');

router.get('/dashboard-stats', requireAdmin, adminController.getDashboardStats);
router.get('/store-config', adminController.getPublicConfig);

module.exports = router;
