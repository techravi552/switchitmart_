const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Payment  = require('../models/Payment');
const Order    = require('../models/Order');
const { createNotification } = require('./notificationController');

const getRazorpay = () => new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
});

// POST /api/payment/razorpay/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('product','name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(order.totalPrice * 100), // paise
      currency: 'INR',
      receipt:  `order_${orderId}`,
      notes:    { orderId: orderId.toString(), productName: order.product?.name },
    });

    // Store razorpay order id on payment
    await Payment.findByIdAndUpdate(order.paymentId, { razorpayOrderId: rzpOrder.id });

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (err) {
    console.error('Razorpay error:', err.message);
    res.status(500).json({ message: 'Payment initiation failed', error: err.message });
  }
};

// POST /api/payment/razorpay/verify
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder';
    const body   = razorpayOrderId + '|' + razorpayPaymentId;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expected !== razorpaySignature && process.env.NODE_ENV !== 'development') {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment record
    const order = await Order.findById(orderId).populate('seller','_id').populate('product','name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await Payment.findByIdAndUpdate(order.paymentId, {
      status: 'paid', razorpayOrderId, razorpayPaymentId, razorpaySignature,
    });
    order.paymentStatus = 'paid';
    await order.save();

    await createNotification({
      recipientId: order.seller._id, senderId: req.user._id,
      type: 'order_placed', title: '💳 Payment Received!',
      message: `Payment of ₹${order.totalPrice} confirmed for "${order.product?.name}".`,
      data: { orderId: order._id, totalAmount: order.totalPrice },
    });

    res.json({ message: 'Payment verified successfully', paymentId: razorpayPaymentId });
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/payment/:orderId
const getPaymentByOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const uid = req.user._id.toString();
    if (order.buyer.toString() !== uid && order.seller.toString() !== uid && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    const payment = await Payment.findById(order.paymentId);
    res.json({ payment });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment, getPaymentByOrder };
