// server/src/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['customer', 'supplier', 'expense', 'capital'], 
    required: true 
  },
  reference: { type: mongoose.Schema.Types.ObjectId }, // link to Sale, Purchase, Expense, etc.
  method: { 
    type: String, 
    enum: ['cash', 'bank', 'mpesa', 'airtel', 'mixx', 'halo'], 
    required: true 
  },
  amount: { type: Number, required: true },
  note: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
