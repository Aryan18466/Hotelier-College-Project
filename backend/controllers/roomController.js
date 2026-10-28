const Room = require('../models/Room');
const HousekeepingTask = require('../models/HousekeepingTask');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { checkRoomAvailability } = require('../services/bookingService');
const { logAudit } = require('../services/auditService');

// @desc    Search and filter rooms with real date availability
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
  try {
    const {
      hotelId,
      city,
      categoryId,
      checkIn,
      checkOut,
      guests,
      minPrice,
      maxPrice,
      amenity,
      sort = 'price_asc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // 1. Hotel or City Filter
    if (hotelId) {
      query.hotelId = hotelId;
    } else if (city) {
      const matchingHotels = await Hotel.find({
        city: { $regex: city, $options: 'i' },
        isActive: true,
      }).select('_id');
      query.hotelId = { $in: matchingHotels.map((h) => h._id) };
    }

    // 2. Category Filter
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // 3. Guest Capacity Filter
    if (guests) {
      const guestNumber = Number(guests);
      query.$expr = {
        $gte: [{ $add: ['$capacity.adults', '$capacity.children'] }, guestNumber],
      };
    }

    // 4. Price Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Amenity Filter
    if (amenity) {
      const amenitiesList = Array.isArray(amenity) ? amenity : amenity.split(',');
      query.amenities = { $all: amenitiesList.map((a) => a.trim()) };
    }

    // 6. Date Overlap Availability Filter
    if (checkIn && checkOut) {
      const reqIn = new Date(checkIn);
      const reqOut = new Date(checkOut);

      if (!isNaN(reqIn.getTime()) && !isNaN(reqOut.getTime()) && reqOut > reqIn) {
        // Find all rooms with overlapping active bookings
        const pendingThreshold = new Date(Date.now() - 15 * 60 * 1000);
        const bookedRoomIds = await Booking.distinct('roomId', {
          checkIn: { $lt: reqOut },
          checkOut: { $gt: reqIn },
          $or: [
            { bookingStatus: { $in: ['confirmed', 'checked_in'] } },
            { bookingStatus: 'pending', createdAt: { $gte: pendingThreshold } },
          ],
        });

        if (bookedRoomIds.length > 0) {
          query._id = { $nin: bookedRoomIds };
        }
      }
    }

    // Sorting options
    let sortOptions = {};
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'capacity_desc') sortOptions = { 'capacity.adults': -1 };
    else sortOptions = { createdAt: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query)
      .populate('hotelId', 'name city address starRating policies images')
      .populate('categoryId', 'name description amenities basePrice')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotelId')
      .populate('categoryId');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Fetch verified reviews for this room/hotel
    const reviews = await Review.find({ roomId: room._id })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    const avgRatingResult = await Review.aggregate([
      { $match: { roomId: room._id } },
      { $group: { _id: '$roomId', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]);

    const reviewStats = avgRatingResult[0] || { avgRating: 5.0, totalReviews: 0 };

    res.status(200).json({
      success: true,
      data: room,
      reviews,
      reviewStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check room availability for given dates
// @route   GET /api/rooms/:id/availability
// @access  Public
exports.checkAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both checkIn and checkOut dates',
      });
    }

    const availability = await checkRoomAvailability(req.params.id, checkIn, checkOut);

    res.status(200).json({
      success: true,
      roomId: req.params.id,
      checkIn,
      checkOut,
      isAvailable: availability.isAvailable,
      conflictingBooking: availability.conflictingBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin)
exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);

    await logAudit({
      actorId: req.user._id,
      action: 'ROOM_CREATE',
      entityType: 'Room',
      entityId: room._id,
      details: { roomNumber: room.roomNumber, hotelId: room.hotelId, price: room.price },
      req,
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await logAudit({
      actorId: req.user._id,
      action: 'ROOM_UPDATE',
      entityType: 'Room',
      entityId: room._id,
      details: req.body,
      req,
    });

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room operational status (available, occupied, cleaning, maintenance)
// @route   PUT /api/rooms/:id/status
// @access  Private (Staff / Admin)
exports.updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'cleaning', 'maintenance'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values are: ${validStatuses.join(', ')}`,
      });
    }

    const currentRoom = await Room.findById(req.params.id);
    if (!currentRoom) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Guard: Releasing a room to 'available' requires that no active maintenance tasks exist
    if (status === 'available') {
      const activeMaintenance = await HousekeepingTask.countDocuments({
        roomId: currentRoom._id,
        taskType: 'maintenance',
        status: { $in: ['pending', 'in_progress'] },
      });

      if (activeMaintenance > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot release room to available while active maintenance tasks remain unresolved.',
        });
      }
    }

    const oldStatus = currentRoom.status;
    currentRoom.status = status;
    await currentRoom.save();

    await logAudit({
      actorId: req.user._id,
      action: 'ROOM_STATUS_CHANGE',
      entityType: 'Room',
      entityId: currentRoom._id,
      details: { oldStatus, newStatus: status },
      req,
    });

    res.status(200).json({
      success: true,
      data: currentRoom,
      message: `Room status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.isActive = false;
    await room.save();

    await logAudit({
      actorId: req.user._id,
      action: 'ROOM_DEACTIVATE',
      entityType: 'Room',
      entityId: room._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Room deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
