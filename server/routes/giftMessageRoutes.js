const express = require('express');
const router = express.Router();
const giftMessageController = require('../controllers/giftMessageController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

router.get('/admin/gift-messages', isAuthenticated, isAdmin, giftMessageController.getGiftMessages);

module.exports = router;