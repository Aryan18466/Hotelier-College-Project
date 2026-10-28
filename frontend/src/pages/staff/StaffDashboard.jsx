import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  LogIn,
  LogOut,
  BedDouble,
  ClipboardList,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    arrivalsToday: 0,
    departuresToday: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    pendingTasks: 0,
    pendingServices: 0,
  });
  const [recentArrivals, setRecentArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaffData = async () => {
    try {
      const [bookingsRes, roomsRes, tasksRes, svcsRes] = await Promise.all([
        api.get('/bookings?status=confirmed'),
        api.get('/rooms'),
        api.get('/housekeeping?status=pending'),
        api.get('/services/requests?status=pending'),
      ]);

      const todayStr = new Date().toISOString().split('T')[0];

      const confirmedBookings = bookingsRes.data.data || [];
      const arrivals = confirmedBookings.filter(
        (b) => b.checkIn && b.checkIn.startsWith(todayStr)
      );

      const allRooms = roomsRes.data.data || [];
      const occupied = allRooms.filter((r) => r.status === 'occupied').length;
      const cleaning = allRooms.filter((r) => r.status === 'cleaning').length;

      setStats({
        arrivalsToday: arrivals.length || confirmedBookings.length,
        departuresToday: 2, // Sample departures
        occupiedRooms: occupied,
        cleaningRooms: cleaning,
        pendingTasks: tasksRes.data.count || 0,
        pendingServices: svcsRes.data.count || 0,
      });

      setRecentArrivals(confirmedBookings.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleCheckIn = async (bookingId) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/check-in`);
      if (res.data.success) {
        toast.success('Guest checked in successfully! Room marked as occupied.');
        fetchStaffData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  return (
    <div className="container py-2">
      <div className="mb-4">
        <span className="badge bg-primary text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>
          Front Desk & Operations
        </span>
        <h2 className="font-serif fw-bold text-dark mb-1">Hotel Operations Hub</h2>
        <p className="text-muted small m-0">Monitor guest movements, manage room turnovers, and attend to service requests.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card luxury-card p-3 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Arriving Guests</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-3 fw-bold text-dark">{stats.arrivalsToday}</span>
              <LogIn size={20} className="text-success" />
            </div>
            <Link to="/staff/arrivals" className="small text-decoration-none text-warning mt-2 d-inline-block">
              Open Arrivals →
            </Link>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card luxury-card p-3 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Departing Guests</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-3 fw-bold text-dark">{stats.departuresToday}</span>
              <LogOut size={20} className="text-danger" />
            </div>
            <Link to="/staff/departures" className="small text-decoration-none text-warning mt-2 d-inline-block">
              Open Departures →
            </Link>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card luxury-card p-3 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Housekeeping Queue</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-3 fw-bold text-dark">{stats.pendingTasks}</span>
              <ClipboardList size={20} className="text-warning" />
            </div>
            <Link to="/staff/housekeeping" className="small text-decoration-none text-warning mt-2 d-inline-block">
              View Tasks →
            </Link>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card luxury-card p-3 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Guest Requests</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-3 fw-bold text-dark">{stats.pendingServices}</span>
              <Sparkles size={20} className="text-info" />
            </div>
            <Link to="/staff/services" className="small text-decoration-none text-warning mt-2 d-inline-block">
              Attend Requests →
            </Link>
          </div>
        </div>
      </div>

      {/* Immediate Check-In Action Table */}
      <div className="card luxury-card p-4 border-0 bg-white shadow-sm mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="font-serif fw-bold text-dark m-0">Arrivals Ready for Check-In</h5>
          <Link to="/staff/arrivals" className="small text-warning text-decoration-none fw-semibold">
            View All Arrivals
          </Link>
        </div>

        {loading ? (
          <div className="skeleton-box" style={{ height: '140px' }}></div>
        ) : recentArrivals.length === 0 ? (
          <p className="text-muted small m-0">No pending arrivals right now.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Reference</th>
                  <th>Guest Name</th>
                  <th>Hotel Destination</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th className="text-end">Operation</th>
                </tr>
              </thead>
              <tbody>
                {recentArrivals.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold font-monospace">#{b.bookingReference}</td>
                    <td>
                      <strong>{b.guestDetails?.name}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {b.guestDetails?.phone}
                      </div>
                    </td>
                    <td>{b.hotelId?.name}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        Room #{b.roomId?.roomNumber || 'Assigned'}
                      </span>
                    </td>
                    <td>
                      {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleCheckIn(b._id)}
                        className="btn btn-gold btn-sm d-inline-flex align-items-center gap-1"
                      >
                        <CheckCircle size={14} />
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

export default StaffDashboard;
