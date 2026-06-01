const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Produce = require('../models/Produce');
const SupplyTransaction = require('../models/SupplyTransaction');
const User = require('../models/User');
const { transferOwnership, updateTransport } = require('../blockchain/smartContracts');

// @route   GET /api/distributor/available
// @desc    Get available produce from farmers
router.get('/available', protect, authorize('distributor'), async (req, res) => {
  try {
    const produce = await Produce.find({ status: 'registered' })
      .populate('farmer', 'name farmName farmLocation blockchainAddress')
      .sort({ createdAt: -1 });
    res.json(produce);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/distributor/purchase
// @desc    Purchase produce from farmer
router.post('/purchase', protect, authorize('distributor'), async (req, res) => {
  try {
    const { produceId, quantity, purchasePrice, notes } = req.body;

    const produce = await Produce.findOne({ produceId }).populate('farmer', 'name blockchainAddress');
    if (!produce) {
      return res.status(404).json({ message: 'Produce not found' });
    }
    if (produce.status !== 'registered') {
      return res.status(400).json({ message: 'Produce is not available for purchase' });
    }

    // Record on blockchain
    const { transaction, block } = transferOwnership(
      produce.farmer.blockchainAddress,
      req.user.blockchainAddress,
      {
        produceId,
        quantity: quantity || produce.quantity,
        unit: produce.unit,
        purchasePrice,
        previousPrice: produce.price,
        senderName: produce.farmer.name,
        receiverName: req.user.name,
        senderRole: 'farmer',
        receiverRole: 'distributor'
      }
    );

    // Update produce
    produce.status = 'with_distributor';
    produce.currentOwner = req.user._id;
    produce.currentOwnerRole = 'distributor';
    produce.priceHistory.push({ price: purchasePrice, setBy: req.user._id, role: 'distributor' });
    produce.blockchainTxIds.push(transaction.id);
    await produce.save();

    // Create supply transaction
    const supplyTx = await SupplyTransaction.create({
      produce: produce._id,
      produceId,
      from: produce.farmer._id,
      to: req.user._id,
      fromRole: 'farmer',
      toRole: 'distributor',
      quantity: quantity || produce.quantity,
      unit: produce.unit,
      price: purchasePrice,
      totalAmount: purchasePrice * (quantity || produce.quantity),
      transactionType: 'purchase',
      blockchainTxId: transaction.id,
      blockHash: block.hash,
      blockIndex: block.index,
      notes
    });

    res.status(201).json({
      transaction: supplyTx,
      blockchain: {
        transactionId: transaction.id,
        transactionHash: transaction.hash,
        blockHash: block.hash,
        blockIndex: block.index
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/distributor/transport
// @desc    Add transport details
router.post('/transport', protect, authorize('distributor'), async (req, res) => {
  try {
    const { produceId, vehicleType, vehicleNumber, origin, destination, temperature, humidity, departureTime, estimatedArrival } = req.body;

    const produce = await Produce.findOne({ produceId });
    if (!produce) {
      return res.status(404).json({ message: 'Produce not found' });
    }

    // Record on blockchain
    const { transaction, block } = updateTransport(req.user.blockchainAddress, {
      produceId,
      vehicleType,
      vehicleNumber,
      origin,
      destination,
      temperature,
      humidity,
      departureTime,
      estimatedArrival,
      transporterName: req.user.name
    });

    produce.status = 'in_transit';
    produce.blockchainTxIds.push(transaction.id);
    await produce.save();

    // Create transport transaction
    const supplyTx = await SupplyTransaction.create({
      produce: produce._id,
      produceId,
      from: req.user._id,
      to: req.user._id,
      fromRole: 'distributor',
      toRole: 'distributor',
      quantity: produce.quantity,
      unit: produce.unit,
      transactionType: 'transport',
      transport: { vehicleType, vehicleNumber, origin, destination, temperature, humidity, departureTime, estimatedArrival },
      blockchainTxId: transaction.id,
      blockHash: block.hash,
      blockIndex: block.index
    });

    res.status(201).json({
      transaction: supplyTx,
      blockchain: {
        transactionId: transaction.id,
        transactionHash: transaction.hash,
        blockHash: block.hash,
        blockIndex: block.index
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/distributor/inventory
// @desc    Get distributor's inventory
router.get('/inventory', protect, authorize('distributor'), async (req, res) => {
  try {
    const inventory = await Produce.find({
      currentOwner: req.user._id,
      status: { $in: ['with_distributor', 'in_transit'] }
    }).populate('farmer', 'name farmName farmLocation').sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/distributor/transactions
router.get('/transactions', protect, authorize('distributor'), async (req, res) => {
  try {
    const transactions = await SupplyTransaction.find({
      $or: [{ from: req.user._id }, { to: req.user._id }]
    }).populate('produce from to').sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/distributor/stats
router.get('/stats', protect, authorize('distributor'), async (req, res) => {
  try {
    const totalInventory = await Produce.countDocuments({ currentOwner: req.user._id });
    const inTransit = await Produce.countDocuments({ currentOwner: req.user._id, status: 'in_transit' });
    const transactions = await SupplyTransaction.find({
      $or: [{ from: req.user._id }, { to: req.user._id }]
    });
    const totalSpent = transactions
      .filter(tx => tx.toRole === 'distributor' && tx.transactionType === 'purchase')
      .reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);

    res.json({
      totalInventory,
      inTransit,
      totalTransactions: transactions.length,
      totalSpent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
