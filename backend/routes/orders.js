// const express = require('express');
// const router  = express.Router();
// const { placeOrder, getBuyerOrders, getSellerOrders, sellerAction, getEstimate } = require('../controllers/orderController');
// const { protect, sellerOnly, buyerOnly } = require('../middleware/auth');

// router.post('/estimate', protect, getEstimate);
// router.post('/',         protect, buyerOnly,  placeOrder);
// router.get('/my',        protect, buyerOnly,  getBuyerOrders);
// router.get('/seller',    protect, sellerOnly, getSellerOrders);
// router.put('/:id/seller-action', protect, sellerOnly, sellerAction);
// // Buyer notification-based confirm/reject still in notificationController
// module.exports = router;


const express = require('express');
const router = express.Router();

const {
  placeOrder,
  getBuyerOrders,
  getSellerOrders,
  sellerAction,
  getEstimate
} = require('../controllers/orderController');

const { protect } = require('../middleware/auth');

// BUYER ORDERS
router.get('/my', protect, getBuyerOrders);

// SELLER ORDERS ⭐ IMPORTANT FIX
router.get('/seller', protect, getSellerOrders);

// PLACE ORDER
router.post('/', protect, placeOrder);

// SELLER ACTION
router.put('/:id/seller-action', protect, sellerAction);

// ESTIMATE
router.post('/estimate', protect, getEstimate);

module.exports = router;
