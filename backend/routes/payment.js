const express = require('express');
const router  = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, getPaymentByOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify',       protect, verifyRazorpayPayment);
router.get('/:orderId',               protect, getPaymentByOrder);
module.exports = router;
