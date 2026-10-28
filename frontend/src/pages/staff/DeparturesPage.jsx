import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { LogOut, Search, CheckCircle, BedDouble } from 'lucide-react';

const DeparturesPage = () => {
  const [checkedInGuests, setCheckedInGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCheckedIn = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings?status=checked_in');
      if (res.data.success) {
        setCheckedInGuests(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load departures list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckedIn();
  }, []);

  const handleCheckOut = async (id) => {
    try {
      const res = await api.put(`/bookings/${id}/check-out`);
      if (res.data.success) {
        toast.success('Guest checked out successfully! Room scheduled for turnover cleaning.');
        fetchCheckedIn();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    }
  };

  const filtered = checkedInGuests.filter(
    (b) =>
      b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
      b.guestDetails?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-danger bg-opacity-10 text-danger mb-1">Front Desk Operations</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Guest Departures & Check-Out</h3>
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
          <p className="text-muted small text-center py-4 m-0">No active checked-in guests awaiting departure.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest Name</th>
                  <th>Room Assigned</th>
                  <th>Check-In Date</th>
                  <th>Scheduled Departure</th>
                  <th className="text-end">Operation</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold font-monospace">#{b.bookingReference}</td>
                    <td>
                      <strong className="text-dark d-block">{b.guestDetails?.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{b.guestDetails?.phone}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        Room #{b.roomId?.roomNumber} (Floor {b.roomId?.floor || 1})
                      </span>
                    </td>
                    <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td>
                      <div>{new Date(b.checkOut).toLocaleDateString()}</div>
                      <small className="text-muted">Standard 11:00 AM</small>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleCheckOut(b._id)}
                        className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                      >
                        <LogOut size={14} />
                        <span>Process Check-Out</span>
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

export default DeparturesPage;
