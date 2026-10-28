import React from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  Star,
  Hotel,
  BedDouble,
  Layers,
  Users,
  CreditCard,
  ClipboardList,
  Sparkles,
  LogOut,
  ArrowLeft,
  LogIn,
  CheckCircle2,
  Clock,
  History,
  Activity,
} from 'lucide-react';

const DashboardLayout = ({ roleRequired }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const renderNavLinks = () => {
    if (user?.role === 'admin') {
      return (
        <>
          <div className="small text-uppercase text-muted fw-bold px-3 mb-2" style={{ fontSize: '0.7rem' }}>
            Executive Control
          </div>
          <NavLink to="/admin" end className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </NavLink>
          <NavLink to="/admin/hotels" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Hotel size={18} />
            <span>Manage Hotels</span>
          </NavLink>
          <NavLink to="/admin/rooms" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <BedDouble size={18} />
            <span>Manage Rooms</span>
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Layers size={18} />
            <span>Room Categories</span>
          </NavLink>
          <NavLink to="/admin/bookings" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <CalendarCheck size={18} />
            <span>All Reservations</span>
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Guests & Staff</span>
          </NavLink>
          <NavLink to="/admin/services" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Sparkles size={18} />
            <span>Hotel Services</span>
          </NavLink>
          <NavLink to="/admin/payments" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <CreditCard size={18} />
            <span>Payment Audit</span>
          </NavLink>
          <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <History size={18} />
            <span>System Audit Logs</span>
          </NavLink>
        </>
      );
    }

    if (user?.role === 'staff') {
      return (
        <>
          <div className="small text-uppercase text-muted fw-bold px-3 mb-2" style={{ fontSize: '0.7rem' }}>
            Front Desk & Operations
          </div>
          <NavLink to="/staff" end className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Operations Dashboard</span>
          </NavLink>
          <NavLink to="/staff/arrivals" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <LogIn size={18} />
            <span>Today's Arrivals</span>
          </NavLink>
          <NavLink to="/staff/departures" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <LogOut size={18} />
            <span>Today's Departures</span>
          </NavLink>
          <NavLink to="/staff/rooms" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <BedDouble size={18} />
            <span>Room Status Grid</span>
          </NavLink>
          <NavLink to="/staff/housekeeping" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={18} />
            <span>Housekeeping Tasks</span>
          </NavLink>
          <NavLink to="/staff/turnover" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Activity size={18} />
            <span>Room Turnover Intel</span>
          </NavLink>
          <NavLink to="/staff/services" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
            <Sparkles size={18} />
            <span>Service Requests</span>
          </NavLink>
        </>
      );
    }

    // Default Guest Links
    return (
      <>
        <div className="small text-uppercase text-muted fw-bold px-3 mb-2" style={{ fontSize: '0.7rem' }}>
          Guest Stays & Profile
        </div>
        <NavLink to="/guest" end className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>My Overview</span>
        </NavLink>
        <NavLink to="/guest/bookings" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <CalendarCheck size={18} />
          <span>My Reservations</span>
        </NavLink>
        <NavLink to="/guest/reviews" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <Star size={18} />
          <span>My Reviews</span>
        </NavLink>
        <NavLink to="/guest/services" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <Sparkles size={18} />
          <span>Requested Services</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <User size={18} />
          <span>Profile Settings</span>
        </NavLink>
      </>
    );
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <aside className="dashboard-sidebar d-none d-lg-block" style={{ width: '260px', flexShrink: 0 }}>
        {/* User Card */}
        <div className="p-3 mb-4 rounded bg-light border d-flex align-items-center gap-3">
          <img
            src={
              user?.profileImage ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            }
            alt={user?.name}
            className="rounded-circle border"
            style={{ width: 44, height: 44, objectFit: 'cover' }}
          />
          <div className="overflow-hidden">
            <h6 className="m-0 fw-bold text-dark text-truncate">{user?.name}</h6>
            <span className="badge bg-secondary text-uppercase mt-1" style={{ fontSize: '0.65rem' }}>
              {user?.role} Portal
            </span>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="d-flex flex-column mb-4">{renderNavLinks()}</nav>

        {/* Bottom Utility */}
        <div className="border-top pt-3 d-flex flex-column gap-2">
          <Link to="/" className="sidebar-nav-link text-muted">
            <ArrowLeft size={16} />
            <span>Return to Public Site</span>
          </Link>
          <button
            onClick={logout}
            className="sidebar-nav-link text-danger border-0 bg-transparent text-start w-100"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow-1 p-3 p-md-4 overflow-auto" style={{ maxWidth: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
