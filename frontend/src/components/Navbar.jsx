import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Hotel,
  User,
  LogOut,
  Bell,
  CalendarCheck,
  Shield,
  Briefcase,
  Check,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'staff') return '/staff';
    return '/guest';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="luxury-navbar sticky-top">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand Logo */}
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e2022 0%, #2d3033 100%)',
              border: '1px solid #c5a880',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c5a880',
            }}
          >
            <Hotel size={22} />
          </div>
          <div>
            <span className="brand-font fs-4 fw-bold" style={{ color: '#1e2022', letterSpacing: '2px' }}>
              HOTEL<span style={{ color: '#c5a880' }}>IER</span>
            </span>
            <small
              className="d-block text-muted"
              style={{ fontSize: '0.65rem', letterSpacing: '1.5px', marginTop: '-4px', textTransform: 'uppercase' }}
            >
              Luxury Stays & Suites
            </small>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="d-none d-lg-flex align-items-center gap-1">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active text-warning fw-semibold' : ''}`}>
            Home
          </Link>
          <Link to="/rooms" className={`nav-link ${isActive('/rooms') ? 'active text-warning fw-semibold' : ''}`}>
            Rooms & Suites
          </Link>
          <Link to="/services" className={`nav-link ${isActive('/services') ? 'active text-warning fw-semibold' : ''}`}>
            Experiences
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active text-warning fw-semibold' : ''}`}>
            About
          </Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active text-warning fw-semibold' : ''}`}>
            Contact
          </Link>
        </div>

        {/* User / Auth & Actions */}
        <div className="d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Center */}
              <div className="position-relative">
                <button
                  className="btn btn-light rounded-circle p-2 position-relative border"
                  onClick={() => setShowBellDropdown(!showBellDropdown)}
                  title="Notifications"
                >
                  <Bell size={18} className="text-secondary" />
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showBellDropdown && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white rounded shadow-lg border p-3"
                    style={{ width: '320px', zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}
                  >
                    <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                      <h6 className="m-0 fw-bold">Notifications</h6>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-sm btn-link text-decoration-none p-0 text-muted"
                          style={{ fontSize: '0.75rem' }}
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-muted text-center py-3 m-0 small">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className={`p-2 mb-2 rounded border-bottom ${
                            n.isRead ? 'bg-white' : 'bg-light'
                          }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                            if (n.link) {
                              navigate(n.link);
                              setShowBellDropdown(false);
                            }
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold small text-dark">{n.title}</span>
                            {!n.isRead && (
                              <span className="badge bg-primary" style={{ fontSize: '0.6rem' }}>
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-muted small m-0 text-truncate">{n.message}</p>
                          <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-outline-dark d-flex align-items-center gap-2 py-1 px-2 rounded-pill dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={
                      user?.profileImage ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={user?.name}
                    className="rounded-circle"
                    style={{ width: 28, height: 28, objectFit: 'cover' }}
                  />
                  <span className="d-none d-md-inline small fw-semibold text-truncate" style={{ maxWidth: 120 }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span className="badge bg-secondary text-uppercase ms-1" style={{ fontSize: '0.65rem' }}>
                    {user?.role}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userDropdown">
                  <li>
                    <h6 className="dropdown-header text-truncate">Signed in as {user?.email}</h6>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to={getDashboardLink()}>
                      {user?.role === 'admin' && <Shield size={16} className="text-danger" />}
                      {user?.role === 'staff' && <Briefcase size={16} className="text-primary" />}
                      {user?.role === 'guest' && <CalendarCheck size={16} className="text-success" />}
                      <span>{user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'staff' ? 'Staff Portal' : 'My Dashboard'}</span>
                    </Link>
                  </li>
                  {user?.role === 'guest' && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2" to="/guest/bookings">
                        <CalendarCheck size={16} /> My Reservations
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                      <User size={16} /> My Profile
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 text-danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-outline-dark btn-sm px-3">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-gold btn-sm px-3">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="btn btn-light d-lg-none border p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="d-lg-none bg-white border-top p-3 shadow-sm">
          <div className="d-flex flex-column gap-2">
            <Link to="/" className="nav-link py-2" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/rooms" className="nav-link py-2" onClick={() => setMobileMenuOpen(false)}>
              Rooms & Suites
            </Link>
            <Link to="/services" className="nav-link py-2" onClick={() => setMobileMenuOpen(false)}>
              Experiences & Services
            </Link>
            <Link to="/about" className="nav-link py-2" onClick={() => setMobileMenuOpen(false)}>
              About Us
            </Link>
            <Link to="/contact" className="nav-link py-2" onClick={() => setMobileMenuOpen(false)}>
              Contact Concierge
            </Link>
            {isAuthenticated && (
              <Link
                to={getDashboardLink()}
                className="btn btn-charcoal btn-sm text-center mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
