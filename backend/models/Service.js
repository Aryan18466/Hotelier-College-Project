const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ['dining', 'wellness', 'transport', 'housekeeping', 'amenity', 'other'],
      default: 'other',
    },
    availability: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: 'Sparkles',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);
