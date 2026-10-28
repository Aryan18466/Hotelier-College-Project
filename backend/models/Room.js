const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Please provide hotel reference'],
      index: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: [true, 'Please provide category reference'],
      index: true,
    },
    floor: {
      type: Number,
      default: 1,
    },
    capacity: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 1, min: 0 },
    },
    price: {
      type: Number,
      required: [true, 'Please provide room price per night'],
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    images: [
      {
        type: String,
      },
    ],
    amenities: [
      {
        type: String,
      },
    ],
    // Operational status for housekeeping/maintenance:
    status: {
      type: String,
      enum: ['available', 'occupied', 'cleaning', 'maintenance'],
      default: 'available',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
