// server/src/models/Purchase.js
const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  purchaseNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }, // For credit
  paymentStatus: { type: String, enum: ['paid', 'partial', 'credit'], default: 'paid' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Purchase', PurchaseSchema);
