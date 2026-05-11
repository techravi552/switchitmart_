const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  type: {
    type: String,
    enum: [
      'order_placed',        // seller gets this
      'order_accepted',      // buyer gets this (with payment details + confirm/reject)
      'order_rejected',      // buyer gets this
      'buyer_confirmed',     // seller gets this
      'buyer_rejected',      // seller gets this
      'order_delivered',     // buyer gets this
      'subscription_expiry', // seller gets this
      'admin_message',       // any user gets this
      'product_approved',
      'product_removed',
      'account_action',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    orderId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    productId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    productPrice:   { type: Number, default: null },
    deliveryCharge: { type: Number, default: null },
    totalAmount:    { type: Number, default: null },
    quantity:       { type: Number, default: null },
    extra:          { type: mongoose.Schema.Types.Mixed, default: null },
  },
  isRead:    { type: Boolean, default: false },
  // For order notifications requiring buyer action
  requiresAction: { type: Boolean, default: false },
  actionTaken:    { type: String, enum: ['confirmed', 'rejected', null], default: null },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
