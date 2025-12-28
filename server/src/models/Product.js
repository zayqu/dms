const mongoose = require('mongoose');
const S = mongoose.Schema;

const ProductSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  sku: { type: String },
  categoryId: { type: S.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
  trackStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
