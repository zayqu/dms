const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const tenantGuard = require('../middleware/tenantGuard');
const requireRole = require('../middleware/requireRole');

const Sale = require('../models/Sale');
const Payment = require('../models/Payment');

/**
 * Record payment for a sale
 * POST /api/payments
 */
router.post(
  '/',
  auth,
  tenantGuard,
  requireRole(['owner', 'admin', 'seller']),
  async (req, res) => {
    try {
      const { saleId, amount, method, reference, receiptUrl } = req.body;

      if (!saleId || !amount || !method) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const sale = await Sale.findOne({ _id: saleId, tenantId: req.tenantId });
      if (!sale) return res.status(404).json({ error: 'Sale not found' });

      sale.paidAmount = (sale.paidAmount || 0) + Number(amount);
      sale.balance = sale.total - sale.paidAmount;
      await sale.save();

      const payment = await Payment.create({
        tenantId: req.tenantId,
        saleId,
        amount,
        method,
        reference,
        receiptUrl,
        createdBy: req.userId
      });

      res.status(201).json({
        message: 'Payment recorded',
        payment,
        sale
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
  requireRole(['owner', 'admin']),
  async (req, res) => {
    const list = await Payment.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 });
    res.json(list);
  }
);

module.exports = router;
