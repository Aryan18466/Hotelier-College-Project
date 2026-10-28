import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { BedDouble, CheckCircle, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

const RoomStatusGrid = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms');
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load room status grid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleUpdateStatus = async (roomId, newStatus) => {
    try {
      const res = await api.put(`/rooms/${roomId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Room status updated to ${newStatus}`);
        setRooms((prev) =>
          prev.map((r) => (r._id === roomId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      toast.error('Failed to update room operational status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="badge bg-success bg-opacity-10 text-success">Available</span>;
      case 'occupied':
        return <span className="badge bg-primary bg-opacity-10 text-primary">Occupied</span>;
      case 'cleaning':
        return <span className="badge bg-warning bg-opacity-15 text-warning fw-bold">Cleaning</span>;
      case 'maintenance':
        return <span className="badge bg-danger bg-opacity-10 text-danger">Maintenance</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="container py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-primary bg-opacity-10 text-primary mb-1">Housekeeping & Operations</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Room Status Management</h3>
        </div>

        {/* Filter Badges */}
        <div className="d-flex flex-wrap gap-2">
          {['all', 'available', 'occupied', 'cleaning', 'maintenance'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm text-capitalize ${
                statusFilter === st ? 'btn-charcoal' : 'btn-light border'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="skeleton-box" style={{ height: '300px' }}></div>
      ) : (
        <div className="row g-3">
          {filteredRooms.map((room) => (
            <div key={room._id} className="col-lg-3 col-md-4 col-sm-6">
              <div className="card luxury-card p-3 border-0 bg-white h-100 d-flex flex-column justify-content-between shadow-sm">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold font-monospace fs-5 text-dark">#{room.roomNumber}</span>
                    {getStatusBadge(room.status)}
                  </div>
                  <h6 className="font-serif fw-semibold text-dark text-truncate mb-1">
                    {room.categoryId?.name || 'Luxury Suite'}
                  </h6>
                  <p className="text-muted small m-0 mb-3">
                    {room.hotelId?.name} • Floor {room.floor}
                  </p>
                </div>

                <div>
                  <label className="form-label text-muted" style={{ fontSize: '0.72rem' }}>
                    Set Operational Status:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={room.status}
                    onChange={(e) => handleUpdateStatus(room._id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomStatusGrid;
