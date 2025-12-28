// server/src/models/Role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Admin, Seller, Manager
  permissions: {
    type: [String],
    default: [] // e.g., ["manage_users", "view_reports"]
  },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);