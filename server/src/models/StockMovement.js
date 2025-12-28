// server/src/models/StockMovement.js
const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  quantityChange: { type: Number, required: true }, // + or -
  movementType: { 
    type: String, 
    enum: ['opening', 'purchase', 'sale', 'adjustment', 'transfer'], 
    required: true 
  },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // e.g., sale or purchase id
  note: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', StockMovementSchema);
