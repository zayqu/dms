// server/src/models/SaleItem.js
const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  quantity: { type: Number, required: true }, // in selected unit
  baseQuantity: { type: Number, required: true }, // converted to base unit
  price: { type: Number, required: true }, // selling price per unit
  cost: { type: Number, required: true }, // cost price per unit
  subtotal: { type: Number, required: true }, // quantity * price
}, { timestamps: true });

module.exports = mongoose.model('SaleItem', SaleItemSchema);
