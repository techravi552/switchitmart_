const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order:          { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  buyer:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method:         { type: String, enum: ['cod', 'razorpay'], required: true },
  status:         { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  amount:         { type: Number, required: true },
  // Razorpay fields
  razorpayOrderId:   { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  // COD fields
  codCollected:   { type: Boolean, default: false },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
