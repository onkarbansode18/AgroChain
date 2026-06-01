const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  produceId: { type: String, required: true },
  produce: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce' },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  against: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['quality_issue', 'price_dispute', 'delivery_issue', 'fake_certification', 'quantity_mismatch', 'other'],
    required: true
  },
  description: { type: String, required: true },
  evidence: [String], // image URLs or base64
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'rejected'],
    default: 'open'
  },
  resolution: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  blockchainTxId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dispute', disputeSchema);
