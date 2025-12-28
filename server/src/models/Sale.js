// server/src/models/Sale.js
const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  saleNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }, // For credit
  paymentStatus: { type: String, enum: ['paid', 'partial', 'credit'], default: 'paid' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);
