const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { createOrder, verifyPaymentSignature, getRazorpayInstance } = require('../services/paymentService');
const { checkRoomAvailability } = require('../services/bookingService');
const { sendEmail, templates } = require('../services/emailService');
const { logAudit } = require('../services/auditService');
const { isDemoPaymentEnabled } = require('../config/paymentMode');

// @desc    Get the checkout modes explicitly enabled by the backend
// @route   GET /api/payments/mode
// @access  Private
exports.getPaymentMode = (req, res) => {
  const demoEnabled = isDemoPaymentEnabled();
  const razorpayEnabled = Boolean(getRazorpayInstance());

  res.status(200).json({
    success: true,
    demoEnabled,
    razorpayEnabled,
  });
};

// @desc    Initiate payment order for a pending reservation
// @route   POST /api/payments/create-order
// @access  Private (Guest)
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Please provide bookingId' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Ownership check
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: not your reservation' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Reservation has already been paid for' });
    }

    // Re-verify room availability prior to taking payment to prevent race conditions
    const availability = await checkRoomAvailability(
      booking.roomId,
      booking.checkIn,
      booking.checkOut,
      booking._id
    );

    if (!availability.isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Room is no longer available for these dates. Booking cannot be confirmed.',
      });
    }

    const orderData = await createOrder({
      amount: booking.pricing.totalAmount,
      currency: 'INR',
      receipt: booking.bookingReference,
      notes: {
        bookingId: booking._id.toString(),
        bookingReference: booking.bookingReference,
        guestEmail: booking.guestDetails.email,
      },
    });

    res.status(200).json({
      success: true,
      booking: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        totalAmount: booking.pricing.totalAmount,
        currency: 'INR',
      },
      ...orderData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and finalize booking confirmation
// @route   POST /api/payments/verify
// @access  Private (Guest)
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment parameters for verification',
      });
    }

    const booking = await Booking.findById(bookingId).populate('hotelId').populate('roomId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: not your reservation' });
    }

    // Check if already paid to prevent duplicate webhook/callback race condition
    if (booking.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment was already verified and booking is confirmed.',
        booking,
      });
    }

    // Verify cryptographic signature
    const verification = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature.',
      });
    }

    // Record Payment
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user._id,
      provider: verification.provider || 'razorpay',
      providerOrderId: razorpay_order_id,
      providerPaymentId: razorpay_payment_id,
      providerSignature: razorpay_signature || '',
      amount: booking.pricing.totalAmount,
      currency: 'INR',
      status: 'captured',
    });

    // Update Booking status atomically
    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    await booking.save();

    // Create In-App Notification
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Confirmed!',
      message: `Your reservation #${booking.bookingReference} at ${booking.hotelId.name} is confirmed!`,
      type: 'payment',
      link: `/bookings/${booking._id}`,
    });

    // Send Confirmation Emails
    const bookingEmail = templates.bookingConfirmation(booking, booking.hotelId, booking.roomId);
    sendEmail({ to: booking.guestDetails.email, ...bookingEmail }).catch(() => {});

    const paymentEmail = templates.paymentConfirmation(booking, payment);
    sendEmail({ to: booking.guestDetails.email, ...paymentEmail }).catch(() => {});

    await logAudit({
      actorId: req.user._id,
      action: 'PAYMENT_CAPTURED',
      entityType: 'Payment',
      entityId: payment._id,
      details: {
        bookingReference: booking.bookingReference,
        amount: payment.amount,
        paymentId: razorpay_payment_id,
      },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Your booking is confirmed!',
      booking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test-Mode simulated payment for development / sandbox verification
// @route   POST /api/payments/test-payment
// @access  Private (Guest)
exports.processTestPayment = async (req, res, next) => {
  try {
    if (!isDemoPaymentEnabled()) {
      return res.status(403).json({
        success: false,
        message: 'Demo payments are disabled. Configure a Razorpay gateway to complete this payment.',
      });
    }

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Please provide bookingId' });
    }

    const booking = await Booking.findById(bookingId).populate('hotelId').populate('roomId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: not your reservation' });
    }

    if (booking.bookingStatus !== 'pending' || booking.paymentStatus !== 'unpaid') {
      return res.status(400).json({
        success: false,
        message: 'Only pending reservations with an unpaid balance are eligible for demo payment.',
      });
    }

    const availability = await checkRoomAvailability(
      booking.roomId._id || booking.roomId,
      booking.checkIn,
      booking.checkOut,
      booking._id
    );

    if (!availability.isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Room is no longer available for these dates. Booking cannot be confirmed.',
      });
    }

    const testPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const testOrderId = `order_test_${Date.now()}`;

    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user._id,
      provider: 'test_mode',
      providerOrderId: testOrderId,
      providerPaymentId: testPaymentId,
      providerSignature: 'test_signature_valid',
      amount: booking.pricing.totalAmount,
      currency: 'INR',
      status: 'captured',
      metadata: {
        note: 'Completed via HotelPro Test Payment Gateway (Sandbox Mode)',
      },
    });

    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    await booking.save();

    await Notification.create({
      userId: booking.userId,
      title: 'Booking Confirmed (Demo Mode)',
      message: `Your reservation #${booking.bookingReference} is confirmed via Demo Mode. No real payment was processed.`,
      type: 'payment',
      link: `/bookings/${booking._id}`,
    });

    const bookingEmail = templates.bookingConfirmation(booking, booking.hotelId, booking.roomId);
    sendEmail({ to: booking.guestDetails.email, ...bookingEmail }).catch(() => {});

    await logAudit({
      actorId: req.user._id,
      action: 'PAYMENT_CAPTURED_TEST_MODE',
      entityType: 'Payment',
      entityId: payment._id,
      details: { bookingReference: booking.bookingReference, amount: payment.amount },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Demo payment processed. Reservation confirmed; no real payment was processed.',
      paymentMode: 'demo',
      booking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment invoice details by booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Private
exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('hotelId')
      .populate({
        path: 'roomId',
        populate: { path: 'categoryId' },
      })
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Ownership check
    if (req.user.role === 'guest' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: not your invoice' });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });

    res.status(200).json({
      success: true,
      booking,
      payment: payment || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, provider, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (provider) query.provider = provider;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate('bookingId', 'bookingReference checkIn checkOut')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
