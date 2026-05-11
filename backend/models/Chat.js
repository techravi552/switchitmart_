const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  isRead:    { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema({
  buyer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  messages:  [messageSchema],
  lastMessage:   { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  buyerUnread:   { type: Number, default: 0 },
  sellerUnread:  { type: Number, default: 0 },
}, { timestamps: true });

chatSchema.index({ buyer: 1, seller: 1 });

module.exports = mongoose.model('Chat', chatSchema);
