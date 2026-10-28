import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { LogIn, Search, CheckCircle, MapPin } from 'lucide-react';

const ArrivalsPage = () => {
  const [arrivals, setArrivals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArrivals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings?status=confirmed');
      if (res.data.success) {
        setArrivals(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load arrivals list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
  }, []);

  const handleCheckIn = async (id) => {
    try {
      const res = await api.put(`/bookings/${id}/check-in`);
      if (res.data.success) {
        toast.success('Guest checked in successfully! Room operational status set to Occupied.');
        fetchArrivals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const filtered = arrivals.filter(
    (b) =>
      b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
      b.guestDetails?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-success bg-opacity-10 text-success mb-1">Front Desk Operations</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Guest Arrivals & Check-In</h3>
        </div>
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text bg-white border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control form-control-sm border-start-0"
            placeholder="Search by name or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        {loading ? (
          <div className="skeleton-box" style={{ height: '200px' }}></div>
        ) : filtered.length === 0 ? (
          <p className="text-muted small text-center py-4 m-0">No pending arrivals found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest Name</th>
                  <th>Contact Info</th>
                  <th>Destination & Room</th>
                  <th>Check-In Window</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold font-monospace">#{b.bookingReference}</td>
                    <td>
                      <strong className="text-dark d-block">{b.guestDetails?.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {b.guestCount?.adults} Adults, {b.guestCount?.children} Children
                      </span>
                    </td>
                    <td>
                      <div>{b.guestDetails?.phone}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.guestDetails?.email}</div>
                    </td>
                    <td>
                      <div>{b.hotelId?.name}</div>
                      <span className="badge bg-light text-dark border">
                        Room #{b.roomId?.roomNumber} (Floor {b.roomId?.floor || 1})
                      </span>
                    </td>
                    <td>
                      <div>{new Date(b.checkIn).toLocaleDateString()}</div>
                      <small className="text-muted">Standard: 14:00</small>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleCheckIn(b._id)}
                        className="btn btn-gold btn-sm d-inline-flex align-items-center gap-1"
                      >
                        <LogIn size={14} />
                        <span>Check In Guest</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArrivalsPage;
