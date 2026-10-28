const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user reference'],
      index: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Please provide hotel reference'],
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Please provide room reference'],
      index: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Please provide check-in date'],
      index: true,
    },
    checkOut: {
      type: Date,
      required: [true, 'Please provide check-out date'],
      index: true,
    },
    guestCount: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    guestDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      specialRequests: { type: String, default: '' },
    },
    pricing: {
      roomPricePerNight: { type: Number, required: true },
      nights: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxAmount: { type: Number, required: true }, // e.g. 12% GST
      discountAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refund_requested', 'refunded', 'failed'],
      default: 'unpaid',
      index: true,
    },
    cancellation: {
      reason: { type: String, default: '' },
      requestedAt: { type: Date },
      processedAt: { type: Date },
      refundAmount: { type: Number, default: 0 },
      notes: { type: String, default: '' },
    },
    checkInActual: { type: Date },
    checkOutActual: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for overlap search
bookingSchema.index({ roomId: 1, bookingStatus: 1, checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
