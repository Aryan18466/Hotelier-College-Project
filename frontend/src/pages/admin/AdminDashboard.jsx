import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  DollarSign,
  CalendarCheck,
  BedDouble,
  Users,
  TrendingUp,
  AlertCircle,
  Percent,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#c5a880', '#2d3033', '#4caf50', '#f44336', '#ff9800'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading executive analytics...</span>
        </div>
      </div>
    );
  }

  const { summary, roomStatuses, recentBookings, revenueTrends, bookingDistribution } = data;

  return (
    <div className="container py-2">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <span className="badge badge-gold mb-1">Executive Suite</span>
          <h2 className="font-serif fw-bold text-dark mb-0">Hospitality Analytics & Overview</h2>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/admin/bookings" className="btn btn-outline-dark btn-sm">
            All Reservations
          </Link>
          <Link to="/admin/rooms" className="btn btn-gold btn-sm">
            Manage Rooms
          </Link>
        </div>
      </div>

      {/* KPI Cards Row 1: Core Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="card luxury-card p-3 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Verified Revenue</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-3 fw-bold text-dark">₹{summary?.totalRevenue?.toLocaleString('en-IN')}</span>
              <DollarSign size={22} className="text-success" />
            </div>
            <div className="small text-muted mt-1">From verified captured payments</div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card luxury-card p-3 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Current Occupancy</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-3 fw-bold text-dark">{summary?.occupancyRate}%</span>
              <Percent size={22} className="text-warning" />
            </div>
            <div className="small text-muted mt-1">
              {roomStatuses?.occupied} of {summary?.totalRooms} active suites occupied
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card luxury-card p-3 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Total Reservations</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-3 fw-bold text-dark">{summary?.totalBookings}</span>
              <CalendarCheck size={22} className="text-primary" />
            </div>
            <div className="small text-muted mt-1">
              {summary?.confirmedBookings} confirmed stays
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card luxury-card p-3 border-0 bg-white">
            <span className="text-muted small fw-bold text-uppercase">Registered Guests</span>
            <div className="d-flex align-items-baseline justify-content-between mt-2">
              <span className="fs-3 fw-bold text-dark">{summary?.totalGuests}</span>
              <Users size={22} className="text-info" />
            </div>
            <div className="small text-muted mt-1">{summary?.totalStaff} staff operational accounts</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Recharts Visualizations */}
      <div className="row g-4 mb-4">
        {/* Revenue Trends Chart */}
        <div className="col-lg-8">
          <div className="card luxury-card p-4 border-0 bg-white shadow-sm h-100">
            <h5 className="font-serif fw-bold text-dark mb-3">Monthly Revenue Trends (₹)</h5>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e0e0e0' }}
                  />
                  <Bar dataKey="revenue" fill="#c5a880" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Booking Distribution Pie */}
        <div className="col-lg-4">
          <div className="card luxury-card p-4 border-0 bg-white shadow-sm h-100">
            <h5 className="font-serif fw-bold text-dark mb-3">Booking Status Distribution</h5>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="font-serif fw-bold text-dark m-0">Recent Hospitality Reservations</h5>
          <Link to="/admin/bookings" className="small text-warning text-decoration-none fw-semibold">
            View All Bookings ({summary?.totalBookings})
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table align-middle small mb-0">
            <thead className="table-light">
              <tr>
                <th>Reference</th>
                <th>Guest</th>
                <th>Hotel & Suite</th>
                <th>Check-In / Out</th>
                <th>Amount</th>
                <th>Booking Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b._id}>
                  <td className="fw-bold font-monospace">#{b.bookingReference}</td>
                  <td>
                    <strong>{b.userId?.name || b.guestDetails?.name}</strong>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {b.userId?.email || b.guestDetails?.email}
                    </div>
                  </td>
                  <td>
                    <div>{b.hotelId?.name}</div>
                    <span className="badge bg-light text-dark border">Room #{b.roomId?.roomNumber}</span>
                  </td>
                  <td>
                    {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                  </td>
                  <td className="fw-bold">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge-status badge-status-${b.bookingStatus}`}>{b.bookingStatus}</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-secondary border text-capitalize">{b.paymentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
