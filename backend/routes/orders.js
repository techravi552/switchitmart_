const express = require('express');
const router  = express.Router();
const { placeOrder, getBuyerOrders, getSellerOrders, sellerAction, getEstimate } = require('../controllers/orderController');
const { protect, sellerOnly, buyerOnly } = require('../middleware/auth');

router.post('/estimate', protect, getEstimate);
router.post('/',         protect, buyerOnly,  placeOrder);
router.get('/my',        protect, buyerOnly,  getBuyerOrders);
router.get('/seller',    protect, sellerOnly, getSellerOrders);
router.put('/:id/seller-action', protect, sellerOnly, sellerAction);
// Buyer notification-based confirm/reject still in notificationController
module.exports = router;
