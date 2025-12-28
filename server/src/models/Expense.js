// server/src/models/Expense.js
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., Rent, Utilities, Transport
  amount: { type: Number, required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true }, // links to Payment
  date: { type: Date, default: Date.now },
  note: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
