const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const { protect, authorize } = require('../middleware/auth');
const Produce = require('../models/Produce');
const SupplyTransaction = require('../models/SupplyTransaction');
const { registerProduce } = require('../blockchain/smartContracts');

// @route   POST /api/farmer/produce
// @desc    Register new produce with validation
router.post('/produce', protect, authorize('farmer'), [
  body('cropType').trim().notEmpty().withMessage('Crop type is required'),
  body('quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be greater than 0'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('harvestDate').notEmpty().withMessage('Harvest date is required'),
  body('farmLocation').trim().notEmpty().withMessage('Farm location is required'),
  body('qualityGrade').isIn(['A+', 'A', 'B', 'C']).withMessage('Invalid quality grade'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { cropType, variety, quantity, unit, qualityGrade, harvestDate, farmLocation, price, description, certifications, gpsCoordinates } = req.body;

    const produceId = 'PRD-' + uuidv4().substring(0, 8).toUpperCase();

    // Record on blockchain
    const { transaction, block } = registerProduce(req.user.blockchainAddress, {
      produceId, cropType, quantity, unit: unit || 'kg', qualityGrade,
      harvestDate, farmLocation: farmLocation || req.user.farmLocation,
      farmerName: req.user.name, price, certifications, description
    });

    // Generate QR code with trace URL
    const traceUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trace/${produceId}`;
    const qrData = JSON.stringify({ produceId, type: 'agrochain-produce', url: traceUrl });
    const qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2, color: { dark: '#10b981', light: '#0a0f1a' } });

    // Save to database
    const produce = await Produce.create({
      produceId, farmer: req.user._id, cropType, variety,
      quantity, unit: unit || 'kg', qualityGrade, harvestDate,
      farmLocation: farmLocation || req.user.farmLocation,
      price, description, certifications: certifications || [],
      currentOwner: req.user._id, currentOwnerRole: 'farmer',
      priceHistory: [{ price, setBy: req.user._id, role: 'farmer' }],
      blockchainTxIds: [transaction.id],
      registrationBlockHash: block.hash, qrCode
    });

    // Send notification email (async, don't block response)
    const { sendTransactionEmail } = require('../utils/email');
    sendTransactionEmail(req.user.email, req.user.name, {
      type: 'Produce Registered',
      message: 'Your produce has been successfully registered on the AgroChain blockchain.',
      cropType, produceId, quantity, unit: unit || 'kg', price,
      blockHash: block.hash
    }).catch(() => {});

    res.status(201).json({
      produce,
      blockchain: {
        transactionId: transaction.id, transactionHash: transaction.hash,
        blockHash: block.hash, blockIndex: block.index
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/farmer/produce
router.get('/produce', protect, authorize('farmer'), async (req, res) => {
  try {
    const { status, sort } = req.query;
    const filter = { farmer: req.user._id };
    if (status) filter.status = status;
    const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const produce = await Produce.find(filter).sort(sortOrder);
    res.json(produce);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/farmer/transactions
router.get('/transactions', protect, authorize('farmer'), async (req, res) => {
  try {
    const transactions = await SupplyTransaction.find({
      $or: [{ from: req.user._id }, { to: req.user._id }]
    }).populate('produce from to').sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/farmer/stats
router.get('/stats', protect, authorize('farmer'), async (req, res) => {
  try {
    const totalProduce = await Produce.countDocuments({ farmer: req.user._id });
    const activeProduce = await Produce.countDocuments({ farmer: req.user._id, status: 'registered' });
    const soldProduce = await Produce.countDocuments({ farmer: req.user._id, status: { $ne: 'registered' } });
    const transactions = await SupplyTransaction.find({ from: req.user._id });
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);

    // Monthly revenue breakdown
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await SupplyTransaction.aggregate([
      { $match: { from: req.user._id, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalProduce, activeProduce, soldProduce, totalRevenue,
      totalTransactions: transactions.length, monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
