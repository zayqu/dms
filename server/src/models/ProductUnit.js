const mongoose = require('mongoose');
const S = mongoose.Schema;

const ProductUnitSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  productId: { type: S.Types.ObjectId, ref: 'Product', required: true },
  unitId: { type: S.Types.ObjectId, ref: 'Unit', required: true },

  conversionToBase: { type: Number, required: true }, 
  // e.g Carton = 24 pieces

  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, default: 0 },

  isDefaultSaleUnit: { type: Boolean, default: false },
  isDefaultPurchaseUnit: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ProductUnit', ProductUnitSchema);
