const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.route('/').post(isAuthenticated, orderController.createOrder);
router.route('/').get(isAuthenticated, orderController.getOrders);

module.exports = router;