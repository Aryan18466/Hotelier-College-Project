const crypto = require('crypto');
const Razorpay = require('razorpay');
const { isDemoPaymentEnabled } = require('../config/paymentMode');

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret && !keyId.includes('placeholder') && !keySecret.includes('placeholder')) {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return null;
};

const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const razorpay = getRazorpayInstance();

  if (razorpay) {
    // Razorpay amounts are in smallest currency unit (paise)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes,
    };
    const order = await razorpay.orders.create(options);
    return {
      success: true,
      mode: 'razorpay_live_or_test',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  if (isDemoPaymentEnabled()) {
    const testOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      mode: 'demo',
      orderId: testOrderId,
      amount: Math.round(amount * 100),
      currency,
      testNotice: 'Demo payment mode is enabled. No real transaction occurs.',
    };
  }

  const error = new Error('Razorpay is not configured and demo payments are disabled.');
  error.statusCode = 503;
  throw error;
};

const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const razorpay = getRazorpayInstance();

  if (razorpay && keySecret && !keySecret.includes('placeholder')) {
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return {
      isValid: generatedSignature === signature,
      provider: 'razorpay',
    };
  }

  // Demo signatures are accepted only when explicitly enabled outside production.
  if (
    isDemoPaymentEnabled() &&
    orderId &&
    paymentId &&
    orderId.startsWith('order_test_') &&
    paymentId.startsWith('pay_test_')
  ) {
    return {
      isValid: true,
      provider: 'test_mode',
    };
  }

  return {
    isValid: false,
    provider: 'unknown',
    error: 'Invalid payment signature or unsupported provider',
  };
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  getRazorpayInstance,
};
