// server/src/models/CapitalTransaction.js
const mongoose = require('mongoose');

const CapitalTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['inject', 'withdraw'], required: true },
  amount: { type: Number, required: true },
  note: { type: String },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true }, // optional reference
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('CapitalTransaction', CapitalTransactionSchema);
