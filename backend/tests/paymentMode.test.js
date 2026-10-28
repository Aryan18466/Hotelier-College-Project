jest.mock('../models/Booking', () => ({ findById: jest.fn() }));
jest.mock('../models/Room', () => ({}));
jest.mock('../models/Hotel', () => ({}));
jest.mock('../models/Payment', () => ({ create: jest.fn() }));
jest.mock('../models/Notification', () => ({ create: jest.fn() }));
jest.mock('../services/paymentService', () => ({
  createOrder: jest.fn(),
  verifyPaymentSignature: jest.fn(),
  getRazorpayInstance: jest.fn(() => null),
}));
jest.mock('../services/bookingService', () => ({ checkRoomAvailability: jest.fn() }));
jest.mock('../services/emailService', () => ({ sendEmail: jest.fn(() => Promise.resolve()), templates: { bookingConfirmation: jest.fn() } }));
jest.mock('../services/auditService', () => ({ logAudit: jest.fn() }));

const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { checkRoomAvailability } = require('../services/bookingService');
const { processTestPayment } = require('../controllers/paymentController');
const { isDemoPaymentEnabled, requireDemoPaymentMode } = require('../config/paymentMode');

const originalNodeEnv = process.env.NODE_ENV;
const originalDemoPaymentMode = process.env.DEMO_PAYMENT_MODE;

const restoreEnvironment = () => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;

  if (originalDemoPaymentMode === undefined) delete process.env.DEMO_PAYMENT_MODE;
  else process.env.DEMO_PAYMENT_MODE = originalDemoPaymentMode;
};

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

const mockBookingQuery = (booking) => {
  const query = { populate: jest.fn() };
  query.populate.mockReturnValue(query);
  Booking.findById.mockReturnValue(query);
  query.then = (resolve) => Promise.resolve(booking).then(resolve);
};

afterEach(() => {
  restoreEnvironment();
  jest.clearAllMocks();
});

describe('demo payment mode', () => {
  test('is disabled unless explicitly enabled outside production', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.DEMO_PAYMENT_MODE;
    expect(isDemoPaymentEnabled()).toBe(false);

    process.env.DEMO_PAYMENT_MODE = 'true';
    expect(isDemoPaymentEnabled()).toBe(true);
  });

  test('is rejected in production even when the opt-in is enabled', () => {
    process.env.NODE_ENV = 'production';
    process.env.DEMO_PAYMENT_MODE = 'true';
    const response = createResponse();
    const next = jest.fn();

    requireDemoPaymentMode({}, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
  });

  test('records a demo payment only for an owned pending unpaid booking in enabled demo mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DEMO_PAYMENT_MODE = 'true';
    const booking = {
      _id: 'booking-1',
      userId: 'guest-1',
      roomId: { _id: 'room-1' },
      hotelId: { name: 'Demo Hotel' },
      checkIn: new Date('2030-01-01'),
      checkOut: new Date('2030-01-02'),
      bookingReference: 'HP-DEMO01',
      guestDetails: { email: 'guest@example.com' },
      pricing: { totalAmount: 1000 },
      bookingStatus: 'pending',
      paymentStatus: 'unpaid',
      save: jest.fn(),
    };
    mockBookingQuery(booking);
    checkRoomAvailability.mockResolvedValue({ isAvailable: true });
    Payment.create.mockResolvedValue({ _id: 'payment-1', amount: 1000 });
    Notification.create.mockResolvedValue({});
    const response = createResponse();

    await processTestPayment({ body: { bookingId: 'booking-1' }, user: { _id: 'guest-1', role: 'guest' } }, response, jest.fn());

    expect(Payment.create).toHaveBeenCalledWith(expect.objectContaining({ provider: 'test_mode', status: 'captured' }));
    expect(booking.save).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('rejects a demo payment attempt for another guest booking', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DEMO_PAYMENT_MODE = 'true';
    mockBookingQuery({ _id: 'booking-1', userId: 'guest-2' });
    const response = createResponse();

    await processTestPayment({ body: { bookingId: 'booking-1' }, user: { _id: 'guest-1', role: 'guest' } }, response, jest.fn());

    expect(Payment.create).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
  });
});
