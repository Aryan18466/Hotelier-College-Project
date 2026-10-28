const express = require('express');
const {
  getRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getRooms)
  .post(protect, authorize('admin'), createRoom);

router.get('/:id/availability', checkAvailability);

router.route('/:id')
  .get(getRoomById)
  .put(protect, authorize('admin'), updateRoom)
  .delete(protect, authorize('admin'), deleteRoom);

router.put('/:id/status', protect, authorize('staff', 'admin'), updateRoomStatus);

module.exports = router;
