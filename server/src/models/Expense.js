const mongoose = require('mongoose');
const S = mongoose.Schema;
const ExpenseSchema = new S({
  tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  createdBy: { type: S.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('Expense', ExpenseSchema);