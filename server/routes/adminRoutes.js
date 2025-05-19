const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware'); // استيراد من authMiddleware
const upload = require('../middleware/upload');

// Admin routes
router.post('/products', isAuthenticated, isAdmin, upload, adminController.addProduct);
router.get('/products', isAuthenticated, isAdmin, adminController.getProducts);
router.get('/users', isAuthenticated, isAdmin, adminController.getUsers);
router.get('/reviews', isAuthenticated, isAdmin, adminController.getReviews);
router.post('/discounts', isAuthenticated, isAdmin, adminController.addDiscount);
router.get('/discounts', isAuthenticated, isAdmin, adminController.getDiscounts);
router.get('/contact-messages', isAuthenticated, isAdmin, adminController.getContactMessages);
router.post('/contact-messages/:id/reply', isAuthenticated, isAdmin, adminController.replyContactMessage);
router.get('/gift-messages', isAuthenticated, isAdmin, adminController.getGiftMessages);

module.exports = router;