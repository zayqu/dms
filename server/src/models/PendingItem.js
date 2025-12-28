// File: dms/server/src/models/PendingItem.js
const mongoose = require('mongoose');
const S = mongoose.Schema;
const PendingItemSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  createdBy: { type: S.Types.ObjectId, ref: 'User' }, // user who tried to push
  type: { type: String, required: true }, // e.g. 'transaction'
  payload: { type: S.Types.Mixed, required: true },
  status: { type: String, enum: ['pending','processing','failed','done'], default: 'pending' },
  lastError: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('PendingItem', PendingItemSchema);
