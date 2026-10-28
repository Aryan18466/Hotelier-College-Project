const isDemoPaymentEnabled = () =>
  ['development', 'test'].includes(process.env.NODE_ENV) && process.env.DEMO_PAYMENT_MODE === 'true';

const requireDemoPaymentMode = (req, res, next) => {
  if (!isDemoPaymentEnabled()) {
    return res.status(403).json({
      success: false,
      message: 'Demo payments are disabled. Configure a Razorpay gateway to complete this payment.',
    });
  }

  next();
};

module.exports = {
  isDemoPaymentEnabled,
  requireDemoPaymentMode,
};
