'use strict';

/**
 * Format milliseconds into a human-readable relative time string.
 *
 * @param {number} ms - Duration in milliseconds (positive value expected)
 * @returns {string} e.g. "45 minutes", "2 hours", "3 hours 15 minutes"
 */
function formatTimeRemaining(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0 minutes';

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Determine whether a room is "not ready" for the next guest.
 *
 * A room is not ready when:
 *  - Its status is cleaning, maintenance, or occupied; OR
 *  - It has a non-completed housekeeping task.
 *
 * @param {Object} room
 * @param {Object|null} activeTask
 * @returns {boolean}
 */
function isRoomNotReady(room, activeTask) {
  if (['cleaning', 'maintenance', 'occupied'].includes(room.status)) return true;
  if (activeTask) return true;
  return false;
}

/**
 * Calculate priority for a room based on its state and upcoming bookings.
 *
 * @param {Object} params
 * @param {Object} params.room        - Room document (status, roomNumber, etc.)
 * @param {Object|null} params.activeTask  - Current non-completed housekeeping task for this room
 * @param {Object|null} params.nextBooking - Next confirmed/checked_in booking for this room
 * @param {Date} params.now            - Current server timestamp
 * @returns {{ score: number, level: string, explanation: string }}
 */
function calculateRoomPriority({ room, activeTask, nextBooking, now }) {
  const notReady = isRoomNotReady(room, activeTask);
  const hasNextBooking = nextBooking && nextBooking.checkIn instanceof Date && !isNaN(nextBooking.checkIn);

  // --- Rules evaluated from highest to lowest priority ---

  if (notReady && hasNextBooking) {
    const diffMs = nextBooking.checkIn.getTime() - now.getTime();

    // Rule 1 – critical: check-in time has already passed
    if (diffMs <= 0) {
      const overdueDuration = formatTimeRemaining(Math.abs(diffMs));
      return {
        score: 100,
        level: 'critical',
        explanation: `Overdue — check-in was scheduled ${overdueDuration} ago and room is not ready`,
      };
    }

    const twoHoursMs = 2 * 60 * 60 * 1000;
    const sixHoursMs = 6 * 60 * 60 * 1000;

    // Rule 2 – urgent: check-in within 2 hours
    if (diffMs <= twoHoursMs) {
      return {
        score: 80,
        level: 'urgent',
        explanation: `Urgent — next guest arrives in ${formatTimeRemaining(diffMs)}`,
      };
    }

    // Rule 3 – high: check-in within 6 hours
    if (diffMs <= sixHoursMs) {
      return {
        score: 60,
        level: 'high',
        explanation: `High priority — next guest arrives in ${formatTimeRemaining(diffMs)}`,
      };
    }
  }

  // Rule 4 – high (55): room in maintenance with active maintenance task
  if (
    room.status === 'maintenance' &&
    activeTask &&
    activeTask.taskType === 'maintenance'
  ) {
    return {
      score: 55,
      level: 'high',
      explanation: 'Blocked — maintenance must be completed before room can be prepared',
    };
  }

  // Rule 5 – medium: needs cleaning, no imminent arrival
  if (
    room.status === 'cleaning' ||
    (activeTask && ['pending', 'in_progress'].includes(activeTask.status))
  ) {
    // Only medium if we haven't already matched an imminent-arrival rule above
    if (
      !hasNextBooking ||
      (hasNextBooking && nextBooking.checkIn.getTime() - now.getTime() > 6 * 60 * 60 * 1000) ||
      !notReady
    ) {
      return {
        score: 40,
        level: 'medium',
        explanation: 'Needs cleaning — no imminent arrival scheduled',
      };
    }
  }

  // Rule 6 – low: pending task but room otherwise available
  if (activeTask && activeTask.status === 'pending' && room.status === 'available') {
    return {
      score: 20,
      level: 'low',
      explanation: 'Low priority — routine task pending',
    };
  }

  // Rule 7 – ready: available, no active tasks
  if (room.status === 'available' && !activeTask) {
    return {
      score: 0,
      level: 'ready',
      explanation: 'Ready — room is available for guests',
    };
  }

  // Fallback for any edge-case not covered (e.g. occupied with no booking info)
  if (notReady) {
    return {
      score: 40,
      level: 'medium',
      explanation: 'Needs cleaning — no imminent arrival scheduled',
    };
  }

  return {
    score: 0,
    level: 'ready',
    explanation: 'Ready — room is available for guests',
  };
}

module.exports = { calculateRoomPriority, formatTimeRemaining };
