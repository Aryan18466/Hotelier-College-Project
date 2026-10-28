const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { logAudit } = require('../services/auditService');

// @desc    Get all active hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const hotels = await Hotel.find(query).sort({ starRating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Get rooms summary
    const roomCount = await Room.countDocuments({ hotelId: hotel._id, isActive: true });

    res.status(200).json({
      success: true,
      data: hotel,
      roomCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Admin)
exports.createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);

    await logAudit({
      actorId: req.user._id,
      action: 'HOTEL_CREATE',
      entityType: 'Hotel',
      entityId: hotel._id,
      details: { name: hotel.name, city: hotel.city },
      req,
    });

    res.status(201).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Admin)
exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    await logAudit({
      actorId: req.user._id,
      action: 'HOTEL_UPDATE',
      entityType: 'Hotel',
      entityId: hotel._id,
      details: req.body,
      req,
    });

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Admin)
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Soft delete/deactivate
    hotel.isActive = false;
    await hotel.save();

    await logAudit({
      actorId: req.user._id,
      action: 'HOTEL_DEACTIVATE',
      entityType: 'Hotel',
      entityId: hotel._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Hotel deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
