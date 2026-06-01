const express = require('express');
const router = express.Router();
const Produce = require('../models/Produce');
const SupplyTransaction = require('../models/SupplyTransaction');
const { traceProduceJourney } = require('../blockchain/smartContracts');
const { agroChain } = require('../blockchain/blockchain');

// @route   GET /api/consumer/trace/:produceId
// @desc    Trace produce journey (PUBLIC - no auth needed)
router.get('/trace/:produceId', async (req, res) => {
  try {
    const { produceId } = req.params;
    const produce = await Produce.findOne({ produceId })
      .populate('farmer', 'name farmName farmLocation')
      .populate('currentOwner', 'name businessName role');

    if (!produce) {
      return res.status(404).json({ message: 'Produce not found. Please check the produce ID.' });
    }

    // Get blockchain journey
    const blockchainJourney = traceProduceJourney(produceId);

    // Get supply chain transactions
    const transactions = await SupplyTransaction.find({ produceId })
      .populate('from', 'name role businessName farmName')
      .populate('to', 'name role businessName farmName')
      .sort({ createdAt: 1 });

    // Build price chain
    const priceChain = produce.priceHistory.map(ph => ({
      price: ph.price,
      role: ph.role,
      timestamp: ph.timestamp
    }));

    const farmerPrice = priceChain.length > 0 ? priceChain[0].price : 0;
    const currentPrice = priceChain.length > 0 ? priceChain[priceChain.length - 1].price : 0;
    const totalMarkup = farmerPrice > 0 ? (((currentPrice - farmerPrice) / farmerPrice) * 100).toFixed(1) : 0;

    res.json({
      produce: {
        produceId: produce.produceId,
        cropType: produce.cropType,
        variety: produce.variety,
        quantity: produce.quantity,
        unit: produce.unit,
        qualityGrade: produce.qualityGrade,
        harvestDate: produce.harvestDate,
        farmLocation: produce.farmLocation,
        certifications: produce.certifications,
        status: produce.status,
        description: produce.description
      },
      farmer: produce.farmer,
      currentOwner: produce.currentOwner,
      priceChain,
      priceAnalysis: { farmerPrice, currentPrice, totalMarkup: parseFloat(totalMarkup) },
      supplyChain: transactions,
      blockchain: blockchainJourney,
      qrCode: produce.qrCode,
      verified: agroChain.isChainValid().valid
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/consumer/verify/:produceId
// @desc    Verify blockchain integrity for a produce
router.get('/verify/:produceId', async (req, res) => {
  try {
    const chainValidity = agroChain.isChainValid();
    const journey = traceProduceJourney(req.params.produceId);

    res.json({
      chainValid: chainValidity.valid,
      produceId: req.params.produceId,
      totalBlockchainRecords: journey.totalSteps,
      verified: chainValidity.valid && journey.totalSteps > 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
