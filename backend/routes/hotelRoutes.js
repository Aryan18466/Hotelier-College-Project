const express = require('express');
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getHotels)
  .post(protect, authorize('admin'), createHotel);

router.route('/:id')
  .get(getHotelById)
  .put(protect, authorize('admin'), updateHotel)
  .delete(protect, authorize('admin'), deleteHotel);

module.exports = router;
