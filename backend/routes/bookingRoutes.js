const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  cancelBooking,
  checkInGuest,
  checkOutGuest,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/', protect, authorize('staff', 'admin'), getAllBookings);

router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/check-in', protect, authorize('staff', 'admin'), checkInGuest);
router.put('/:id/check-out', protect, authorize('staff', 'admin'), checkOutGuest);

module.exports = router;
