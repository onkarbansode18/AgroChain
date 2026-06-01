const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['farmer', 'distributor', 'retailer', 'consumer', 'admin'],
    required: true
  },
  phone: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  // GPS Location
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  // Farmer specific
  farmName: String,
  farmLocation: String,
  farmSize: String,
  farmType: { type: String, enum: ['organic', 'conventional', 'mixed'], default: 'conventional' },
  // Business specific
  businessName: String,
  licenseNumber: String,
  gstNumber: String,
  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  // Account verification by admin
  isVerified: { type: Boolean, default: false },
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Profile
  profileImage: String,
  // Blockchain
  blockchainAddress: { type: String, unique: true },
  // Activity tracking
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  // Account status
  isActive: { type: Boolean, default: true },
  deactivatedReason: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
  return resetToken;
};

// GeoJSON index for location-based queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
