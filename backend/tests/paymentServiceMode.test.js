jest.mock('razorpay', () => jest.fn());

const { verifyPaymentSignature } = require('../services/paymentService');

const originalNodeEnv = process.env.NODE_ENV;
const originalDemoPaymentMode = process.env.DEMO_PAYMENT_MODE;
const originalKeyId = process.env.RAZORPAY_KEY_ID;
const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalDemoPaymentMode === undefined) delete process.env.DEMO_PAYMENT_MODE;
  else process.env.DEMO_PAYMENT_MODE = originalDemoPaymentMode;
  if (originalKeyId === undefined) delete process.env.RAZORPAY_KEY_ID;
  else process.env.RAZORPAY_KEY_ID = originalKeyId;
  if (originalKeySecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
  else process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
});

describe('demo payment signature handling', () => {
  test('rejects demo-style identifiers unless demo mode is explicitly enabled', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.DEMO_PAYMENT_MODE;
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    expect(verifyPaymentSignature({ orderId: 'order_test_1', paymentId: 'pay_test_1' }).isValid).toBe(false);
  });

  test('accepts demo-style identifiers only in explicitly enabled non-production mode', () => {
    process.env.NODE_ENV = 'development';
    process.env.DEMO_PAYMENT_MODE = 'true';
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    expect(verifyPaymentSignature({ orderId: 'order_test_1', paymentId: 'pay_test_1' })).toMatchObject({
      isValid: true,
      provider: 'test_mode',
    });
  });

  test('rejects demo-style identifiers in production even when opted in', () => {
    process.env.NODE_ENV = 'production';
    process.env.DEMO_PAYMENT_MODE = 'true';
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    expect(verifyPaymentSignature({ orderId: 'order_test_1', paymentId: 'pay_test_1' }).isValid).toBe(false);
  });
});
