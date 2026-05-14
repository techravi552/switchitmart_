const Order   = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const User    = require('../models/User');
const { haversineDistance, getDeliveryCharge, getEstimatedTime } = require('../utils/haversine');
const { createNotification, logActivity } = require('./notificationController');
const { formatCurrency } = require('../utils/format');
const { sendEmail, emailTemplates } = require('../utils/email');

const ACCEPT_TIMEOUT_MINUTES = 1;

const addTL = (order, status, message, actor='system') =>
  order.timeline.push({ status, message, actor, timestamp: new Date() });

// Auto-expire check helper
const checkExpired = async (order) => {
  if (order.status === 'pending' && order.acceptDeadline && new Date() > order.acceptDeadline) {
    order.status = 'expired';
    addTL(order, 'expired', 'Seller did not respond in time. Order auto-expired.');
    await Product.findByIdAndUpdate(order.product, { $inc: { stock: order.quantity } });
    if (order.paymentId) await Payment.findByIdAndUpdate(order.paymentId, { status:'failed' });
    await createNotification({
      recipientId: order.buyer, type:'order_rejected',
      title:'⏰ Order Expired', message:'Seller did not respond in time. Your order has been auto-cancelled.',
      data:{ orderId: order._id },
    });
    await createNotification({
      recipientId: order.seller, type:'order_rejected',
      title:'⚠️ Order Auto-Expired', message:'You did not accept/reject an order within the time limit.',
      data:{ orderId: order._id },
    });
    await order.save();
    return true;
  }
  return false;
};

// POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { productId, quantity, latitude, longitude, address, notes, paymentMethod='cod' } = req.body;
    if (!productId||!latitude||!longitude) return res.status(400).json({ message:'Product ID and location required' });

    const product = await Product.findById(productId).populate('seller','name shopName email');
    if (!product) return res.status(404).json({ message:'Product not found' });
    if (!product.isActive) return res.status(400).json({ message:'Product unavailable' });
    if (product.stock < 1) return res.status(400).json({ message:'Out of stock' });

    const qty = Math.max(1, parseInt(quantity)||1);
    if (qty > product.stock) return res.status(400).json({ message:`Only ${product.stock} items available` });

    // Check delivery radius
    const dist = haversineDistance(parseFloat(latitude), parseFloat(longitude), product.location.latitude, product.location.longitude);
    if (dist > (product.deliveryRadius || 10)) {
      return res.status(400).json({ message:`This product only delivers within ${product.deliveryRadius||10} km. You are ${dist} km away.` });
    }

    const customSlabs  = product.deliveryConfig?.enabled ? product.deliveryConfig.slabs : null;
    const delCharge    = product.freeDelivery ? 0 : getDeliveryCharge(dist, false, customSlabs);
    const estTime      = getEstimatedTime(dist, customSlabs);
    const savings      = Math.max(0, (product.mrpPrice||product.price) - product.price) * qty;
    const totalPrice   = product.price * qty + delCharge;

    // 15-min accept deadline
    const acceptDeadline = new Date(Date.now() + ACCEPT_TIMEOUT_MINUTES * 60 * 1000);

    const order = await Order.create({
      buyer:req.user._id, seller:product.seller._id, product:product._id,
      quantity:qty, productPrice:product.price, mrpPrice:product.mrpPrice||product.price,
      deliveryCharge:delCharge, totalPrice, savings, estimatedTime:estTime, distance:dist,
      buyerLocation:{ latitude:parseFloat(latitude), longitude:parseFloat(longitude), address:address||'' },
      notes, paymentMethod, acceptDeadline,
      timeline:[{ status:'pending', message:'Order placed. Waiting for seller to accept.', actor:'buyer', timestamp:new Date() }],
    });

    product.stock -= qty;
    await product.save();

    const payment = await Payment.create({ order:order._id, buyer:req.user._id, method:paymentMethod, amount:totalPrice });
    order.paymentId = payment._id;
    await order.save();

    await createNotification({
      recipientId:product.seller._id, senderId:req.user._id, type:'order_placed',
      title:'🛒 New Order! (15 min to respond)',
      message:`${req.user.name} ordered "${product.name}" ×${qty} — ${formatCurrency(totalPrice)}. Accept within 15 minutes!`,
      data:{ orderId:order._id, productId:product._id, totalAmount:totalPrice, quantity:qty },
    });

    const buyer = await User.findById(req.user._id);
    sendEmail({ to:buyer.email, ...emailTemplates.orderPlaced(buyer.name, product.name, totalPrice) });

    await logActivity({ actor:req.user._id, actorName:req.user.name, actorRole:'buyer', action:'order_placed', entity:'Order', entityId:order._id, description:`Order for ${product.name}` });
    await order.populate([{ path:'product',select:'name image price mrpPrice' },{ path:'seller',select:'name shopName' }]);
    res.status(201).json({ message:'Order placed!', order, payment });
  } catch(err) { console.error(err); res.status(500).json({ message:'Server error', error:err.message }); }
};

