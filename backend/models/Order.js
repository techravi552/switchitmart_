const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   { type: String, default: '' },
  actor:     { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:       { type: Number, default: 1, min: 1 },
  productPrice:   { type: Number, required: true },
  mrpPrice:       { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  totalPrice:     { type: Number, required: true },
  savings:        { type: Number, default: 0 },
  estimatedTime:  { type: String, default: '' },
  distance:       { type: Number, default: 0 },
  buyerLocation: {
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true },
    address:   { type: String, default: '' },
  },
  status: {
    type: String,
    enum: [
      'pending',           // buyer placed, waiting seller
      'seller_accepted',   // seller accepted, waiting buyer confirm
      'seller_rejected',   // seller rejected
      'buyer_confirmed',   // buyer confirmed
      'buyer_rejected',    // buyer rejected after seller accepted
      'packed',            // seller packed
      'dispatched',        // out for delivery
      'delivered',         // delivered
      'expired',           // seller didn't respond in time
    ],
    default: 'pending',
  },
  // Time limit: seller must accept/reject within 15 min
  acceptDeadline: { type: Date, default: null },
  // Timeline events
  timeline: [trackingSchema],
  paymentMethod: { type: String, enum: ['cod','razorpay'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  paymentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  notes:         { type: String, trim: true },
  invoiceUrl:    { type: String, default: '' },
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now },
});

orderSchema.pre('save', function(next){ this.updatedAt = Date.now(); next(); });

// Virtual: seconds remaining for seller to accept
orderSchema.virtual('acceptSecondsLeft').get(function(){
  if (!this.acceptDeadline || this.status !== 'pending') return null;
  return Math.max(0, Math.round((this.acceptDeadline - Date.now()) / 1000));
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
