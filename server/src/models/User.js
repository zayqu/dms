// server/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },

  phone: { 
    type: String, 
    required: true,
    trim: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },

  password: { 
    type: String, 
    required: true,
    select: false // IMPORTANT: never return password by default
  },

  role: {
  type: String,
  enum: ['owner', 'admin', 'staff', 'seller'],
  default: 'admin'
},

  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location'
  },

  status: { 
    type: String, 
    enum: ['active', 'disabled'], 
    default: 'active',
    index: true
  },

  trialExpiresAt: { 
    type: Date,
    default: () => {
      const now = new Date();
      now.setMonth(now.getMonth() + 3);
      return now;
    }
  }

}, { timestamps: true });

/* ===========================
   PASSWORD HASHING
=========================== */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/* ===========================
   METHODS
=========================== */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ===========================
   SAFE JSON OUTPUT
=========================== */
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);