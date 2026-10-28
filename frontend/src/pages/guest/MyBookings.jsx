import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { CalendarCheck, MapPin, AlertCircle, X, ShieldCheck, Printer } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
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
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.bookingStatus === filterStatus;
  });

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    try {
      const res = await api.put(`/bookings/${selectedBookingForCancel._id}/cancel`, {
        reason: cancelReason || 'Cancelled by guest',
      });
      if (res.data.success) {
        toast.success('Reservation cancelled successfully.');
        setSelectedBookingForCancel(null);
        setCancelReason('');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation request failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container py-2">
      <div className="mb-4">
        <h3 className="font-serif fw-bold text-dark mb-1">My Reservations</h3>
        <p className="text-muted small m-0">View upcoming hotel stays, download official invoices, or manage reservations.</p>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-3">
        {['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`btn btn-sm text-capitalize ${
              filterStatus === tab ? 'btn-charcoal' : 'btn-light border'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="skeleton-box" style={{ height: '240px' }}></div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-5 rounded bg-white border text-center text-muted">
          <CalendarCheck size={40} className="text-warning mb-2" />
          <h5 className="font-serif fw-bold text-dark">No Reservations Found</h5>
          <p className="small text-muted mb-3">No bookings currently match the '{filterStatus}' status filter.</p>
          <Link to="/rooms" className="btn btn-gold btn-sm">
            Discover Suites & Rooms
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredBookings.map((b) => (
            <div key={b._id} className="card luxury-card p-4 border-0 bg-white shadow-sm">
              <div className="row g-3 align-items-center">
                <div className="col-lg-7">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-light text-dark border font-monospace">#{b.bookingReference}</span>
                    <span className={`badge-status badge-status-${b.bookingStatus}`}>{b.bookingStatus}</span>
                    <span className="badge bg-light text-secondary border text-capitalize">{b.paymentStatus}</span>
                  </div>

                  <h5 className="font-serif fw-bold text-dark mb-1">{b.hotelId?.name}</h5>
                  <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
                    <MapPin size={14} className="text-warning" />
                    <span>
                      {b.hotelId?.city} • Room #{b.roomId?.roomNumber} ({b.roomId?.categoryId?.name || 'Suite'})
                    </span>
                  </div>

                  <div className="small text-muted">
                    <span>
                      Check-In: <strong>{new Date(b.checkIn).toLocaleDateString()}</strong>
                    </span>{' '}
                    •{' '}
                    <span>
                      Check-Out: <strong>{new Date(b.checkOut).toLocaleDateString()}</strong>
                    </span>{' '}
                    ({b.pricing?.nights} Nights)
                  </div>

                  {b.cancellation?.refundAmount > 0 && (
                    <div className="small text-danger mt-1">
                      Refund Amount: ₹{b.cancellation.refundAmount.toLocaleString('en-IN')} (
                      {b.cancellation.notes})
                    </div>
                  )}
                </div>

                <div className="col-lg-5 text-lg-end">
                  <div className="mb-2">
                    <span className="fs-5 fw-bold text-dark">
                      ₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}
                    </span>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                      All Taxes & Fees Included
                    </small>
                  </div>

                  <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                    {b.paymentStatus === 'unpaid' && b.bookingStatus !== 'cancelled' && (
                      <Link to={`/payment/${b._id}`} className="btn btn-gold btn-sm">
                        Complete Payment
                      </Link>
                    )}

                    {b.paymentStatus === 'paid' && (
                      <Link to={`/invoice/${b._id}`} className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1">
                        <Printer size={14} />
                        <span>Tax Invoice</span>
                      </Link>
                    )}

                    <Link to={`/confirmation/${b._id}`} className="btn btn-charcoal btn-sm">
                      Details
                    </Link>

                    {['pending', 'confirmed'].includes(b.bookingStatus) && (
                      <button
                        onClick={() => setSelectedBookingForCancel(b)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Cancel Stay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      {selectedBookingForCancel && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-serif fw-bold">Cancel Reservation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedBookingForCancel(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-secondary small">
                  Are you sure you wish to cancel reservation{' '}
                  <strong>#{selectedBookingForCancel.bookingReference}</strong> at{' '}
                  <strong>{selectedBookingForCancel.hotelId?.name}</strong>?
                </p>

                <div className="p-3 bg-light rounded border mb-3 small">
                  <div className="d-flex align-items-center gap-2 text-warning mb-1">
                    <AlertCircle size={16} />
                    <strong className="text-dark">Cancellation Policy</strong>
                  </div>
                  <p className="text-muted m-0">
                    Cancellations made 48 hours or more prior to arrival receive a 100% refund. Within 48 hours, 50%
                    retention applies.
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Reason for Cancellation</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    placeholder="Please specify a reason (e.g. flight reschedule, personal emergency)"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={() => setSelectedBookingForCancel(null)}
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                >
                  {cancelling ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
