const express = require('express');
const router = express.Router();
const { createPayment, getAllPayments, getPaymentStatus, confirmPayment, cancelPayment } = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/pay', isAuthenticated, createPayment);
router.get('/all', isAuthenticated, getAllPayments);
router.get('/:orderId', isAuthenticated, getPaymentStatus);
router.get('/success', isAuthenticated, confirmPayment);
router.get('/cancel', isAuthenticated, cancelPayment);

module.exports = router;