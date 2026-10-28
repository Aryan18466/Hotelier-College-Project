const mongoose = require('mongoose');

const roomCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide category description'],
    },
    amenities: [
      {
        type: String,
      },
    ],
    capacity: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 1, min: 0 },
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide base price'],
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomCategorySchema.pre('save', function (next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('RoomCategory', roomCategorySchema);
