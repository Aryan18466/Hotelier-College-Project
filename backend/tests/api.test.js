const request = require('supertest');
const mongoose = require('mongoose');
const originalDemoPaymentMode = process.env.DEMO_PAYMENT_MODE;
process.env.DEMO_PAYMENT_MODE = 'true';
const app = require('../index');

describe('HotelPro Backend API Suite', () => {
  let guestToken;
  let adminToken;
  let sampleRoomId;
  let sampleBookingId;

  beforeAll(async () => {
    // Ensure DB is connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (originalDemoPaymentMode === undefined) {
      delete process.env.DEMO_PAYMENT_MODE;
    } else {
      process.env.DEMO_PAYMENT_MODE = originalDemoPaymentMode;
    }
  });

  // 1. Health Check Test
  test('GET /api/health should return status online', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.service).toBe('HotelPro API Server');
  });

  // 2. Auth: Guest Login
  test('POST /api/auth/login should authenticate valid guest credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'guest@hotelpro.com',
        password: 'Guest@123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('guest');
    guestToken = res.body.token;
  });

  // 3. Auth: Invalid credentials rejection
  test('POST /api/auth/login should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'guest@hotelpro.com',
        password: 'WrongPassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 4. Auth: Admin Login
  test('POST /api/auth/login should authenticate admin and provide role admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@hotelpro.com',
        password: 'Admin@123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  // 5. Protected Route & Role Authorization Check
  test('GET /api/admin/dashboard should reject guest token with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/admin/dashboard should allow admin token with 200 OK', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalRooms).toBeGreaterThan(0);
  });

  // 6. Public Room Search and Filtering
  test('GET /api/rooms should return list of active rooms', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    sampleRoomId = res.body.data[0]._id;
  });

  // 7. Room Details Endpoint
  test('GET /api/rooms/:id should return room details and review summary', async () => {
    const res = await request(app).get(`/api/rooms/${sampleRoomId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(sampleRoomId);
    expect(res.body.reviewStats).toBeDefined();
  });

  // 8. Room Availability Check
  test('GET /api/rooms/:id/availability with valid future dates', async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 30);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 33);

    const res = await request(app)
      .get(`/api/rooms/${sampleRoomId}/availability?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isAvailable).toBe(true);
  });

  // 9. Booking Creation Workflow
  test('POST /api/bookings should create a pending booking with calculated taxes and nights', async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 40);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 42);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: sampleRoomId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guestCount: { adults: 2, children: 0 },
        guestDetails: {
          name: 'Rohan Sharma',
          email: 'guest@hotelpro.com',
          phone: '+91 98765 00003',
          specialRequests: 'High floor preferred.',
        },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingStatus).toBe('pending');
    expect(res.body.data.pricing.nights).toBe(2);
    expect(res.body.data.pricing.taxAmount).toBeGreaterThan(0);
    expect(res.body.data.bookingReference).toMatch(/^HP-/);
    sampleBookingId = res.body.data._id;
  });

  // 10. Overlap Prevention: Double-booking test
  test('POST /api/bookings should reject overlapping dates for same room', async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 40);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 42);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: sampleRoomId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guestCount: { adults: 1, children: 0 },
        guestDetails: {
          name: 'Another Guest',
          email: 'another@example.com',
          phone: '+91 98765 11111',
        },
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // 11. Payment Workflow: Test Mode Payment
  test('POST /api/payments/test-payment should confirm reservation and mark payment as captured', async () => {
    const res = await request(app)
      .post('/api/payments/test-payment')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: sampleBookingId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingStatus).toBe('confirmed');
    expect(res.body.booking.paymentStatus).toBe('paid');
    expect(res.body.payment.provider).toBe('test_mode');
    expect(res.body.payment.status).toBe('captured');
  });

  // 12. Ownership Check: Guest cannot access someone else's booking invoice
  test('GET /api/bookings/:id should deny access to unauthorized guest', async () => {
    // Register another user
    const otherUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second Guest',
        email: `guest2_${Date.now()}@example.com`,
        password: 'Password@123',
      });

    const otherToken = otherUserRes.body.token;

    const res = await request(app)
      .get(`/api/bookings/${sampleBookingId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
