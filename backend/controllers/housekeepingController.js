const HousekeepingTask = require('../models/HousekeepingTask');
const Room = require('../models/Room');
const { logAudit } = require('../services/auditService');

// @desc    Get housekeeping tasks
// @route   GET /api/housekeeping
// @access  Private (Staff / Admin)
exports.getTasks = async (req, res, next) => {
  try {
    const { status, hotelId } = req.query;
    const query = {};

    if (hotelId) query.hotelId = hotelId;
    if (status) query.status = status;

    const tasks = await HousekeepingTask.find(query)
      .populate('hotelId', 'name city')
      .populate('roomId', 'roomNumber floor status')
      .populate('assignedStaffId', 'name email')
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a housekeeping task manually
// @route   POST /api/housekeeping
// @access  Private (Staff / Admin)
exports.createTask = async (req, res, next) => {
  try {
    const { hotelId, roomId, assignedStaffId, priority, taskType, notes } = req.body;

    const task = await HousekeepingTask.create({
      hotelId,
      roomId,
      assignedStaffId: assignedStaffId || req.user._id,
      priority: priority || 'medium',
      taskType: taskType || 'daily_refresh',
      notes: notes || '',
      status: 'pending',
    });

    // Mark room as cleaning if not occupied
    const room = await Room.findById(roomId);
    if (room && room.status === 'available') {
      room.status = 'cleaning';
      await room.save();
    }

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PUT /api/housekeeping/:id
// @access  Private (Staff / Admin)
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide a status value' });
    }

    // --- Validate the requested status value ---
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values are: ${validStatuses.join(', ')}`,
      });
    }

    // --- Look up the current task to validate the transition ---
    const existingTask = await HousekeepingTask.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Housekeeping task not found' });
    }

    // --- Validate status transitions ---
    const allowedTransitions = {
      pending: ['in_progress', 'completed'],
      in_progress: ['completed'],
      completed: [], // cannot reopen completed tasks
    };

    if (!allowedTransitions[existingTask.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition task from '${existingTask.status}' to '${status}'`,
      });
    }

    const update = { status };
    if (notes) update.notes = notes;
    if (status === 'completed') {
      update.completedAt = new Date();
    }
    if (status === 'in_progress' && !req.body.assignedStaffId) {
      update.assignedStaffId = req.user._id;
    }

    const task = await HousekeepingTask.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('roomId');

    // --- Room status transition on completion ---
    if (status === 'completed' && task.roomId) {
      // Completing any task must NEVER automatically release a room that is in 'maintenance' or 'occupied'.
      // A room in 'cleaning' can only transition to 'available' if all outstanding tasks are resolved.
      if (task.roomId.status === 'cleaning') {
        const remainingTasks = await HousekeepingTask.countDocuments({
          roomId: task.roomId._id,
          _id: { $ne: task._id },
          status: { $in: ['pending', 'in_progress'] },
        });

        if (remainingTasks === 0) {
          await Room.findByIdAndUpdate(task.roomId._id, { status: 'available' });
        }
      }
      // If room is in 'maintenance', completing a task (cleaning or maintenance) never automatically
      // marks the room available. Explicit inspection/readiness release is required.
    }

    await logAudit({
      actorId: req.user._id,
      action: 'HOUSEKEEPING_TASK_UPDATE',
      entityType: 'HousekeepingTask',
      entityId: task._id,
      details: { status, previousStatus: existingTask.status, roomId: task.roomId?._id },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Housekeeping task status updated to ${status}`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};
