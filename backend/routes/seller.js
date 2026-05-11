const express = require('express');
const router = express.Router();
const { getSellerDashboard, updateProfile } = require('../controllers/sellerController');
const { protect, sellerOnly } = require('../middleware/auth');

router.get('/dashboard', protect, sellerOnly, getSellerDashboard);
router.put('/profile', protect, sellerOnly, updateProfile);

module.exports = router;
