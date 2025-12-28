// server/src/models/StockBalance.js
const mongoose = require('mongoose');

const StockBalanceSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, default: 0 }, // stored in base unit
}, { timestamps: true });

// Ensure one record per product per location
StockBalanceSchema.index({ product: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('StockBalance', StockBalanceSchema);
