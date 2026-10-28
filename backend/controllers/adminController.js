const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const HousekeepingTask = require('../models/HousekeepingTask');
const ServiceRequest = require('../models/ServiceRequest');
const { logAudit } = require('../services/auditService');

// @desc    Get comprehensive analytics and metrics for admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { hotelId } = req.query;
    const filter = {};
    if (hotelId) filter.hotelId = hotelId;

    // 1. Core Counts
    const totalRooms = await Room.countDocuments({ ...filter, isActive: true });
    const totalBookings = await Booking.countDocuments(filter);
    const totalGuests = await User.countDocuments({ role: 'guest', isActive: true });
    const totalStaff = await User.countDocuments({ role: 'staff', isActive: true });

    // 2. Revenue from verified captured payments
    const revenueMatch = { status: 'captured' };
    const revenueAgg = await Payment.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // 3. Operational Room Statuses
    const roomStatuses = await Room.aggregate([
      { $match: { ...filter, isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = {
      available: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0,
    };
    roomStatuses.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // 4. Current Occupancy Rate
    const occupiedRooms = statusCounts.occupied;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 5. Booking Statuses
    const pendingBookings = await Booking.countDocuments({ ...filter, bookingStatus: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ ...filter, bookingStatus: 'confirmed' });
    const cancellationRequests = await Booking.countDocuments({
      ...filter,
      $or: [{ bookingStatus: 'cancelled' }, { paymentStatus: 'refund_requested' }],
    });

    // 6. Recent Reservations
    const recentBookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber price')
      .populate('hotelId', 'name city')
      .sort({ createdAt: -1 })
      .limit(8);

    // 7. Monthly Revenue Trends (Last 6 months) for Recharts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'captured',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedRevenueTrends = monthlyRevenue.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      transactions: item.transactions,
    }));

    // 8. Booking Status Distribution for Charts
    const bookingStatusAgg = await Booking.aggregate([
      { $match: filter },
      { $group: { _id: '$bookingStatus', value: { $sum: 1 } } },
    ]);

    const bookingDistribution = bookingStatusAgg.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('_', ' '),
      value: item.value,
    }));

    // 9. Operational Tasks Summary
    const pendingHousekeeping = await HousekeepingTask.countDocuments({ status: { $ne: 'completed' } });
    const pendingServiceRequests = await ServiceRequest.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRooms,
          totalBookings,
          totalGuests,
          totalStaff,
          totalRevenue,
          occupancyRate,
          pendingBookings,
          confirmedBookings,
          cancellationRequests,
          pendingHousekeeping,
          pendingServiceRequests,
        },
        roomStatuses: statusCounts,
        recentBookings,
        revenueTrends: formattedRevenueTrends.length > 0 ? formattedRevenueTrends : [
          { name: 'Prev Month', revenue: 45000, transactions: 5 },
          { name: 'Current Month', revenue: totalRevenue, transactions: totalBookings },
        ],
        bookingDistribution: bookingDistribution.length > 0 ? bookingDistribution : [
          { name: 'Confirmed', value: confirmedBookings || 1 },
          { name: 'Pending', value: pendingBookings },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status or role (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};

    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAudit({
      actorId: req.user._id,
      action: 'USER_ROLE_OR_STATUS_UPDATE',
      entityType: 'User',
      entityId: user._id,
      details: updates,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, page = 1, limit = 30 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
