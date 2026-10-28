'use strict';

const Room = require('../models/Room');
const HousekeepingTask = require('../models/HousekeepingTask');
const Booking = require('../models/Booking');
const { calculateRoomPriority, formatTimeRemaining } = require('../services/turnoverPriority');

/**
 * Truncate a full name to first-name + last-initial for privacy.
 * "Rohan Sharma" → "Rohan S."
 * "Rohan"        → "Rohan"
 * @param {string} fullName
 * @returns {string}
 */
function truncateGuestName(fullName) {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || '';
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// @desc    Get Room Turnover Intelligence dashboard data
// @route   GET /api/housekeeping/turnover-dashboard
// @access  Private (Staff / Admin)
exports.getTurnoverDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const { hotelId } = req.query;

    // --- Build filters ---
    const roomFilter = { isActive: true };
    const taskFilter = { status: { $in: ['pending', 'in_progress'] } };
    if (hotelId) {
      roomFilter.hotelId = hotelId;
      taskFilter.hotelId = hotelId;
    }

    // Time windows for bookings
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookingFilter = {
      $or: [
        {
          // Confirmed bookings with check-in in the relevant window
          bookingStatus: 'confirmed',
          checkIn: { $gte: fourHoursAgo, $lte: twentyFourHoursFromNow },
        },
        {
          // Checked-in bookings (currently occupied)
          bookingStatus: 'checked_in',
        },
      ],
    };
    if (hotelId) bookingFilter.hotelId = hotelId;

    // --- Fetch data in parallel ---
    const [rooms, tasks, bookings] = await Promise.all([
      Room.find(roomFilter)
        .populate('hotelId', 'name city')
        .populate('categoryId', 'name')
        .lean(),
      HousekeepingTask.find(taskFilter)
        .populate('roomId', 'roomNumber floor status')
        .populate('assignedStaffId', 'name')
        .lean(),
      Booking.find(bookingFilter)
        .select('bookingReference hotelId roomId checkIn checkOut guestDetails.name bookingStatus')
        .populate('roomId', 'roomNumber floor status')
        .sort({ checkIn: 1 })
        .lean(),
    ]);

    // --- Index tasks by roomId for O(1) look-ups ---
    const tasksByRoomId = {};
    for (const task of tasks) {
      const rid = String(task.roomId?._id || task.roomId);
      if (!tasksByRoomId[rid]) tasksByRoomId[rid] = [];
      tasksByRoomId[rid].push(task);
    }

    // --- Index next confirmed booking per room (earliest first) ---
    const nextBookingByRoomId = {};
    for (const booking of bookings) {
      if (booking.bookingStatus !== 'confirmed') continue;
      const rid = String(booking.roomId?._id || booking.roomId);
      if (!nextBookingByRoomId[rid] || booking.checkIn < nextBookingByRoomId[rid].checkIn) {
        nextBookingByRoomId[rid] = booking;
      }
    }

    // --- Build summary counters ---
    const summary = {
      totalRooms: rooms.length,
      available: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0,
      urgentTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
    };

    for (const room of rooms) {
      if (summary[room.status] !== undefined) summary[room.status]++;
    }
    for (const task of tasks) {
      if (task.status === 'pending') summary.pendingTasks++;
      else if (task.status === 'in_progress') summary.inProgressTasks++;
    }

    // --- Build task items with priority ---
    const taskItems = [];
    for (const task of tasks) {
      const rid = String(task.roomId?._id || task.roomId);
      const room = rooms.find((r) => String(r._id) === rid);
      if (!room) continue;

      const nextBooking = nextBookingByRoomId[rid] || null;
      const priority = calculateRoomPriority({
        room,
        activeTask: task,
        nextBooking: nextBooking
          ? { checkIn: new Date(nextBooking.checkIn) }
          : null,
        now,
      });

      if (priority.level === 'critical' || priority.level === 'urgent') {
        summary.urgentTasks++;
      }

      const hotelName =
        room.hotelId && typeof room.hotelId === 'object'
          ? room.hotelId.name
          : '';

      let nextArrival = null;
      if (nextBooking) {
        const diffMs = new Date(nextBooking.checkIn).getTime() - now.getTime();
        nextArrival = {
          guestName: truncateGuestName(nextBooking.guestDetails?.name),
          checkIn: nextBooking.checkIn,
          bookingReference: nextBooking.bookingReference,
          timeRemaining: formatTimeRemaining(Math.max(0, diffMs)),
        };
      }

      taskItems.push({
        taskId: task._id,
        room: {
          id: room._id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          status: room.status,
          hotelName,
        },
        task: {
          type: task.taskType,
          status: task.status,
          assignedTo:
            task.assignedStaffId && typeof task.assignedStaffId === 'object'
              ? task.assignedStaffId.name
              : null,
          notes: task.notes || '',
          createdAt: task.createdAt,
        },
        priority,
        nextArrival,
      });
    }

    // Sort tasks by priority score descending
    taskItems.sort((a, b) => b.priority.score - a.priority.score);

    // --- Build upcoming arrivals ---
    const upcomingArrivals = [];
    for (const booking of bookings) {
      if (booking.bookingStatus !== 'confirmed') continue;

      const rid = String(booking.roomId?._id || booking.roomId);
      const room = rooms.find((r) => String(r._id) === rid);
      const roomTasks = tasksByRoomId[rid] || [];
      const activeTask = roomTasks[0] || null;

      const priority = calculateRoomPriority({
        room: room || { status: booking.roomId?.status || 'available' },
        activeTask,
        nextBooking: { checkIn: new Date(booking.checkIn) },
        now,
      });

      const diffMs = new Date(booking.checkIn).getTime() - now.getTime();

      // Determine the task status for this booking's room
      let taskStatus = 'none';
      if (roomTasks.length > 0) {
        // Pick the most relevant status
        if (roomTasks.some((t) => t.status === 'in_progress')) taskStatus = 'in_progress';
        else if (roomTasks.some((t) => t.status === 'pending')) taskStatus = 'pending';
      }

      upcomingArrivals.push({
        bookingReference: booking.bookingReference,
        guestName: truncateGuestName(booking.guestDetails?.name),
        checkIn: booking.checkIn,
        roomNumber: booking.roomId?.roomNumber || (room && room.roomNumber) || '',
        roomStatus: booking.roomId?.status || (room && room.status) || 'available',
        taskStatus,
        priority,
        timeRemaining: formatTimeRemaining(Math.max(0, diffMs)),
        isOverdue: diffMs <= 0,
      });
    }

    // Sort upcoming arrivals by checkIn ascending (already sorted from query, but ensure)
    upcomingArrivals.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

    res.status(200).json({
      success: true,
      data: {
        summary,
        tasks: taskItems,
        upcomingArrivals,
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
