// server/src/models/Location.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['shop', 'warehouse', 'branch'], default: 'shop' },
  active: { type: Boolean, default: true },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Location', LocationSchema);