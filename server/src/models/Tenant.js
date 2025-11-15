const mongoose = require('mongoose');
const S = mongoose.Schema;
const TenantSchema = new S({
  name: { type: String, required: true },
  plan: { type: String, default: 'trial' },
  currency: { type: String, default: 'TZS' },
  locale: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Tenant', TenantSchema);