// server/src/models/Tenant.js
const mongoose = require('mongoose');
const S = mongoose.Schema;

const TenantSchema = new S({
  name: { type: String, required: true },
  plan: { type: String, default: 'trial' }, // trial or paid
  currency: { type: String, default: 'TZS' },
  locale: { type: String, default: 'en' },
  createdBy: { type: S.Types.ObjectId, ref: 'User' }, // owner
  trialExpiresAt: { type: Date, default: () => new Date(Date.now() + 90*24*60*60*1000) }, // 3 months
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', TenantSchema);
