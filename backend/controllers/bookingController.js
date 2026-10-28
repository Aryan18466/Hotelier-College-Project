const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const HousekeepingTask = require('../models/HousekeepingTask');
const Notification = require('../models/Notification');
const { checkRoomAvailability, calculatePricing, generateBookingReference } = require('../services/bookingService');
const { sendEmail, templates } = require('../services/emailService');
const { logAudit } = require('../services/auditService');

// @desc    Create a new pending reservation
// @route   POST /api/bookings
// @access  Private (Guest/User)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guestCount = { adults: 1, children: 0 },
      guestDetails,
    } = req.body;

    if (!roomId || !checkIn || !checkOut || !guestDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomId, checkIn, checkOut, and guestDetails (name, email, phone)',
      });
    }

    const room = await Room.findById(roomId).populate('hotelId');
    if (!room || !room.isActive) {
      return res.status(404).json({ success: false, message: 'Room not found or inactive' });
    }

    // Capacity validation
    const totalGuests = (Number(guestCount.adults) || 1) + (Number(guestCount.children) || 0);
    const maxCapacity = room.capacity.adults + room.capacity.children;
    if (totalGuests > maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Total guests (${totalGuests}) exceeds room capacity (${maxCapacity})`,
      });
    }

    // Date Overlap Validation
    const availability = await checkRoomAvailability(roomId, checkIn, checkOut);
    if (!availability.isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'This room is not available for the requested dates due to a conflicting reservation.',
        conflictingBooking: availability.conflictingBooking,
      });
    }

    // Pricing calculation
    const pricing = calculatePricing(room, checkIn, checkOut);
    const bookingReference = generateBookingReference();

    const booking = await Booking.create({
      bookingReference,
      userId: req.user._id,
      hotelId: room.hotelId._id,
      roomId: room._id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestCount: {
        adults: Number(guestCount.adults) || 1,
        children: Number(guestCount.children) || 0,
      },
      guestDetails: {
        name: guestDetails.name || req.user.name,
        email: (guestDetails.email || req.user.email).toLowerCase(),
        phone: guestDetails.phone || req.user.phone || '',
        specialRequests: guestDetails.specialRequests || '',
      },
      pricing,
      bookingStatus: 'pending',
      paymentStatus: 'unpaid',
    });

    await logAudit({
      actorId: req.user._id,
      action: 'BOOKING_CREATE_PENDING',
      entityType: 'Booking',
      entityId: booking._id,
      details: { reference: booking.bookingReference, total: pricing.totalAmount },
      req,
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Pending reservation created. Please proceed to payment to confirm your stay.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private (Guest)
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user._id };

    if (status) {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('hotelId', 'name city address starRating contactDetails policies images')
      .populate('roomId', 'roomNumber floor price images amenities')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID (with ownership check)
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotelId')
      .populate({
        path: 'roomId',
        populate: { path: 'categoryId' },
      })
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Ownership check: Guests can only view their own bookings
    if (req.user.role === 'guest' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own reservations and invoices.',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Staff / Admin)
// @route   GET /api/bookings
// @access  Private (Staff / Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { hotelId, status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (hotelId) query.hotelId = hotelId;
    if (status) query.bookingStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'guestDetails.name': { $regex: search, $options: 'i' } },
        { 'guestDetails.email': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('hotelId', 'name city')
      .populate('roomId', 'roomNumber floor price')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking with cancellation policy
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Guest / Admin)
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by guest' } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('hotelId')
      .populate('roomId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Ownership check
    if (req.user.role === 'guest' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only cancel your own reservations.',
      });
    }

    if (['cancelled', 'checked_out'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel reservation in '${booking.bookingStatus}' status.`,
      });
    }

    // Check cancellation policy window
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const hoursToCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundAmount = 0;
    if (booking.paymentStatus === 'paid') {
      // Free cancellation up to 48 hours prior
      if (hoursToCheckIn >= 48) {
        refundAmount = booking.pricing.totalAmount;
      } else if (hoursToCheckIn > 0) {
        // 50% refund within 48 hours of check-in
        refundAmount = Math.round(booking.pricing.totalAmount * 0.5);
      }
    }

    booking.bookingStatus = 'cancelled';
    if (refundAmount > 0) {
      booking.paymentStatus = 'refund_requested';
    }
    booking.cancellation = {
      reason,
      requestedAt: now,
      processedAt: refundAmount > 0 ? now : null,
      refundAmount,
      notes: refundAmount > 0 ? `Eligible refund calculated: ₹${refundAmount}` : 'Non-refundable period',
    };

    await booking.save();

    // Release room operational status if occupied
    if (booking.roomId && booking.roomId.status === 'occupied') {
      await Room.findByIdAndUpdate(booking.roomId._id, { status: 'available' });
    }

    // Create Notification
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking #${booking.bookingReference} has been cancelled.${
        refundAmount > 0 ? ` Refund of ₹${refundAmount} has been registered.` : ''
      }`,
      type: 'booking',
      link: `/bookings/${booking._id}`,
    });

    // Send Cancellation Email
    const emailData = templates.bookingCancellation(booking, refundAmount);
    sendEmail({ to: booking.guestDetails.email, ...emailData }).catch(() => {});

    await logAudit({
      actorId: req.user._id,
      action: 'BOOKING_CANCEL',
      entityType: 'Booking',
      entityId: booking._id,
      details: { reference: booking.bookingReference, refundAmount, reason },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in guest (Staff / Admin)
// @route   PUT /api/bookings/:id/check-in
// @access  Private (Staff / Admin)
exports.checkInGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in booking with status '${booking.bookingStatus}'. Must be 'confirmed'.`,
      });
    }

    booking.bookingStatus = 'checked_in';
    booking.checkInActual = new Date();
    await booking.save();

    // Update room operational status to occupied
    await Room.findByIdAndUpdate(booking.roomId, { status: 'occupied' });

    // Notify guest
    await Notification.create({
      userId: booking.userId,
      title: 'Welcome to your stay!',
      message: `You are officially checked in to Room #${booking.roomId}. Enjoy your luxurious stay with HotelPro!`,
      type: 'booking',
      link: `/bookings/${booking._id}`,
    });

    await logAudit({
      actorId: req.user._id,
      action: 'BOOKING_CHECK_IN',
      entityType: 'Booking',
      entityId: booking._id,
      details: { reference: booking.bookingReference },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Guest checked in successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out guest (Staff / Admin)
// @route   PUT /api/bookings/:id/check-out
// @access  Private (Staff / Admin)
exports.checkOutGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (booking.bookingStatus !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-out booking with status '${booking.bookingStatus}'. Must be 'checked_in'.`,
      });
    }

    booking.bookingStatus = 'checked_out';
    booking.checkOutActual = new Date();
    await booking.save();

    // Set room operational status to 'cleaning'
    await Room.findByIdAndUpdate(booking.roomId, { status: 'cleaning' });

    // Automatically create a housekeeping task
    await HousekeepingTask.create({
      hotelId: booking.hotelId,
      roomId: booking.roomId,
      taskType: 'checkout_cleaning',
      priority: 'high',
      notes: `Post checkout turnover for booking #${booking.bookingReference}`,
      status: 'pending',
    });

    // Notify guest to leave a review
    await Notification.create({
      userId: booking.userId,
      title: 'How was your stay?',
      message: `Thank you for staying at HotelPro! Please share your review for booking #${booking.bookingReference}.`,
      type: 'booking',
      link: `/my-reviews?bookingId=${booking._id}`,
    });

    await logAudit({
      actorId: req.user._id,
      action: 'BOOKING_CHECK_OUT',
      entityType: 'Booking',
      entityId: booking._id,
      details: { reference: booking.bookingReference },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Guest checked out successfully. Housekeeping task dispatched.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
