import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { CalendarCheck, Search, Printer, AlertCircle } from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/bookings?${params.toString()}`);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this reservation on behalf of hotel administration?')) return;
    try {
      const res = await api.put(`/bookings/${id}/cancel`, {
        reason: 'Cancelled by Hotel Administrator',
      });
      if (res.data.success) {
        toast.success('Reservation cancelled');
        fetchBookings();
      }
    } catch (err) {
      toast.error('Failed to cancel reservation');
    }
  };

  return (
    <div className="container py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge badge-gold mb-1">Central Reservations</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Master Bookings Log</h3>
        </div>

        <form onSubmit={handleSearchSubmit} className="input-group" style={{ maxWidth: '320px' }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search reference, guest, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-dark btn-sm">
            <Search size={14} />
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-3">
        {['all', 'confirmed', 'pending', 'checked_in', 'checked_out', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm text-capitalize ${
              statusFilter === st ? 'btn-charcoal' : 'btn-light border'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        {loading ? (
          <div className="skeleton-box" style={{ height: '240px' }}></div>
        ) : bookings.length === 0 ? (
          <p className="text-muted small text-center py-4 m-0">No reservations match current filters.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest Name</th>
                  <th>Property & Room</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold font-monospace">#{b.bookingReference}</td>
                    <td>
                      <strong className="text-dark d-block">{b.guestDetails?.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{b.guestDetails?.email}</span>
                    </td>
                    <td>
                      <div>{b.hotelId?.name}</div>
                      <span className="badge bg-light text-dark border">Room #{b.roomId?.roomNumber}</span>
                    </td>
                    <td>
                      {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}
                    </td>
                    <td className="fw-bold">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge-status badge-status-${b.bookingStatus}`}>{b.bookingStatus}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border text-capitalize">{b.paymentStatus}</span>
                    </td>
                    <td className="text-end">
                      <Link to={`/invoice/${b._id}`} className="btn btn-sm btn-link text-decoration-none p-0 me-2" title="Tax Invoice">
                        <Printer size={16} />
                      </Link>
                      {['pending', 'confirmed'].includes(b.bookingStatus) && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="btn btn-sm btn-link text-danger p-0"
                          title="Admin Cancellation"
                        >
                          Cancel
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
    </div>
  );
};

export default ManageBookings;
