import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  BedDouble,
  AlertTriangle,
  Clock,
  RefreshCw,
  CheckCircle2,
  Loader2,
  CalendarClock,
  Wrench,
  Sparkles,
} from 'lucide-react';

/* ─── helpers ────────────────────────────────────────────────────── */

const formatTaskType = (type) => {
  if (!type) return '—';
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const priorityBadgeClass = (level) => {
  switch (level) {
    case 'critical':
      return 'bg-danger';
    case 'urgent':
      return 'bg-danger bg-opacity-75';
    case 'high':
      return 'bg-warning text-dark';
    case 'medium':
      return 'bg-info text-dark';
    case 'low':
      return 'bg-secondary';
    case 'ready':
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

const roomStatusBadge = (status) => {
  switch (status) {
    case 'available':
      return 'badge-status badge-status-available';
    case 'occupied':
      return 'badge-status badge-status-occupied';
    case 'cleaning':
      return 'badge-status badge-status-cleaning';
    case 'maintenance':
      return 'badge-status badge-status-maintenance';
    default:
      return 'badge-status badge-status-pending';
  }
};

const formatCheckIn = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
};

const timeRemainingColor = (timeRemaining, isOverdue) => {
  if (isOverdue) return 'text-danger fw-semibold';
  if (!timeRemaining) return 'text-muted';
  // Check if time remaining indicates < 2 hours
  const lower = timeRemaining.toLowerCase();
  const hourMatch = lower.match(/(\d+)\s*hour/);
  const hasMinutesOnly = !hourMatch && lower.includes('minute');
  if (hasMinutesOnly || (hourMatch && parseInt(hourMatch[1], 10) < 2)) return 'text-warning fw-semibold';
  if (hourMatch && parseInt(hourMatch[1], 10) >= 6) return 'text-success';
  return 'text-dark';
};

const maskGuestName = (name) => {
  if (!name) return '—';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0) + '.';
  return parts[0] + ' ' + parts.slice(1).map((p) => p.charAt(0) + '.').join(' ');
};

/* ─── component ──────────────────────────────────────────────────── */

const RoomTurnoverDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Track which action button is in-flight: { [taskId_status]: true }
  const [actionLoading, setActionLoading] = useState({});

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.get('/housekeeping/turnover-dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load turnover dashboard';
      setError(msg);
      if (isRefresh) toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* ── status update handler ──────────────────────────────────────── */

  const handleStatusUpdate = async (taskId, newStatus) => {
    const key = `${taskId}_${newStatus}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await api.put(`/housekeeping/${taskId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Task ${newStatus === 'in_progress' ? 'started' : 'completed'} successfully`);
        await fetchDashboard(true);
      }
    } catch (err) {
      toast.error('Failed to update task status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  /* ── filtered tasks ─────────────────────────────────────────────── */

  const filteredTasks = (data?.tasks || []).filter((t) => {
    if (statusFilter !== 'all' && t.task?.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority?.level !== priorityFilter) return false;
    return true;
  });

  /* ── summary helpers ────────────────────────────────────────────── */

  const summary = data?.summary || {};

  /* ── render ─────────────────────────────────────────────────────── */

  return (
    <div className="container py-2">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span className="badge bg-warning bg-opacity-15 text-warning mb-1">Room Turnover Intelligence</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Room Readiness Dashboard</h3>
          <p className="text-muted small mb-0">
            Monitor room preparation status and prioritize housekeeping for upcoming arrivals
          </p>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          className="btn btn-gold btn-sm d-flex align-items-center gap-1"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Loading State ──────────────────────────────────────── */}
      {loading && (
        <div className="d-flex flex-column gap-3">
          <div className="skeleton-box" style={{ height: '90px' }} />
          <div className="skeleton-box" style={{ height: '200px' }} />
          <div className="skeleton-box" style={{ height: '160px' }} />
        </div>
      )}

      {/* ── Error State ────────────────────────────────────────── */}
      {!loading && error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={() => fetchDashboard()}>
            Retry
          </button>
        </div>
      )}

      {/* ── Dashboard Content ──────────────────────────────────── */}
      {!loading && !error && data && (
        <>
          {/* ── B. Summary Statistics ─────────────────────────── */}
          <div className="row g-3 mb-4">
            {/* Total Rooms */}
            <div className="col-6 col-md-3">
              <div className="card luxury-card p-3 border-0 bg-white shadow-sm h-100" style={{ borderLeft: '3px solid #0d6efd' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <BedDouble size={16} className="text-primary" />
                  <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Total Rooms</span>
                </div>
                <h4 className="fw-bold mb-0 text-dark">{summary.totalRooms || 0}</h4>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {summary.available || 0} available, {summary.occupied || 0} occupied
                </span>
              </div>
            </div>

            {/* Needs Attention */}
            <div className="col-6 col-md-3">
              <div className="card luxury-card p-3 border-0 bg-white shadow-sm h-100" style={{ borderLeft: '3px solid #ffc107' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Wrench size={16} className="text-warning" />
                  <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Needs Attention</span>
                </div>
                <h4 className="fw-bold mb-0 text-dark">{(summary.cleaning || 0) + (summary.maintenance || 0)}</h4>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {summary.cleaning || 0} cleaning, {summary.maintenance || 0} maintenance
                </span>
              </div>
            </div>

            {/* Urgent Tasks */}
            <div className="col-6 col-md-3">
              <div
                className="card luxury-card p-3 border-0 bg-white shadow-sm h-100"
                style={{ borderLeft: `3px solid ${summary.urgentTasks > 0 ? '#dc3545' : '#6c757d'}` }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <AlertTriangle size={16} className={summary.urgentTasks > 0 ? 'text-danger' : 'text-secondary'} />
                  <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Urgent Tasks</span>
                </div>
                <h4 className={`fw-bold mb-0 ${summary.urgentTasks > 0 ? 'text-danger' : 'text-dark'}`}>
                  {summary.urgentTasks || 0}
                </h4>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {summary.pendingTasks || 0} pending overall
                </span>
              </div>
            </div>

            {/* In Progress */}
            <div className="col-6 col-md-3">
              <div className="card luxury-card p-3 border-0 bg-white shadow-sm h-100" style={{ borderLeft: '3px solid #0dcaf0' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Clock size={16} className="text-info" />
                  <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>In Progress</span>
                </div>
                <h4 className="fw-bold mb-0 text-dark">{summary.inProgressTasks || 0}</h4>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>tasks currently active</span>
              </div>
            </div>
          </div>

          {/* ── C. Filters Row ────────────────────────────────── */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-auto">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
            <div className="col-12 col-sm-auto">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* ── D. Prioritized Task List ──────────────────────── */}
          <div className="card luxury-card p-4 border-0 bg-white shadow-sm mb-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 size={32} className="text-success mb-2" />
                <p className="text-muted small m-0">All rooms are ready — no outstanding housekeeping tasks</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Room</th>
                      <th>Task</th>
                      <th>Priority</th>
                      <th>Room Status</th>
                      <th>Next Arrival</th>
                      <th>Priority Reason</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((t) => {
                      const taskId = t.taskId;
                      const room = t.room || {};
                      const task = t.task || {};
                      const priority = t.priority || {};
                      const arrival = t.nextArrival;
                      const isMaintenance = room.status === 'maintenance';

                      return (
                        <tr key={taskId}>
                          {/* Room */}
                          <td>
                            <strong className="text-dark">Room #{room.roomNumber}</strong>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              Floor {room.floor || 1} • {room.hotelName}
                            </div>
                          </td>

                          {/* Task */}
                          <td>
                            <span className="text-capitalize">{formatTaskType(task.type)}</span>
                            {task.notes && (
                              <div className="text-muted text-truncate" style={{ maxWidth: '180px', fontSize: '0.75rem' }}>
                                {task.notes}
                              </div>
                            )}
                          </td>

                          {/* Priority */}
                          <td>
                            <span className={`badge ${priorityBadgeClass(priority.level)}`}>
                              {priority.level}
                            </span>
                          </td>

                          {/* Room Status */}
                          <td>
                            <span className={roomStatusBadge(room.status)}>{room.status}</span>
                          </td>

                          {/* Next Arrival */}
                          <td>
                            {arrival ? (
                              <div>
                                <div className="fw-semibold text-dark">{maskGuestName(arrival.guestName)}</div>
                                <div className={timeRemainingColor(arrival.timeRemaining, false)} style={{ fontSize: '0.75rem' }}>
                                  {arrival.timeRemaining}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{arrival.bookingReference}</div>
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          {/* Priority Reason */}
                          <td>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {priority.explanation || '—'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="text-end text-nowrap">
                            {task.status === 'pending' && (
                              <button
                                onClick={() => handleStatusUpdate(taskId, 'in_progress')}
                                className="btn btn-outline-primary btn-sm py-0 px-2 me-1"
                                style={{ fontSize: '0.75rem' }}
                                disabled={!!actionLoading[`${taskId}_in_progress`]}
                              >
                                {actionLoading[`${taskId}_in_progress`] ? (
                                  <Loader2 size={12} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  'Start'
                                )}
                              </button>
                            )}
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusUpdate(taskId, 'completed')}
                                className="btn btn-outline-success btn-sm py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                disabled={isMaintenance || !!actionLoading[`${taskId}_completed`]}
                                title={isMaintenance ? 'Maintenance must be resolved first' : ''}
                              >
                                {actionLoading[`${taskId}_completed`] ? (
                                  <Loader2 size={12} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  'Complete'
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── E. Upcoming Arrivals Section ──────────────────── */}
          <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
            <div className="d-flex align-items-center gap-2 mb-3">
              <CalendarClock size={18} className="text-warning" />
              <h5 className="font-serif fw-bold text-dark mb-0">Upcoming Arrivals Requiring Preparation</h5>
            </div>

            {(!data.upcomingArrivals || data.upcomingArrivals.length === 0) ? (
              <div className="text-center py-4">
                <Sparkles size={28} className="text-success mb-2" />
                <p className="text-muted small m-0">No upcoming arrivals requiring preparation</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Booking Ref</th>
                      <th>Guest Name</th>
                      <th>Check-in Time</th>
                      <th>Room</th>
                      <th>Room Status</th>
                      <th>Task Status</th>
                      <th>Time Remaining</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingArrivals.map((a, idx) => (
                      <tr key={a.bookingReference || idx}>
                        <td className="fw-semibold">{a.bookingReference}</td>
                        <td>{maskGuestName(a.guestName)}</td>
                        <td>{formatCheckIn(a.checkIn)}</td>
                        <td>
                          <strong>#{a.roomNumber}</strong>
                        </td>
                        <td>
                          <span className={roomStatusBadge(a.roomStatus)}>{a.roomStatus}</span>
                        </td>
                        <td>
                          {a.taskStatus ? (
                            <span className={`badge-status badge-status-${a.taskStatus}`}>
                              {a.taskStatus.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-muted">No task</span>
                          )}
                        </td>
                        <td>
                          <span className={timeRemainingColor(a.timeRemaining, a.isOverdue)}>
                            {a.isOverdue ? `Overdue — ${a.timeRemaining}` : a.timeRemaining || '—'}
                          </span>
                        </td>
                        <td>
                          {a.priority ? (
                            <span className={`badge ${priorityBadgeClass(a.priority.level)}`}>
                              {a.priority.level}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Inline keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RoomTurnoverDashboard;
