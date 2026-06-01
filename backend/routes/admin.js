const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Produce = require('../models/Produce');
const SupplyTransaction = require('../models/SupplyTransaction');
const { agroChain } = require('../blockchain/blockchain');

// @route   GET /api/admin/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const farmers = await User.countDocuments({ role: 'farmer' });
    const distributors = await User.countDocuments({ role: 'distributor' });
    const retailers = await User.countDocuments({ role: 'retailer' });
    const consumers = await User.countDocuments({ role: 'consumer' });
    const totalProduce = await Produce.countDocuments();
    const totalTransactions = await SupplyTransaction.countDocuments();
    const chainStats = agroChain.getChainStats();

    res.json({
      users: { total: totalUsers, farmers, distributors, retailers, consumers },
      produce: { total: totalProduce },
      transactions: { total: totalTransactions },
      blockchain: chainStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/verify/:userId
router.put('/verify/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { isVerified: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/blockchain
router.get('/blockchain', protect, authorize('admin'), async (req, res) => {
  try {
    const chain = agroChain.getFullChain();
    const validity = agroChain.isChainValid();
    res.json({ chain, validity, stats: agroChain.getChainStats() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/transactions
router.get('/transactions', protect, authorize('admin'), async (req, res) => {
  try {
    const transactions = await SupplyTransaction.find()
      .populate('from', 'name role').populate('to', 'name role')
      .populate('produce', 'produceId cropType').sort({ createdAt: -1 }).limit(100);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/produce
router.get('/produce', protect, authorize('admin'), async (req, res) => {
  try {
    const produce = await Produce.find()
      .populate('farmer', 'name farmName').populate('currentOwner', 'name role')
      .sort({ createdAt: -1 });
    res.json(produce);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
