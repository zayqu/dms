const mongoose = require('mongoose');
const S = mongoose.Schema;
const UserSchema = new S({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner','admin','seller','viewer'], default: 'seller' },
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  language: { type: String, enum: ['en','sw'], default: 'en' },
  phone: { type: String },
  trialEndsAt: { type: Date, default: () => new Date(Date.now() + 90*24*60*60*1000) },
  active: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);