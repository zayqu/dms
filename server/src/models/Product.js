const mongoose = require('mongoose');
const S = mongoose.Schema;
const ProductSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  sku: { type: String },
  unit: { type: String, default: 'Piece' }, // Carton, Crate, Piece, Box...
  unitsPerBase: { type: Number, default: 1 }, // conversion to base unit
  buyPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Product', ProductSchema);
