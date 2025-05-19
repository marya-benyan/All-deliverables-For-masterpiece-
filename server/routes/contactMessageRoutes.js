const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Public route to submit a contact message
router.post('/', contactController.submitContactMessage);

// Admin routes
router.get('/admin/contact-messages', isAuthenticated, isAdmin, contactController.getContactMessages);
router.post('/admin/contact-messages/:messageId/reply', isAuthenticated, isAdmin, contactController.replyContactMessage);

module.exports = router;