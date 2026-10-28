import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { CalendarCheck, Clock, MapPin, ArrowRight, Star, ShieldCheck, Sparkles } from 'lucide-react';

const GuestDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        if (res.data.success) {
          setBookings(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => ['confirmed', 'pending', 'checked_in'].includes(b.bookingStatus) && new Date(b.checkOut) >= new Date()
  );

  const pastBookings = bookings.filter(
    (b) => b.bookingStatus === 'checked_out' || new Date(b.checkOut) < new Date()
  );

  return (
    <div className="container py-2">
      {/* Welcome Banner */}
      <div
        className="card luxury-card p-4 p-md-5 border-0 mb-4 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #1e2022 0%, #2d3033 100%)',
          borderLeft: '4px solid #c5a880',
        }}
      >
        <div className="position-relative z-2">
          <span className="badge badge-gold mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>
            VIP Member Portal
          </span>
          <h2 className="font-serif fw-bold text-white mb-2">Welcome back, {user?.name}</h2>
          <p className="text-secondary m-0" style={{ maxWidth: '520px' }}>
            Manage your hotel reservations, download invoices, request personalized services, and explore exclusive member privileges.
          </p>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card luxury-card p-4 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Upcoming Stays</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-2 fw-bold text-dark">{upcomingBookings.length}</span>
              <CalendarCheck size={24} className="text-warning" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card luxury-card p-4 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Total Lifetime Stays</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-2 fw-bold text-dark">{bookings.length}</span>
              <Clock size={24} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card luxury-card p-4 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Hotelier Rewards</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-2 fw-bold text-dark">Gold Tier</span>
              <Sparkles size={24} className="text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Stays Section */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="font-serif fw-bold m-0 text-dark">Upcoming Stays</h4>
          <Link to="/guest/bookings" className="text-decoration-none small text-warning fw-semibold">
            View All ({bookings.length})
          </Link>
        </div>

        {loading ? (
          <div className="skeleton-box" style={{ height: '160px' }}></div>
        ) : upcomingBookings.length === 0 ? (
          <div className="p-4 rounded bg-white border text-center text-muted small">
            You have no upcoming stays. Ready for your next luxury escape?{' '}
            <Link to="/rooms" className="text-warning fw-bold text-decoration-none">
              Explore Available Rooms
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {upcomingBookings.map((b) => (
              <div key={b._id} className="col-12">
                <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-light text-dark border">#{b.bookingReference}</span>
                        <span className={`badge-status badge-status-${b.bookingStatus}`}>{b.bookingStatus}</span>
                        <span className="badge bg-success bg-opacity-10 text-success small">{b.paymentStatus}</span>
                      </div>
                      <h5 className="font-serif fw-bold text-dark mb-1">{b.hotelId?.name}</h5>
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <MapPin size={14} className="text-warning" />
                        <span>
                          {b.hotelId?.city} • Room #{b.roomId?.roomNumber}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()} (
                          {b.pricing?.nights} Nights)
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {b.paymentStatus === 'unpaid' ? (
                        <Link to={`/payment/${b._id}`} className="btn btn-gold btn-sm">
                          Pay ₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}
                        </Link>
                      ) : (
                        <Link to={`/invoice/${b._id}`} className="btn btn-outline-dark btn-sm">
                          Tax Invoice
                        </Link>
                      )}
                      <Link to={`/confirmation/${b._id}`} className="btn btn-charcoal btn-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Stays */}
      <div>
        <h4 className="font-serif fw-bold mb-3 text-dark">Completed Stays</h4>
        {pastBookings.length === 0 ? (
          <p className="text-muted small">No completed stays recorded yet.</p>
        ) : (
          <div className="table-responsive bg-white rounded border">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking Reference</th>
                  <th>Hotel Destination</th>
                  <th>Dates</th>
                  <th>Total Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold font-monospace">#{b.bookingReference}</td>
                    <td>{b.hotelId?.name} ({b.hotelId?.city})</td>
                    <td>
                      {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                    </td>
                    <td>₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge-status badge-status-${b.bookingStatus}`}>{b.bookingStatus}</span>
                    </td>
                    <td>
                      <Link to={`/invoice/${b._id}`} className="btn btn-sm btn-link p-0 text-decoration-none me-3">
                        Invoice
                      </Link>
                      <Link to="/guest/reviews" className="btn btn-sm btn-outline-gold py-0 px-2" style={{ fontSize: '0.75rem' }}>
                        Leave Review
                      </Link>
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

export default GuestDashboard;
