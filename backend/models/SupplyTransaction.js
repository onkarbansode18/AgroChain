const mongoose = require('mongoose');

const supplyTransactionSchema = new mongoose.Schema({
  produce: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
  produceId: { type: String, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromRole: String,
  toRole: String,
  quantity: Number,
  unit: String,
  price: Number,
  totalAmount: Number,
  transactionType: {
    type: String,
    enum: ['purchase', 'transport', 'delivery', 'retail_sale'],
    required: true
  },
  // Transport details
  transport: {
    vehicleType: String,
    vehicleNumber: String,
    origin: String,
    destination: String,
    temperature: String,
    humidity: String,
    departureTime: Date,
    arrivalTime: Date
  },
  // Blockchain reference
  blockchainTxId: String,
  blockHash: String,
  blockIndex: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupplyTransaction', supplyTransactionSchema);
