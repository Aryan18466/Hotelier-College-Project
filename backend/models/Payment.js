const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay', 'test_mode', 'cash'],
      default: 'razorpay',
    },
    providerOrderId: {
      type: String,
      index: true,
    },
    providerPaymentId: {
      type: String,
      index: true,
    },
    providerSignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'processed', 'rejected'],
      default: 'none',
    },
    refundDetails: {
      refundId: String,
      refundAmount: Number,
      processedAt: Date,
      notes: String,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
