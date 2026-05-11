const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      if (!req.user.isActive || req.user.isBlocked)
        return res.status(403).json({ message: 'Account is blocked or deactivated' });
      next();
    } catch {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seller') return next();
  res.status(403).json({ message: 'Access denied: Sellers only' });
};

const buyerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'buyer') return next();
  res.status(403).json({ message: 'Access denied: Buyers only' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Access denied: Admins only' });
};

module.exports = { protect, sellerOnly, buyerOnly, adminOnly };
