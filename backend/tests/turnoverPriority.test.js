'use strict';

const { calculateRoomPriority, formatTimeRemaining } = require('../services/turnoverPriority');

// ---------------------------------------------------------------------------
// Helpers to build mock objects
// ---------------------------------------------------------------------------
const makeRoom = (overrides = {}) => ({
  _id: 'room-1',
  roomNumber: '101',
  floor: 1,
  status: 'available',
  ...overrides,
});

const makeTask = (overrides = {}) => ({
  _id: 'task-1',
  status: 'pending',
  taskType: 'checkout_cleaning',
  ...overrides,
});

const makeBooking = (checkIn, overrides = {}) => ({
  _id: 'booking-1',
  bookingReference: 'HP-0001',
  checkIn: checkIn instanceof Date ? checkIn : new Date(checkIn),
  guestDetails: { name: 'Test Guest' },
  ...overrides,
});

const NOW = new Date('2026-10-28T12:00:00Z');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('turnoverPriority service', () => {
  // ---- Test 1 ----
  test('Room available with no task and no booking → ready, score 0', () => {
    const result = calculateRoomPriority({
      room: makeRoom({ status: 'available' }),
      activeTask: null,
      nextBooking: null,
      now: NOW,
    });

    expect(result.level).toBe('ready');
    expect(result.score).toBe(0);
    expect(result.explanation).toMatch(/Ready/i);
  });

  // ---- Test 2 ----
  test('Room cleaning with pending task and check-in in 45 min → urgent', () => {
    const checkIn = new Date(NOW.getTime() + 45 * 60 * 1000);
    const result = calculateRoomPriority({
      room: makeRoom({ status: 'cleaning' }),
      activeTask: makeTask({ status: 'pending' }),
      nextBooking: makeBooking(checkIn),
      now: NOW,
    });

    expect(result.level).toBe('urgent');
    expect(result.score).toBe(80);
    expect(result.explanation).toContain('45 minutes');
    expect(result.explanation).toMatch(/Urgent/);
  });

  // ---- Test 3 ----
  test('Room cleaning with pending task and check-in 30 min ago → critical', () => {
    const checkIn = new Date(NOW.getTime() - 30 * 60 * 1000);
    const result = calculateRoomPriority({
      room: makeRoom({ status: 'cleaning' }),
      activeTask: makeTask({ status: 'pending' }),
      nextBooking: makeBooking(checkIn),
      now: NOW,
    });

    expect(result.level).toBe('critical');
    expect(result.score).toBe(100);
    expect(result.explanation).toMatch(/Overdue/);
    expect(result.explanation).toContain('30 minutes');
  });

  // ---- Test 4 ----
  test('Room maintenance with active maintenance task → high, explanation mentions maintenance', () => {
    const result = calculateRoomPriority({
      room: makeRoom({ status: 'maintenance' }),
      activeTask: makeTask({ status: 'in_progress', taskType: 'maintenance' }),
      nextBooking: null,
      now: NOW,
    });

    expect(result.level).toBe('high');
    expect(result.score).toBe(55);
    expect(result.explanation).toMatch(/maintenance/i);
  });

  // ---- Test 5 ----
  test('Room cleaning with pending task but no upcoming booking → medium', () => {
    const result = calculateRoomPriority({
      room: makeRoom({ status: 'cleaning' }),
      activeTask: makeTask({ status: 'pending' }),
      nextBooking: null,
      now: NOW,
    });

    expect(result.level).toBe('medium');
    expect(result.score).toBe(40);
  });

  // ---- Test 6 ----
  test('Completed task does not affect readiness (room available, no active task)', () => {
    // A completed task should be treated as null (not an "active" task)
    const result = calculateRoomPriority({
      room: makeRoom({ status: 'available' }),
      activeTask: null, // completed tasks are filtered out before calling this function
      nextBooking: null,
      now: NOW,
    });

    expect(result.level).toBe('ready');
    expect(result.score).toBe(0);
  });

  // ---- Test 7 ----
  test('Room cleaning, check-in in 4 hours → high', () => {
    const checkIn = new Date(NOW.getTime() + 4 * 60 * 60 * 1000);
    const result = calculateRoomPriority({
      room: makeRoom({ status: 'cleaning' }),
      activeTask: makeTask({ status: 'in_progress' }),
      nextBooking: makeBooking(checkIn),
      now: NOW,
    });

    expect(result.level).toBe('high');
    expect(result.score).toBe(60);
    expect(result.explanation).toContain('4 hours');
    expect(result.explanation).toMatch(/High priority/);
  });

  // ---- Test 8 ----
  test('Invalid/missing booking dates do not crash or fabricate priority', () => {
    // null checkIn
    const result1 = calculateRoomPriority({
      room: makeRoom({ status: 'cleaning' }),
      activeTask: makeTask(),
      nextBooking: { checkIn: null },
      now: NOW,
    });
    expect(result1).toBeDefined();
    expect(typeof result1.level).toBe('string');
    expect(typeof result1.score).toBe('number');

    // undefined booking
    const result2 = calculateRoomPriority({
      room: makeRoom({ status: 'cleaning' }),
      activeTask: makeTask(),
      nextBooking: undefined,
      now: NOW,
    });
    expect(result2).toBeDefined();

    // Invalid date string
    const result3 = calculateRoomPriority({
      room: makeRoom({ status: 'cleaning' }),
      activeTask: makeTask(),
      nextBooking: { checkIn: new Date('not-a-date') },
      now: NOW,
    });
    expect(result3).toBeDefined();
    expect(typeof result3.level).toBe('string');
    // Should not be critical/urgent since there's no valid date
    expect(['critical', 'urgent']).not.toContain(result3.level);
  });

  // ---- Test 9 ----
  test('Priority explanation is consistent with the priority level', () => {
    const cases = [
      {
        room: makeRoom({ status: 'cleaning' }),
        activeTask: makeTask(),
        nextBooking: makeBooking(new Date(NOW.getTime() - 60 * 60 * 1000)),
        expectedLevel: 'critical',
        explanationPattern: /Overdue/,
      },
      {
        room: makeRoom({ status: 'cleaning' }),
        activeTask: makeTask(),
        nextBooking: makeBooking(new Date(NOW.getTime() + 1 * 60 * 60 * 1000)),
        expectedLevel: 'urgent',
        explanationPattern: /Urgent/,
      },
      {
        room: makeRoom({ status: 'cleaning' }),
        activeTask: makeTask(),
        nextBooking: makeBooking(new Date(NOW.getTime() + 5 * 60 * 60 * 1000)),
        expectedLevel: 'high',
        explanationPattern: /High priority/,
      },
      {
        room: makeRoom({ status: 'maintenance' }),
        activeTask: makeTask({ taskType: 'maintenance', status: 'in_progress' }),
        nextBooking: null,
        expectedLevel: 'high',
        explanationPattern: /maintenance/i,
      },
      {
        room: makeRoom({ status: 'cleaning' }),
        activeTask: makeTask(),
        nextBooking: null,
        expectedLevel: 'medium',
        explanationPattern: /cleaning/i,
      },
      {
        room: makeRoom({ status: 'available' }),
        activeTask: null,
        nextBooking: null,
        expectedLevel: 'ready',
        explanationPattern: /Ready/,
      },
    ];

    for (const { room, activeTask, nextBooking, expectedLevel, explanationPattern } of cases) {
      const result = calculateRoomPriority({ room, activeTask, nextBooking, now: NOW });
      expect(result.level).toBe(expectedLevel);
      expect(result.explanation).toMatch(explanationPattern);
    }
  });

  // ---- Test 10 ----
  describe('formatTimeRemaining', () => {
    test('formats minutes only', () => {
      expect(formatTimeRemaining(45 * 60 * 1000)).toBe('45 minutes');
    });

    test('formats exact hours', () => {
      expect(formatTimeRemaining(2 * 60 * 60 * 1000)).toBe('2 hours');
    });

    test('formats hours and minutes', () => {
      expect(formatTimeRemaining(3 * 60 * 60 * 1000 + 15 * 60 * 1000)).toBe('3 hours 15 minutes');
    });

    test('formats 1 minute (singular)', () => {
      expect(formatTimeRemaining(1 * 60 * 1000)).toBe('1 minute');
    });

    test('formats 1 hour (singular)', () => {
      expect(formatTimeRemaining(1 * 60 * 60 * 1000)).toBe('1 hour');
    });

    test('formats 1 hour 1 minute', () => {
      expect(formatTimeRemaining(61 * 60 * 1000)).toBe('1 hour 1 minute');
    });

    test('handles zero', () => {
      expect(formatTimeRemaining(0)).toBe('0 minutes');
    });

    test('handles negative values gracefully', () => {
      expect(formatTimeRemaining(-5000)).toBe('0 minutes');
    });

    test('handles non-finite values', () => {
      expect(formatTimeRemaining(NaN)).toBe('0 minutes');
      expect(formatTimeRemaining(Infinity)).toBe('0 minutes');
    });
  });
});
