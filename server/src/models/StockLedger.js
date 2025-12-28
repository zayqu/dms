const mongoose = require('mongoose');
const S = mongoose.Schema;

const StockLedgerSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  productId: { type: S.Types.ObjectId, ref: 'Product', required: true },

  type: {
    type: String,
    enum: [
      'OPENING',
      'PURCHASE',
      'SALE',
      'ADJUSTMENT'
    ],
    required: true
  },

  quantityIn: { type: Number, default: 0 },
  quantityOut: { type: Number, default: 0 },

  unitCost: { type: Number }, // important for profit
  reference: { type: String }, // invoice, sale id, etc

  createdBy: { type: S.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StockLedger', StockLedgerSchema);
