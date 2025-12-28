const mongoose = require('mongoose');
const S = mongoose.Schema;

const SaleItemSchema = new S({
  productId: { type: S.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true }
});

const SaleSchema = new S(
  {
    tenantId: { type: S.Types.ObjectId, ref: 'Tenant', required: true },

    items: [SaleItemSchema],

    total: { type: Number, required: true },

    paidAmount: { type: Number, default: 0 },

    balance: { type: Number, default: 0 },

    isCredit: { type: Boolean, default: false },

    dueDate: { type: Date },

    customerName: { type: String },
    customerPhone: { type: String },

    paymentMethod: {
      type: String,
      enum: ['Cash', 'Mpesa', 'MixxByYas', 'AirtelMoney', 'HaloPesa', 'Bank', 'Other'],
      default: 'Cash'
    },

    reference: { type: String },

    status: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'paid'
    },

    createdBy: { type: S.Types.ObjectId, ref: 'User' },

    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

/**
 * Auto-calculate balance & status
 */
SaleSchema.pre('save', function (next) {
  this.balance = Number(this.total) - Number(this.paidAmount);

  if (this.balance <= 0) {
    this.status = 'paid';
    this.isCredit = false;
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
    this.isCredit = true;
  } else {
    this.status = 'unpaid';
    this.isCredit = true;
  }

  next();
});

module.exports = mongoose.model('Sale', SaleSchema);
