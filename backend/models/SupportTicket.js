const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole:{ type: String, enum: ['buyer','seller','admin'], required: true },
  message:   { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userRole:  { type: String, enum: ['buyer','seller'], required: true },
  subject:   { type: String, required: true, trim: true },
  message:   { type: String, required: true, trim: true },
  category:  { type: String, enum: ['order','payment','product','account','other'], default: 'other' },
  status:    { type: String, enum: ['open','in_progress','resolved'], default: 'open' },
  priority:  { type: String, enum: ['low','medium','high'], default: 'medium' },
  replies:   [replySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ticketSchema.pre('save', function(next){ this.updatedAt = Date.now(); next(); });
ticketSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', ticketSchema);
