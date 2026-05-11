const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  actorName: { type: String, default: 'System' },
  actorRole: { type: String, default: 'system' },
  action: { type: String, required: true },
  entity: { type: String, default: '' },   // e.g. 'Order', 'User', 'Product'
  entityId: { type: String, default: '' },
  description: { type: String, default: '' },
  ip: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
