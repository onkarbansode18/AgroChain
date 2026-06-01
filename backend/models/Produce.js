const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
  produceId: { type: String, required: true, unique: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropType: { type: String, required: true },
  variety: String,
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  qualityGrade: { type: String, enum: ['A+', 'A', 'B', 'C'], default: 'A' },
  harvestDate: { type: Date, required: true },
  farmLocation: { type: String, required: true },
  price: { type: Number, required: true }, // per unit
  description: String,
  certifications: [String],
  status: {
    type: String,
    enum: ['registered', 'with_distributor', 'in_transit', 'with_retailer', 'sold'],
    default: 'registered'
  },
  currentOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentOwnerRole: { type: String, default: 'farmer' },
  // Price chain for transparency
  priceHistory: [{
    price: Number,
    setBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    timestamp: { type: Date, default: Date.now }
  }],
  // Blockchain references
  blockchainTxIds: [String],
  registrationBlockHash: String,
  // QR Code
  qrCode: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

produceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Produce', produceSchema);
