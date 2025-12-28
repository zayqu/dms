const mongoose = require('mongoose');
const S = mongoose.Schema;

const StockBalanceSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  productId: { type: S.Types.ObjectId, ref: 'Product', required: true },
  locationId: { type: S.Types.ObjectId, ref: 'Location' },

  quantityBase: { type: Number, default: 0 }, // always base unit
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockBalance', StockBalanceSchema);
