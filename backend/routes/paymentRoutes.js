const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  processTestPayment,
  getPaymentMode,
  getPaymentByBooking,
  getAllPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { requireDemoPaymentMode } = require('../config/paymentMode');

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/test-payment', protect, requireDemoPaymentMode, processTestPayment);
router.get('/mode', protect, getPaymentMode);
router.get('/booking/:bookingId', protect, getPaymentByBooking);
router.get('/', protect, authorize('admin'), getAllPayments);

module.exports = router;
