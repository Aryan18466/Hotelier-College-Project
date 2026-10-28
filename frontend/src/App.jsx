import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Layouts & Global Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import BrowseRooms from './pages/BrowseRooms';
import RoomDetails from './pages/RoomDetails';
import Services from './pages/Services';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import BookingPolicies from './pages/BookingPolicies';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmation from './pages/BookingConfirmation';
import InvoicePage from './pages/InvoicePage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Guest Pages
import GuestDashboard from './pages/guest/GuestDashboard';
import MyBookings from './pages/guest/MyBookings';
import MyReviews from './pages/guest/MyReviews';
import GuestServices from './pages/guest/GuestServices';
import ProfilePage from './pages/guest/ProfilePage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import ArrivalsPage from './pages/staff/ArrivalsPage';
import DeparturesPage from './pages/staff/DeparturesPage';
import RoomStatusGrid from './pages/staff/RoomStatusGrid';
import HousekeepingPage from './pages/staff/HousekeepingPage';
import StaffServiceRequests from './pages/staff/StaffServiceRequests';
import RoomTurnoverDashboard from './pages/staff/RoomTurnoverDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageHotels from './pages/admin/ManageHotels';
import ManageRooms from './pages/admin/ManageRooms';
import ManageCategories from './pages/admin/ManageCategories';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';
import ManageServices from './pages/admin/ManageServices';
import ManagePayments from './pages/admin/ManagePayments';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Utility Pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

function App() {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith('/guest') ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/profile');

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Global Navbar */}
      <Navbar />

      <div className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<BrowseRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/policies" element={<BookingPolicies />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Booking & Payment Flows */}
          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation/:bookingId"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice/:bookingId"
            element={
              <ProtectedRoute>
                <InvoicePage />
              </ProtectedRoute>
            }
          />

          {/* Guest Dashboard Routes */}
          <Route
            path="/guest"
            element={
              <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<GuestDashboard />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="reviews" element={<MyReviews />} />
            <Route path="services" element={<GuestServices />} />
          </Route>

          {/* Shared Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfilePage />} />
          </Route>

          {/* Staff Dashboard Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="arrivals" element={<ArrivalsPage />} />
            <Route path="departures" element={<DeparturesPage />} />
            <Route path="rooms" element={<RoomStatusGrid />} />
            <Route path="housekeeping" element={<HousekeepingPage />} />
            <Route path="turnover" element={<RoomTurnoverDashboard />} />
            <Route path="services" element={<StaffServiceRequests />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="hotels" element={<ManageHotels />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="services" element={<ManageServices />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Fallbacks */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Global Footer (only on public / guest routes, not cluttered inside dashboards) */}
      {!isDashboardRoute && <Footer />}

      {/* Global Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
