import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, Calendar, MapPin, Printer, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading confirmation...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Reservation Not Found</h4>
        <Link to="/rooms" className="btn btn-gold btn-sm mt-3">
          Explore Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Success Celebration Card */}
            <div className="card luxury-card p-4 p-md-5 border-0 text-center mb-4 shadow-sm">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-inline-flex p-3 mb-3 text-success mx-auto"
                style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}
              >
                <CheckCircle size={44} />
              </div>
              <span className="badge badge-gold d-inline-block mx-auto mb-2 text-uppercase">
                Reservation Confirmed
              </span>
              <h1 className="font-serif fw-bold display-6 mb-2">We Look Forward to Welcoming You</h1>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: '500px' }}>
                Your stay at <strong>{booking.hotelId?.name}</strong> has been successfully booked and confirmed.
              </p>

              {/* Reference Box */}
              <div
                className="p-3 rounded mx-auto mb-4 border"
                style={{ backgroundColor: '#fcfaf6', maxWidth: '360px' }}
              >
                <span className="small text-muted text-uppercase d-block" style={{ letterSpacing: '1px' }}>
                  Booking Reference
                </span>
                <span className="fs-3 fw-bold text-dark font-monospace">#{booking.bookingReference}</span>
              </div>

              {/* Quick Details Table */}
              <div className="text-start bg-light p-4 rounded mb-4 text-secondary small">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Hotel Destination</span>
                    <strong className="text-dark fs-6">{booking.hotelId?.name}</strong>
                    <div>{booking.hotelId?.city}, India</div>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Room Number & Suite</span>
                    <strong className="text-dark fs-6">
                      Room #{booking.roomId?.roomNumber} ({booking.roomId?.categoryId?.name || 'Suite'})
                    </strong>
                    <div>Floor {booking.roomId?.floor || 1}</div>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Check-In Date</span>
                    <strong className="text-dark">{new Date(booking.checkIn).toLocaleDateString()}</strong>
                    <div>From {booking.hotelId?.policies?.checkInTime || '14:00'}</div>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Check-Out Date</span>
                    <strong className="text-dark">{new Date(booking.checkOut).toLocaleDateString()}</strong>
                    <div>Until {booking.hotelId?.policies?.checkOutTime || '11:00'}</div>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Primary Guest</span>
                    <strong className="text-dark">{booking.guestDetails?.name}</strong>
                    <div>{booking.guestDetails?.email}</div>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Total Paid</span>
                    <strong className="text-success fs-6">
                      ₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')} (All Taxes Included)
                    </strong>
                    <div>Status: Paid & Verified</div>
                  </div>
                </div>
              </div>

              <div className="alert alert-light border small text-muted d-flex align-items-center justify-content-center gap-2 mb-4">
                <Mail size={16} className="text-warning" />
                <span>
                  A confirmation voucher has been sent to <strong>{booking.guestDetails?.email}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to={`/invoice/${booking._id}`} className="btn btn-outline-gold d-flex align-items-center gap-2">
                  <Printer size={16} />
                  <span>View Tax Invoice</span>
                </Link>
                <Link to="/guest/bookings" className="btn btn-charcoal d-flex align-items-center gap-2">
                  <span>Go to My Reservations</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
