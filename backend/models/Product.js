const mongoose = require('mongoose');

const deliverySlabSchema = new mongoose.Schema({
  minKm: Number, maxKm: Number, charge: Number, timeLabel: { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  mrpPrice:    { type: Number, required: true, min: 0 },
  price:       { type: Number, required: true, min: 0 },
  image:       { type: String, default: '' },
  category:    { type: String, trim: true, default: 'General' },
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true },
    address:   { type: String, default: '' },
  },
  // Delivery radius in km — only buyers within this radius see the product
  deliveryRadius: { type: Number, default: 10, min: 1, max: 50 },
  stock:        { type: Number, default: 1, min: 0 },
  freeDelivery: { type: Boolean, default: false },
  isBoosted:    { type: Boolean, default: false },
  boostExpiry:  { type: Date, default: null },
  isActive:     { type: Boolean, default: true },
  avgRating:    { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalSold:    { type: Number, default: 0 },
  views:        { type: Number, default: 0 },
  deliveryConfig: {
    enabled: { type: Boolean, default: false },
    slabs:   [deliverySlabSchema],
  },
  tags:    [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
});

productSchema.virtual('stockStatus').get(function(){
  if (this.stock === 0)  return 'out_of_stock';
  if (this.stock <= 9)   return 'low_stock';
  return 'in_stock';
});
productSchema.virtual('discountPercent').get(function(){
  if (!this.mrpPrice || this.mrpPrice <= this.price) return 0;
  return Math.round(((this.mrpPrice - this.price) / this.mrpPrice) * 100);
});
productSchema.virtual('savings').get(function(){
  return Math.max(0, (this.mrpPrice || this.price) - this.price);
});
productSchema.set('toJSON',   { virtuals: true });
productSchema.set('toObject', { virtuals: true });
productSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
