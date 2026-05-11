const express = require('express');
const router = express.Router();
const { getMySubscription, purchaseSubscription, getPlans } = require('../controllers/subscriptionController');
const { protect, sellerOnly } = require('../middleware/auth');

router.get('/plans', getPlans);
router.get('/my', protect, sellerOnly, getMySubscription);
router.post('/purchase', protect, sellerOnly, purchaseSubscription);

module.exports = router;
