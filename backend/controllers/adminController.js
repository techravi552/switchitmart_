const User         = require('../models/User');
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const ActivityLog  = require('../models/ActivityLog');
const jwt          = require('jsonwebtoken');
const { createNotification, logActivity } = require('./notificationController');
const { PLANS } = require('../models/Subscription');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid admin credentials' });
    await logActivity({ actor: user._id, actorName: user.name, actorRole: 'admin', action: 'admin_login', entity: 'User', entityId: user._id, description: 'Admin logged in' });
    res.json({ message: 'Admin login successful', token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/seed  (run once to create default admin)
const seedAdmin = async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'admin' });
    if (exists) return res.status(400).json({ message: 'Admin already exists. Email: admin@localkart.com' });
    await User.create({ name: 'Super Admin', email: 'admin@localkart.com', password: 'admin123456', role: 'admin' });
    res.status(201).json({ message: 'Admin created', email: 'admin@localkart.com', password: 'admin123456' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers, totalSellers, totalBuyers,
      totalProducts, activeProducts,
      totalOrders, pendingOrders, deliveredOrders,
      revenueData, activeSubs,
      recentActivity, topSellers,
      ordersByStatus,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'buyer' }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Subscription.countDocuments({ isActive: true, expiryDate: { $gt: new Date() } }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('actor', 'name role'),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: '$seller', totalRevenue: { $sum: '$totalPrice' }, totalOrders: { $sum: 1 } } },
        { $sort: { totalRevenue: -1 } }, { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'info' } },
        { $unwind: '$info' },
        { $project: { totalRevenue: 1, totalOrders: 1, 'info.name': 1, 'info.shopName': 1, 'info.email': 1 } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    res.json({
      stats: { totalUsers, totalSellers, totalBuyers, totalProducts, activeProducts, totalOrders, pendingOrders, deliveredOrders, totalRevenue: revenueData[0]?.total || 0, activeSubscriptions: activeSubs },
      recentActivity, topSellers, ordersByStatus,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = { role: { $ne: 'admin' } };
    if (role && role !== 'all') query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('subscription', 'plan expiryDate isActive'),
      User.countDocuments(query),
    ]);
    res.json({ users, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive, isBlocked } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ message: 'User not found' });
    if (isActive  !== undefined) user.isActive  = isActive;
    if (isBlocked !== undefined) user.isBlocked = isBlocked;
    await user.save();
    const action = isBlocked ? 'blocked' : isActive === false ? 'deactivated' : 'activated';
    await createNotification({ recipientId: user._id, type: 'account_action', title: `Account ${action.charAt(0).toUpperCase() + action.slice(1)}`, message: `Your account has been ${action} by the admin.` });
    await logActivity({ actor: req.user._id, actorName: req.user.name, actorRole: 'admin', action: `user_${action}`, entity: 'User', entityId: user._id, description: `Admin ${action} user ${user.email}` });
    res.json({ message: `User ${action}`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    await logActivity({ actor: req.user._id, actorName: req.user.name, actorRole: 'admin', action: 'user_deleted', entity: 'User', entityId: req.params.id, description: `Deleted user ${user.email}` });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/products
const getProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query).populate('seller', 'name shopName email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ products, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/admin/products/:id/toggle
const toggleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isActive = !product.isActive;
    await product.save();
    await logActivity({ actor: req.user._id, actorName: req.user.name, actorRole: 'admin', action: product.isActive ? 'product_activated' : 'product_hidden', entity: 'Product', entityId: product._id, description: `${product.isActive ? 'Activated' : 'Hidden'} product: ${product.name}` });
    res.json({ message: `Product ${product.isActive ? 'activated' : 'hidden'}`, product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    await logActivity({ actor: req.user._id, actorName: req.user.name, actorRole: 'admin', action: 'product_deleted', entity: 'Product', entityId: req.params.id, description: `Deleted product: ${product.name}` });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('buyer', 'name email').populate('seller', 'name shopName').populate('product', 'name price image').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const { plan, page = 1, limit = 20 } = req.query;
    const query = {};
    if (plan && plan !== 'all') query.plan = plan;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [subs, total, planStats] = await Promise.all([
      Subscription.find(query).populate('seller', 'name shopName email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Subscription.countDocuments(query),
      Subscription.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } }]),
    ]);
    res.json({ subscriptions: subs, total, pages: Math.ceil(total / parseInt(limit)), planStats });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/subscriptions/assign
const assignSubscription = async (req, res) => {
  try {
    const { sellerId, plan } = req.body;
    if (!['normal', 'silver', 'gold'].includes(plan)) return res.status(400).json({ message: 'Invalid plan' });
    const seller = await User.findOne({ _id: sellerId, role: 'seller' });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    await Subscription.updateMany({ seller: sellerId, isActive: true }, { isActive: false });
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const sub = await Subscription.create({ seller: sellerId, plan, expiryDate, isActive: true, productsUsed: 0 });
    seller.subscription = sub._id;
    await seller.save();
    await createNotification({ recipientId: sellerId, type: 'account_action', title: '🎉 Subscription Upgraded by Admin', message: `Admin assigned you the ${PLANS[plan].name} plan (${PLANS[plan].productLimit} products/month) for 30 days.` });
    await logActivity({ actor: req.user._id, actorName: req.user.name, actorRole: 'admin', action: 'subscription_assigned', entity: 'Subscription', entityId: sub._id, description: `Assigned ${plan} to ${seller.email}` });
    res.json({ message: `${PLANS[plan].name} plan assigned`, subscription: sub });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/notify
const sendAdminNotification = async (req, res) => {
  try {
    const { targetRole, targetUserId, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message required' });
    let recipients = [];
    if (targetUserId) {
      recipients = [targetUserId];
    } else {
      const q = { role: { $ne: 'admin' } };
      if (targetRole && targetRole !== 'all') q.role = targetRole;
      const users = await User.find(q).select('_id');
      recipients = users.map((u) => u._id);
    }
    await Promise.all(recipients.map((id) => createNotification({ recipientId: id, senderId: req.user._id, type: 'admin_message', title, message })));
    await logActivity({ actor: req.user._id, actorName: req.user.name, actorRole: 'admin', action: 'bulk_notification_sent', entity: 'Notification', entityId: '', description: `Sent to ${recipients.length} users: "${title}"` });
    res.json({ message: `Notification sent to ${recipients.length} user(s)` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/activity-logs
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('actor', 'name role'),
      ActivityLog.countDocuments(),
    ]);
    res.json({ logs, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { adminLogin, seedAdmin, getDashboard, getUsers, updateUserStatus, deleteUser, getProducts, toggleProduct, deleteProduct, getOrders, getSubscriptions, assignSubscription, sendAdminNotification, getActivityLogs };
