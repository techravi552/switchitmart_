const express = require('express');
const router = express.Router();
const { protect, buyerOnly } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Update buyer profile/location
// @route   PUT /api/buyer/profile
router.put('/profile', protect, buyerOnly, async (req, res) => {
  try {
    const { name, phone, latitude, longitude, address } = req.body;
    const buyer = await User.findById(req.user._id);

    if (name) buyer.name = name;
    if (phone) buyer.phone = phone;
    if (latitude && longitude) {
      buyer.location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || '',
      };
    }
    await buyer.save();
    res.json({ message: 'Profile updated', buyer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
