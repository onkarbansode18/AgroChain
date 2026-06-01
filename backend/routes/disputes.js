const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Dispute = require('../models/Dispute');
const Produce = require('../models/Produce');
const User = require('../models/User');

// @route   POST /api/disputes
// @desc    Raise a new dispute
router.post('/', protect, [
  body('produceId').notEmpty().withMessage('Produce ID is required'),
  body('type').isIn(['quality_issue', 'price_dispute', 'delivery_issue', 'fake_certification', 'quantity_mismatch', 'other']).withMessage('Invalid dispute type'),
  body('description').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { produceId, type, description, against, evidence } = req.body;

    const produce = await Produce.findOne({ produceId });
    if (!produce) return res.status(404).json({ message: 'Produce not found' });

    const dispute = await Dispute.create({
      produceId,
      produce: produce._id,
      raisedBy: req.user._id,
      against: against || undefined,
      type,
      description,
      evidence: evidence || []
    });

    res.status(201).json({ dispute, message: 'Dispute raised successfully. Admin will review it.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/disputes/my
// @desc    Get disputes raised by current user
router.get('/my', protect, async (req, res) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user._id })
      .populate('produce', 'produceId cropType')
      .populate('against', 'name role')
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/disputes (admin)
// @desc    Get all disputes
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const disputes = await Dispute.find(filter)
      .populate('raisedBy', 'name email role')
      .populate('against', 'name email role')
      .populate('produce', 'produceId cropType')
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/disputes/:id/resolve (admin)
// @desc    Resolve a dispute
router.put('/:id/resolve', protect, authorize('admin'), [
  body('resolution').notEmpty().withMessage('Resolution details are required'),
  body('status').isIn(['resolved', 'rejected']).withMessage('Status must be resolved or rejected'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const dispute = await Dispute.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
      resolution: req.body.resolution,
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    }, { new: true })
      .populate('raisedBy', 'name email')
      .populate('against', 'name email');

    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    res.json({ dispute, message: `Dispute ${req.body.status} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
