const mongoose = require('mongoose');

const PLANS = {
  free:     { name: 'Free',     productLimit: 3,   price: 0,    boostLimit: 0,  analytics: false, freeDeliveryToggle: false, priorityRank: 0, badge: ''          },
  silver:   { name: 'Silver',   productLimit: 20,  price: 500,  boostLimit: 3,  analytics: false, freeDeliveryToggle: false, priorityRank: 1, badge: '🥈 Silver' },
  gold:     { name: 'Gold',     productLimit: 50,  price: 1000, boostLimit: 10, analytics: true,  freeDeliveryToggle: true,  priorityRank: 2, badge: '🥇 Gold'   },
  platinum: { name: 'Platinum', productLimit: 200, price: 2000, boostLimit: -1, analytics: true,  freeDeliveryToggle: true,  priorityRank: 3, badge: '💎 Platinum'},
};

const subscriptionSchema = new mongoose.Schema({
  seller:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:         { type: String, enum: ['free','silver','gold','platinum'], default: 'free' },
  startDate:    { type: Date, default: Date.now },
  expiryDate:   { type: Date, required: true },
  isActive:     { type: Boolean, default: true },
  productsUsed: { type: Number, default: 0 },
  boostsUsed:   { type: Number, default: 0 },
  paymentId:    { type: String },
});

subscriptionSchema.methods.isValid    = function(){ return this.isActive && new Date() < this.expiryDate; };
subscriptionSchema.methods.canAddProduct = function(){ return this.isValid() && this.productsUsed < PLANS[this.plan].productLimit; };
subscriptionSchema.methods.canBoost   = function(){ const b = PLANS[this.plan].boostLimit; return this.isValid() && (b === -1 || this.boostsUsed < b); };
subscriptionSchema.set('toJSON',   { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
module.exports.PLANS = PLANS;
