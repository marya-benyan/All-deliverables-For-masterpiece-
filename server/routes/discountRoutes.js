const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

router.get('/admin/discounts', isAuthenticated, isAdmin, discountController.getDiscounts);
router.post('/', isAuthenticated, isAdmin, discountController.addDiscount);

module.exports = router;