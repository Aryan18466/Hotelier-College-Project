import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Printer, ArrowLeft, Hotel, CheckCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const InvoicePage = () => {
  const { bookingId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/payments/booking/${bookingId}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error('Unable to access tax invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Generating invoice...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Invoice Not Found</h4>
        <Link to="/guest" className="btn btn-gold btn-sm mt-3">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { booking, payment } = data;

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Top Control Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4 no-print">
          <Link to="/guest/bookings" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
            <ArrowLeft size={16} /> Back to Reservations
          </Link>
          <button onClick={() => window.print()} className="btn btn-gold btn-sm d-flex align-items-center gap-2">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="card luxury-card p-4 p-md-5 border-0 shadow-sm invoice-container bg-white">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
                    background: '#1e2022',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c5a880',
                  }}
                >
                  <Hotel size={18} />
                </div>
                <span className="brand-font fs-4 fw-bold text-dark">
                  HOTEL<span style={{ color: '#c5a880' }}>IER</span>
                </span>
              </div>
              <small className="text-muted d-block">{booking.hotelId?.name}</small>
              <small className="text-muted d-block">{booking.hotelId?.address}, {booking.hotelId?.city}</small>
              <small className="text-muted d-block">GSTIN: Demo only — not applicable</small>
            </div>

            <div className="text-end">
              <span className="badge bg-light text-dark border px-3 py-1 text-uppercase mb-2">
                Demo Invoice — Not a Tax Document
              </span>
              <h5 className="font-monospace fw-bold text-dark m-0">#{booking.bookingReference}</h5>
              <small className="text-muted d-block">
                Date: {new Date(booking.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>

          {/* Billed To & Stay Details */}
          <div className="row g-4 mb-4 small text-secondary">
            <div className="col-sm-6">
              <h6 className="fw-bold text-dark text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Billed To
              </h6>
              <strong className="text-dark fs-6 d-block">{booking.guestDetails?.name}</strong>
              <div>{booking.guestDetails?.email}</div>
              <div>{booking.guestDetails?.phone}</div>
            </div>

            <div className="col-sm-6 text-sm-end">
              <h6 className="fw-bold text-dark text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Stay Information
              </h6>
              <div>
                <strong>Room:</strong> #{booking.roomId?.roomNumber} ({booking.roomId?.categoryId?.name || 'Suite'})
              </div>
              <div>
                <strong>Check-In:</strong> {new Date(booking.checkIn).toLocaleDateString()}
              </div>
              <div>
                <strong>Check-Out:</strong> {new Date(booking.checkOut).toLocaleDateString()}
              </div>
              <div>
                <strong>Duration:</strong> {booking.pricing.nights} Night{booking.pricing.nights > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th className="text-center">Rate / Night</th>
                  <th className="text-center">Nights</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Accommodation Stay</strong>
                    <div className="text-muted small">
                      {booking.hotelId?.name} – Room #{booking.roomId?.roomNumber}
                    </div>
                  </td>
                  <td className="text-center">₹{booking.pricing.roomPricePerNight.toLocaleString('en-IN')}</td>
                  <td className="text-center">{booking.pricing.nights}</td>
                  <td className="text-end">
                    ₹{(booking.pricing.roomPricePerNight * booking.pricing.nights).toLocaleString('en-IN')}
                  </td>
                </tr>
                {booking.pricing.discountAmount > 0 && (
                  <tr>
                    <td colSpan="3" className="text-success text-end">
                      Promotional Stay Discount:
                    </td>
                    <td className="text-end text-success">
                      -₹{booking.pricing.discountAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan="3" className="text-end fw-semibold">
                    Taxable Subtotal:
                  </td>
                  <td className="text-end">₹{booking.pricing.subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end text-muted">
                    Integrated GST (12%):
                  </td>
                  <td className="text-end">₹{booking.pricing.taxAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="table-light">
                  <td colSpan="3" className="text-end fw-bold fs-6 text-dark">
                    Total Invoice Amount:
                  </td>
                  <td className="text-end fw-bold fs-6 text-dark">
                    ₹{booking.pricing.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Status Stamp */}
          <div className="p-3 rounded bg-light border d-flex align-items-center justify-content-between mb-4 small">
            <div>
              <span className="text-muted d-block">Payment Method:</span>
              <strong className="text-uppercase text-dark">{payment?.provider || 'Verified Gateway'}</strong>
            </div>
            <div>
              <span className="text-muted d-block">Transaction ID:</span>
              <span className="font-monospace text-dark">{payment?.providerPaymentId || payment?._id || 'Verified'}</span>
            </div>
            <div>
              <span className="badge bg-success px-3 py-2 text-uppercase d-flex align-items-center gap-1">
                <CheckCircle size={14} /> Paid in Full
              </span>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-top pt-3 text-center text-muted small" style={{ fontSize: '0.75rem' }}>
            <p className="m-0">
              This is a project-demo invoice preview and is not a valid tax document. For sample contact details, use{' '}
              {booking.hotelId?.contactDetails?.email || 'concierge@hotelier.example'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
