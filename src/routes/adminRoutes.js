const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middlewares/adminMiddleware');

const { upload, validateUploadedImage } = require('../middlewares/uploadMiddleware');

router.get('/dashboard-stats', requireAdmin, adminController.getDashboardStats);
router.get('/store-config', adminController.getPublicConfig);

// Customers Management
router.get('/users', requireAdmin, adminController.getAdminUsers);
router.get('/users/:id', requireAdmin, adminController.getAdminUserById);

// Coupons Management
router.get('/coupons', requireAdmin, adminController.getAdminCoupons);
router.post('/coupons', requireAdmin, adminController.createCoupon);
router.put('/coupons/:id', requireAdmin, adminController.updateCoupon);
router.delete('/coupons/:id', requireAdmin, adminController.deleteCoupon);

// Reviews Moderation
router.get('/reviews', requireAdmin, adminController.getAdminReviews);
router.put('/reviews/:id/status', requireAdmin, adminController.updateReviewStatus);
router.delete('/reviews/:id', requireAdmin, adminController.deleteReview);

// Store Settings & Marketing Pixels
router.get('/settings', requireAdmin, adminController.getStoreSettings);
router.put('/settings', requireAdmin, adminController.updateStoreSettings);
router.post('/upload-media', requireAdmin, upload.single('file'), validateUploadedImage, adminController.uploadMedia);

module.exports = router;
