const mongoose = require('mongoose');
const S = mongoose.Schema;
const ItemSchema = new S({
  productId: { type: S.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true }
});
const TransactionSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  type: { type: String, enum: ['sale','purchase'], required: true },
  items: [ItemSchema],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Mpesa','MixxByYas','AirtelMoney','HaloPesa','Cash','Bank','Other'], default: 'Cash' },
  reference: { type: String },
  createdBy: { type: S.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('Transaction', TransactionSchema);