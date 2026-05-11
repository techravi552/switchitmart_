const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role, phone, shopName, shopDescription, latitude, longitude } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'Name, email, password and role required' });
    if (!['seller','buyer'].includes(role))
      return res.status(400).json({ message: 'Role must be seller or buyer' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const userData = { name, email, password, role, phone };
    if (role === 'seller') {
      userData.shopName = shopName || `${name}'s Shop`;
      userData.shopDescription = shopDescription || '';
    }
    if (latitude && longitude) {
      userData.location = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    }
    const user = await User.create(userData);

    // Free subscription for sellers
    if (role === 'seller') {
      const exp = new Date(); exp.setDate(exp.getDate() + 30);
      const sub = await Subscription.create({ seller: user._id, plan: 'free', expiryDate: exp });
      user.subscription = sub._id;
      await user.save();
    }

    res.status(201).json({
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, shopName: user.shopName },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive || user.isBlocked)
      return res.status(403).json({ message: 'Account is blocked or deactivated. Contact admin.' });

    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, shopName: user.shopName, shopDescription: user.shopDescription },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('subscription');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { signup, login, getMe };
