// server/src/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  baseUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true }, // smallest unit
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
