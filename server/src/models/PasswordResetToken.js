const mongoose = require('mongoose');
const S = mongoose.Schema;
const PasswordResetTokenSchema = new S({
  userId: { type: S.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);