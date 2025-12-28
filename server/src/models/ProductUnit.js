// server/src/models/ProductUnit.js
const mongoose = require('mongoose');

const ProductUnitSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  multiplier: { type: Number, required: true, default: 1 } 
  // Example: 1 Crate = 24 bottles → multiplier = 24
}, { timestamps: true });

module.exports = mongoose.model('ProductUnit', ProductUnitSchema);
