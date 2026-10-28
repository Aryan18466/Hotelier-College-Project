import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const HousekeepingPage = () => {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Task Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [taskType, setTaskType] = useState('daily_refresh');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, roomsRes] = await Promise.all([
        api.get('/housekeeping'),
        api.get('/rooms'),
      ]);

      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (roomsRes.data.success) {
        setRooms(roomsRes.data.data);
        if (roomsRes.data.data.length > 0) {
          setSelectedRoomId(roomsRes.data.data[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load housekeeping records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/housekeeping/${taskId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Task status updated to ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const room = rooms.find((r) => r._id === selectedRoomId);
    if (!room) return;

    setSubmitting(true);
    try {
      const res = await api.post('/housekeeping', {
        hotelId: room.hotelId?._id || room.hotelId,
        roomId: room._id,
        priority,
        taskType,
        notes,
      });

      if (res.data.success) {
        toast.success('Housekeeping task dispatched successfully!');
        setShowModal(false);
        setNotes('');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create housekeeping task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-warning bg-opacity-15 text-warning mb-1">Turnover & Sanitation</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Housekeeping Management</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-gold btn-sm d-flex align-items-center gap-1"
        >
          <Plus size={16} />
          <span>Dispatch Cleaning Task</span>
        </button>
      </div>

      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        {loading ? (
          <div className="skeleton-box" style={{ height: '220px' }}></div>
        ) : tasks.length === 0 ? (
          <p className="text-muted small text-center py-4 m-0">No active housekeeping tasks.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Room Assigned</th>
                  <th>Task Type</th>
                  <th>Priority</th>
                  <th>Scheduled / Created</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <strong className="text-dark">Room #{t.roomId?.roomNumber}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Floor {t.roomId?.floor || 1} • {t.hotelId?.name}
                      </div>
                    </td>
                    <td className="text-capitalize">{t.taskType?.replace('_', ' ')}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.priority === 'high'
                            ? 'bg-danger'
                            : t.priority === 'medium'
                            ? 'bg-warning text-dark'
                            : 'bg-secondary'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>{new Date(t.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="text-muted text-truncate" style={{ maxWidth: '220px' }}>
                      {t.notes || 'Routine cleaning'}
                    </td>
                    <td>
                      <span className={`badge-status badge-status-${t.status}`}>{t.status}</span>
                    </td>
                    <td className="text-end">
                      {t.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(t._id, 'in_progress')}
                          className="btn btn-outline-primary btn-sm py-0 px-2 me-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Start
                        </button>
                      )}
                      {t.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(t._id, 'completed')}
                          className="btn btn-outline-success btn-sm py-0 px-2"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-serif fw-bold">Dispatch Housekeeping Task</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Select Room</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                    >
                      {rooms.map((r) => (
                        <option key={r._id} value={r._id}>
                          Room #{r.roomNumber} – {r.hotelId?.name} ({r.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Task Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={taskType}
                        onChange={(e) => setTaskType(e.target.value)}
                      >
                        <option value="daily_refresh">Daily Refresh</option>
                        <option value="checkout_cleaning">Checkout Turnover</option>
                        <option value="deep_cleaning">Deep Sanitization</option>
                        <option value="maintenance">Maintenance Fix</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Priority</label>
                      <select
                        className="form-select form-select-sm"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Instructions / Notes</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="e.g. VIP guest arrival, extra plush towels, replenishing bar..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold btn-sm" disabled={submitting}>
                    {submitting ? 'Dispatching...' : 'Dispatch Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingPage;
