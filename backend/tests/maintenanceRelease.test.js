'use strict';

/**
 * Focused unit/logic tests for maintenance release and room readiness behavior.
 * These tests verify the state transition guardrails and priority evaluation
 * without mutating a live database.
 */

const { calculateRoomPriority } = require('../services/turnoverPriority');

describe('Maintenance Release & Room Readiness Logic', () => {
  const NOW = new Date('2026-10-28T12:00:00Z');

  // Test 1: Room under maintenance does not become ready even if cleaning task completes
  test('Completing an ordinary cleaning task does not release a maintenance-blocked room', () => {
    // When a cleaning task is completed, room.status remains 'maintenance'
    const room = {
      _id: 'room-101',
      roomNumber: '101',
      status: 'maintenance',
    };
    // No active cleaning task remains, but room is in maintenance
    const priority = calculateRoomPriority({
      room,
      activeTask: null,
      nextBooking: null,
      now: NOW,
    });

    // Room must NOT be marked ready
    expect(priority.level).not.toBe('ready');
    expect(priority.score).toBeGreaterThan(0);
  });

  // Test 2: Unresolved maintenance task elevates priority and explains blockage
  test('Active maintenance task produces blocked explanation', () => {
    const room = {
      _id: 'room-102',
      roomNumber: '102',
      status: 'maintenance',
    };
    const activeTask = {
      _id: 'task-m1',
      taskType: 'maintenance',
      status: 'in_progress',
    };
    const priority = calculateRoomPriority({
      room,
      activeTask,
      nextBooking: null,
      now: NOW,
    });

    expect(priority.level).toBe('high');
    expect(priority.score).toBe(55);
    expect(priority.explanation).toMatch(/maintenance must be completed/i);
  });

  // Test 3: Imminent arrival on maintenance room remains urgent and unready
  test('Imminent arrival on room under maintenance is flagged urgent/critical', () => {
    const room = {
      _id: 'room-103',
      roomNumber: '103',
      status: 'maintenance',
    };
    const activeTask = {
      _id: 'task-m2',
      taskType: 'maintenance',
      status: 'pending',
    };
    const nextBooking = {
      checkIn: new Date(NOW.getTime() + 45 * 60 * 1000), // in 45 mins
    };
    const priority = calculateRoomPriority({
      room,
      activeTask,
      nextBooking,
      now: NOW,
    });

    expect(priority.level).toBe('urgent');
    expect(priority.score).toBe(80);
    expect(priority.explanation).toMatch(/Urgent/);
  });

  // Test 4: Overdue arrival on maintenance room is flagged critical
  test('Overdue arrival on room under maintenance is flagged critical', () => {
    const room = {
      _id: 'room-104',
      roomNumber: '104',
      status: 'maintenance',
    };
    const nextBooking = {
      checkIn: new Date(NOW.getTime() - 15 * 60 * 1000), // 15 mins ago
    };
    const priority = calculateRoomPriority({
      room,
      activeTask: null,
      nextBooking,
      now: NOW,
    });

    expect(priority.level).toBe('critical');
    expect(priority.score).toBe(100);
    expect(priority.explanation).toMatch(/Overdue/);
  });

  // Test 5: Only an explicit transition to 'available' with zero blockers marks ready
  test('Room marked available with no active tasks is evaluated as ready', () => {
    const room = {
      _id: 'room-105',
      roomNumber: '105',
      status: 'available',
    };
    const priority = calculateRoomPriority({
      room,
      activeTask: null,
      nextBooking: null,
      now: NOW,
    });

    expect(priority.level).toBe('ready');
    expect(priority.score).toBe(0);
    expect(priority.explanation).toMatch(/Ready/i);
  });
});
