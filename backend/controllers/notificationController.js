const Notification = require('../models/Notification');
const ActivityLog  = require('../models/ActivityLog');

const createNotification = async ({ recipientId, senderId = null, type, title, message, data = {}, requiresAction = false }) => {
  try {
    return await Notification.create({ recipient: recipientId, sender: senderId, type, title, message, data, requiresAction });
  } catch (e) {
    console.error('createNotification error:', e.message);
  }
};

const logActivity = async ({ actor, actorName, actorRole, action, entity, entityId, description, ip = '' }) => {
  try {
    await ActivityLog.create({ actor, actorName, actorRole, action, entity, entityId, description, ip });
  } catch (e) {
    console.error('logActivity error:', e.message);
  }
};

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip  = (page - 1) * limit;
    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('sender', 'name shopName'),
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);
    res.json({ notifications, total, unread, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/notifications/:id/respond  (buyer confirms or rejects after seller accepted)
// const respondToNotification = async (req, res) => {
//   try {
//     const { action } = req.body; // 'confirmed' | 'rejected'
//     if (!['confirmed', 'rejected'].includes(action))
//       return res.status(400).json({ message: 'action must be confirmed or rejected' });

//     const notification = await Notification.findOne({
//       _id: req.params.id, recipient: req.user._id, requiresAction: true, actionTaken: null,
//     });
//     if (!notification) return res.status(404).json({ message: 'Notification not found or already actioned' });

//     notification.actionTaken = action;
//     notification.isRead = true;
//     await notification.save();

//     const Order   = require('../models/Order');
//     const Product = require('../models/Product');
//     const newStatus = action === 'confirmed' ? 'buyer_confirmed' : 'buyer_rejected';

//     const order = await Order.findByIdAndUpdate(notification.data.orderId, { status: newStatus }, { new: true })
//       .populate('product', 'name _id')
//       .populate('seller', 'name shopName')
//       .populate('buyer', 'name');
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     if (action === 'rejected') {
//       await Product.findByIdAndUpdate(order.product._id, { $inc: { stock: order.quantity } });
//     }

//     const sellerTitle = action === 'confirmed' ? '✅ Buyer Confirmed Order' : '❌ Buyer Rejected Order';
//     const sellerMsg   = action === 'confirmed'
//       ? `${order.buyer.name} confirmed order for "${order.product.name}". Prepare for delivery!`
//       : `${order.buyer.name} rejected the order for "${order.product.name}".`;

//     await createNotification({
//       recipientId: order.seller._id, senderId: req.user._id,
//       type: action === 'confirmed' ? 'buyer_confirmed' : 'buyer_rejected',
//       title: sellerTitle, message: sellerMsg,
//       data: { orderId: order._id, productId: order.product._id, totalAmount: order.totalPrice },
//     });

//     await logActivity({
//       actor: req.user._id, actorName: req.user.name, actorRole: 'buyer',
//       action: `buyer_${action}`, entity: 'Order', entityId: order._id,
//       description: `Buyer ${action} order for ${order.product.name}`,
//     });

//     res.json({ message: `Order ${action}`, order });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// module.exports = { getNotifications, getUnreadCount, markRead, markAllRead, respondToNotification, createNotification, logActivity };
module.exports = { getNotifications, getUnreadCount, markRead, markAllRead,  createNotification, logActivity };