// GET /api/orders/my (buyer)
const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer:req.user._id })
      .populate('product','name image price mrpPrice').populate('seller','name shopName')
      .populate('paymentId').sort({ createdAt:-1 });
    // Check+expire any pending orders
    for (const o of orders) {
      if (o.status === 'pending') await checkExpired(o);
    }
    res.json({ orders, total:orders.length });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

// GET /api/orders/seller
const getSellerOrders = async (req, res) => {
  try {
    const q = { seller:req.user._id };
    if (req.query.status) q.status = req.query.status;
    const orders = await Order.find(q)
      .populate('product','name image price mrpPrice').populate('buyer','name email phone')
      .populate('paymentId').sort({ createdAt:-1 });
    // Check+expire pending
    for (const o of orders) {
      if (o.status === 'pending') await checkExpired(o);
    }
    res.json({ orders, total:orders.length });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

// PUT /api/orders/:id/seller-action  { action: accept|reject|pack|dispatch|deliver }
const sellerAction = async (req, res) => {
  try {
    const { action } = req.body;
    const allowed = ['accept','reject','pack','dispatch','deliver'];
    if (!allowed.includes(action)) return res.status(400).json({ message:`action must be one of: ${allowed.join(', ')}` });

    const order = await Order.findById(req.params.id)
      .populate('product','name image _id').populate('buyer','name email').populate('seller','name shopName');
    if (!order) return res.status(404).json({ message:'Order not found' });
    if (order.seller._id.toString() !== req.user._id.toString()) return res.status(403).json({ message:'Not authorized' });

    // Check expiry for accept/reject
    if (['accept','reject'].includes(action)) {
      const expired = await checkExpired(order);
      if (expired) return res.status(400).json({ message:'Order has expired (time limit passed)' });
      if (order.status !== 'pending') return res.status(400).json({ message:`Cannot ${action}: order is ${order.status}` });
    }

   const flowMap = {
  pack: {
    from: ['seller_accepted'],
    to: 'packed',
    msg: 'Order has been packed and ready for dispatch.'
  },
  dispatch: {
    from: 'packed',
    to: 'dispatched',
    msg: 'Order is out for delivery!'
  },
  deliver: {
    from: 'dispatched',
    to: 'delivered',
    msg: 'Order delivered successfully!'
  },
};

    if (action === 'accept') {
      order.status = 'seller_accepted';
addTL(order,'seller_accepted','Seller accepted your order.','seller');
      await order.save();
      await createNotification({
        recipientId:order.buyer._id, senderId:req.user._id, type:'order_accepted',
        title:'🎉 Order Accepted!',
message:`"${order.seller.shopName||order.seller.name}" accepted your order for "${order.product.name}".`,
        data:{ orderId:order._id, productId:order.product._id, productPrice:order.productPrice, deliveryCharge:order.deliveryCharge, totalAmount:order.totalPrice, quantity:order.quantity },
        requiresAction:false,
      });
      sendEmail({ to:order.buyer.email, ...emailTemplates.orderAccepted(order.buyer.name, order.product.name, order.totalPrice) });

    } else if (action === 'reject') {
      order.status = 'seller_rejected';
      addTL(order,'seller_rejected','Seller rejected this order.','seller');
      await order.save();
      await Product.findByIdAndUpdate(order.product._id, { $inc:{ stock:order.quantity } });
      if (order.paymentId) await Payment.findByIdAndUpdate(order.paymentId, { status:'failed' });
      await createNotification({
        recipientId:order.buyer._id, senderId:req.user._id, type:'order_rejected',
        title:'❌ Order Rejected',
        message:`"${order.seller.shopName||order.seller.name}" rejected your order for "${order.product.name}".`,
        data:{ orderId:order._id },
      });

    } else {
      // pack / dispatch / deliver
      const flow = flowMap[action];
      if (!flow.from.includes(order.status)) return res.status(400).json({ message:`Cannot ${action}: order must be in "${flow.from}" status (currently: ${order.status})` });
      order.status = flow.to;
      addTL(order, flow.to, flow.msg, 'seller');

      if (action === 'deliver') {
        if (order.paymentMethod === 'cod') { order.paymentStatus='paid'; if(order.paymentId) await Payment.findByIdAndUpdate(order.paymentId,{ status:'paid', codCollected:true }); }
        await Product.findByIdAndUpdate(order.product._id, { $inc:{ totalSold:order.quantity } });
        await createNotification({ recipientId:order.buyer._id, senderId:req.user._id, type:'order_delivered', title:'📦 Order Delivered!', message:`Your order for "${order.product.name}" has been delivered. Rate your experience!`, data:{ orderId:order._id, totalAmount:order.totalPrice } });
        await createNotification({ recipientId:order.seller._id, type:'order_delivered', title:'✅ Delivery Complete', message:`Order for "${order.product.name}" to ${order.buyer.name} done.`, data:{ orderId:order._id } });
        sendEmail({ to:order.buyer.email, ...emailTemplates.orderDelivered(order.buyer.name, order.product.name) });
      } else {
        await createNotification({ recipientId:order.buyer._id, senderId:req.user._id, type:'order_placed', title: action==='pack'?'📦 Order Packed':'🚴 Out for Delivery!', message: flow.msg, data:{ orderId:order._id } });
      }
      await order.save();
    }

    await logActivity({ actor:req.user._id, actorName:req.user.name, actorRole:'seller', action:`order_${action}`, entity:'Order', entityId:order._id, description:`${action} order for ${order.product.name}` });
    res.json({ message:`Order ${action}ed`, order });
  } catch(err) { console.error(err); res.status(500).json({ message:'Server error', error:err.message }); }
};

// POST /api/orders/estimate
const getEstimate = async (req, res) => {
  try {
    const { productId, latitude, longitude } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message:'Product not found' });
    const dist = haversineDistance(parseFloat(latitude), parseFloat(longitude), product.location.latitude, product.location.longitude);
    const withinRadius = dist <= (product.deliveryRadius || 10);
    const customSlabs = product.deliveryConfig?.enabled ? product.deliveryConfig.slabs : null;
    const deliveryCharge = product.freeDelivery ? 0 : getDeliveryCharge(dist, false, customSlabs);
    const estimatedTime  = getEstimatedTime(dist, customSlabs);
    const savings = Math.max(0, (product.mrpPrice||product.price) - product.price);
    res.json({ distance:dist, deliveryRadius:product.deliveryRadius||10, withinRadius, deliveryCharge, estimatedTime, productPrice:product.price, mrpPrice:product.mrpPrice, savings, totalPrice:product.price+deliveryCharge, freeDelivery:product.freeDelivery });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

module.exports = { placeOrder, getBuyerOrders, getSellerOrders, sellerAction, getEstimate };
