const Booking = require('../models/Booking');
const Room = require('../models/Room');

/**
 * Checks if a room has any overlapping active bookings.
 * Overlap formula: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
 * Excludes cancelled bookings and expired pending bookings (> 15 minutes old).
 */
const checkRoomAvailability = async (roomId, checkInDate, checkOutDate, excludeBookingId = null) => {
  const reqCheckIn = new Date(checkInDate);
  const reqCheckOut = new Date(checkOutDate);

  if (isNaN(reqCheckIn.getTime()) || isNaN(reqCheckOut.getTime())) {
    throw new Error('Invalid check-in or check-out date format');
  }

  if (reqCheckIn >= reqCheckOut) {
    throw new Error('Check-out date must be strictly after check-in date');
  }

  // 15 minutes cutoff for abandoned pending bookings
  const pendingExpiryThreshold = new Date(Date.now() - 15 * 60 * 1000);

  const query = {
    roomId,
    $and: [
      { checkIn: { $lt: reqCheckOut } },
      { checkOut: { $gt: reqCheckIn } },
    ],
    $or: [
      { bookingStatus: { $in: ['confirmed', 'checked_in'] } },
      {
        bookingStatus: 'pending',
        createdAt: { $gte: pendingExpiryThreshold },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return {
    isAvailable: !conflictingBooking,
    conflictingBooking: conflictingBooking
      ? {
          bookingReference: conflictingBooking.bookingReference,
          checkIn: conflictingBooking.checkIn,
          checkOut: conflictingBooking.checkOut,
          status: conflictingBooking.bookingStatus,
        }
      : null,
  };
};

/**
 * Calculates pricing for a room stay.
 */
const calculatePricing = (room, checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const basePricePerNight = room.price;
  const rawSubtotal = basePricePerNight * nights;

  const discountPercent = room.discountPercentage || 0;
  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const subtotal = rawSubtotal - discountAmount;

  // 12% GST Tax
  const taxRate = 0.12;
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  return {
    nights,
    roomPricePerNight: basePricePerNight,
    discountAmount,
    subtotal,
    taxAmount,
    taxRate: '12% GST',
    totalAmount,
    currency: 'INR',
  };
};

/**
 * Generates an alphanumeric booking reference (e.g. HP-9A4BF2)
 */
const generateBookingReference = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let ref = 'HP-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

module.exports = {
  checkRoomAvailability,
  calculatePricing,
  generateBookingReference,
};
