const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');

/**
 * Record payment for a transaction
 * POST /api/payments
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner','admin','seller']),
  async (req, res) => {
    try {
      const { transactionId, amount, method, reference, receiptUrl } = req.body;

      if (!transactionId || !amount || !method) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

      const paidAmount = transaction.paidAmount || 0;
      transaction.paidAmount = paidAmount + Number(amount);
      transaction.balance = transaction.total - transaction.paidAmount;
      await transaction.save();

      const payment = await Payment.create({
        tenantId: req.tenantId,
        transactionId,
        amount,
        method,
        reference,
        receiptUrl,
        createdBy: req.userId,
        date: new Date()
      });

      res.status(201).json({
        message: 'Payment recorded',
        payment,
        transaction
      });
    } catch (err) {
      console.error('payment error', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * List payments
 * GET /api/payments
 */
router.get(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner','admin']),
  async (req, res) => {
    const list = await Payment.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
    res.json(list);
  }
);

module.exports = router;
