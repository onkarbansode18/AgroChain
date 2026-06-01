const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { protect, authorize } = require('../middleware/auth');
const Produce = require('../models/Produce');
const SupplyTransaction = require('../models/SupplyTransaction');
const { transferOwnership } = require('../blockchain/smartContracts');

// @route   GET /api/retailer/available
router.get('/available', protect, authorize('retailer'), async (req, res) => {
  try {
    const produce = await Produce.find({ status: { $in: ['with_distributor', 'in_transit'] } })
      .populate('farmer', 'name farmName farmLocation')
      .populate('currentOwner', 'name businessName blockchainAddress')
      .sort({ createdAt: -1 });
    res.json(produce);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/retailer/purchase
router.post('/purchase', protect, authorize('retailer'), async (req, res) => {
  try {
    const { produceId, retailPrice, notes } = req.body;
    const produce = await Produce.findOne({ produceId }).populate('currentOwner', 'name blockchainAddress');
    if (!produce) return res.status(404).json({ message: 'Produce not found' });

    const currentPrice = produce.priceHistory[produce.priceHistory.length - 1].price;
    const { transaction, block } = transferOwnership(
      produce.currentOwner.blockchainAddress, req.user.blockchainAddress,
      { produceId, quantity: produce.quantity, unit: produce.unit, purchasePrice: retailPrice, previousPrice: currentPrice, senderName: produce.currentOwner.name, receiverName: req.user.name, senderRole: 'distributor', receiverRole: 'retailer' }
    );

    const previousOwner = produce.currentOwner._id;
    produce.status = 'with_retailer';
    produce.currentOwner = req.user._id;
    produce.currentOwnerRole = 'retailer';
    produce.priceHistory.push({ price: retailPrice, setBy: req.user._id, role: 'retailer' });
    produce.blockchainTxIds.push(transaction.id);
    const qrData = JSON.stringify({ produceId, type: 'agrochain-produce', url: `/trace/${produceId}` });
    produce.qrCode = await QRCode.toDataURL(qrData);
    await produce.save();

    const supplyTx = await SupplyTransaction.create({
      produce: produce._id, produceId, from: previousOwner, to: req.user._id,
      fromRole: 'distributor', toRole: 'retailer', quantity: produce.quantity, unit: produce.unit,
      price: retailPrice, totalAmount: retailPrice * produce.quantity, transactionType: 'purchase',
      blockchainTxId: transaction.id, blockHash: block.hash, blockIndex: block.index, notes
    });

    res.status(201).json({ transaction: supplyTx, blockchain: { transactionId: transaction.id, transactionHash: transaction.hash, blockHash: block.hash, blockIndex: block.index } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/retailer/inventory
router.get('/inventory', protect, authorize('retailer'), async (req, res) => {
  try {
    const inventory = await Produce.find({ currentOwner: req.user._id, status: 'with_retailer' })
      .populate('farmer', 'name farmName farmLocation').sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/retailer/qr/:produceId
router.get('/qr/:produceId', protect, authorize('retailer'), async (req, res) => {
  try {
    const produce = await Produce.findOne({ produceId: req.params.produceId });
    if (!produce) return res.status(404).json({ message: 'Produce not found' });
    res.json({ qrCode: produce.qrCode, produceId: produce.produceId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/retailer/stats
router.get('/stats', protect, authorize('retailer'), async (req, res) => {
  try {
    const totalInventory = await Produce.countDocuments({ currentOwner: req.user._id });
    const transactions = await SupplyTransaction.find({ $or: [{ from: req.user._id }, { to: req.user._id }] });
    const totalSpent = transactions.filter(tx => tx.toRole === 'retailer').reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
    res.json({ totalInventory, totalTransactions: transactions.length, totalSpent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
