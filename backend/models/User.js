const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:         { type: String, required: true, minlength: 6 },
  role:             { type: String, enum: ['seller','buyer','admin'], required: true },
  phone:            { type: String, trim: true },
  shopName:         { type: String, trim: true },
  shopDescription:  { type: String, trim: true },
  shopPhone:        { type: String, trim: true },  // shop contact
  shopAddress:      { type: String, trim: true },
  location: {
    latitude:  { type: Number },
    longitude: { type: Number },
    address:   { type: String },
  },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  wishlist:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive:     { type: Boolean, default: true },
  isBlocked:    { type: Boolean, default: false },
  isTopSeller:  { type: Boolean, default: false },
  darkMode:     { type: Boolean, default: false },
  createdAt:    { type: Date, default: Date.now },
});

userSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = async function(p){ return bcrypt.compare(p, this.password); };

module.exports = mongoose.model('User', userSchema);
