const mongoose = require('mongoose');

const housekeepingTaskSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    taskType: {
      type: String,
      enum: ['checkout_cleaning', 'daily_refresh', 'deep_cleaning', 'maintenance'],
      default: 'checkout_cleaning',
    },
    notes: {
      type: String,
      default: '',
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HousekeepingTask', housekeepingTaskSchema);
