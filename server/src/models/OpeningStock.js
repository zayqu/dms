const mongoose = require('mongoose');
const S = mongoose.Schema;

const OpeningStockSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  productId: { type: S.Types.ObjectId, ref: 'Product', required: true },

  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },

  createdBy: { type: S.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('OpeningStock', OpeningStockSchema);
