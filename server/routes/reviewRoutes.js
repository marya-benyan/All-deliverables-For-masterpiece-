const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/', isAuthenticated, reviewController.createReview); // حماية المسار
router.put('/:id', isAuthenticated, reviewController.updateReview);
router.delete('/:id', isAuthenticated, reviewController.deleteReview);

// Admin-only route
router.get('/admin/reviews', isAuthenticated, isAdmin, reviewController.getReviews);

module.exports = router;