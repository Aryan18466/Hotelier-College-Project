const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a hotel name'],
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Luxury Hospitality & Stays',
    },
    description: {
      type: String,
      required: [true, 'Please provide hotel description'],
    },
    address: {
      type: String,
      required: [true, 'Please provide hotel address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide hotel city'],
      index: true,
    },
    state: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'India',
    },
    starRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    contactDetails: {
      phone: { type: String, default: '+91 98765 43210' },
      email: { type: String, default: 'concierge@hotelpro.com' },
      website: { type: String, default: 'https://hotelpro.com' },
    },
    policies: {
      checkInTime: { type: String, default: '14:00' },
      checkOutTime: { type: String, default: '11:00' },
      cancellationPolicy: {
        type: String,
        default: 'Free cancellation up to 48 hours prior to check-in date. Full refund applicable.',
      },
      refundDays: { type: Number, default: 2 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hotel', hotelSchema);
