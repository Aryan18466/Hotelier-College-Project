const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { logAudit } = require('../services/auditService');

// @desc    Get all hotel services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    const { hotelId, category } = req.query;
    const query = { availability: true };

    if (hotelId) query.hotelId = hotelId;
    if (category) query.category = category;

    const services = await Service.find(query).populate('hotelId', 'name city');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hotel service (Admin)
// @route   POST /api/services
// @access  Private (Admin)
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);

    await logAudit({
      actorId: req.user._id,
      action: 'SERVICE_CREATE',
      entityType: 'Service',
      entityId: service._id,
      details: { name: service.name, price: service.price },
      req,
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service (Admin)
// @route   PUT /api/services/:id
// @access  Private (Admin)
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Guest requests a service
// @route   POST /api/services/request
// @access  Private (Guest)
exports.requestService = async (req, res, next) => {
  try {
    const { bookingId, serviceId, notes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this reservation' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const serviceRequest = await ServiceRequest.create({
      userId: req.user._id,
      hotelId: booking.hotelId,
      roomId: booking.roomId,
      bookingId: booking._id,
      serviceId: service._id,
      notes: notes || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Service requested successfully. Hotel staff will attend to your request.',
      data: serviceRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service requests (Staff / Admin / Guest)
// @route   GET /api/services/requests
// @access  Private
exports.getServiceRequests = async (req, res, next) => {
  try {
    const { status, hotelId } = req.query;
    const query = {};

    if (req.user.role === 'guest') {
      query.userId = req.user._id;
    } else {
      if (hotelId) query.hotelId = hotelId;
    }

    if (status) query.status = status;

    const requests = await ServiceRequest.find(query)
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name price category icon')
      .populate('roomId', 'roomNumber floor')
      .populate('hotelId', 'name')
      .populate('assignedStaffId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service request status (Staff / Admin)
// @route   PUT /api/services/requests/:id
// @access  Private (Staff / Admin)
exports.updateServiceRequestStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const update = { status };

    if (notes) update.notes = notes;
    if (status === 'completed') update.completedAt = new Date();
    if (status === 'in_progress') update.assignedStaffId = req.user._id;

    const request = await ServiceRequest.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('serviceId')
      .populate('userId');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Notify guest
    await Notification.create({
      userId: request.userId._id,
      title: `Service Update: ${request.serviceId.name}`,
      message: `Your request for ${request.serviceId.name} is now ${status}.`,
      type: 'service',
      link: `/guest-dashboard`,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
