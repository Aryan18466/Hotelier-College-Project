import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [paymentMode, setPaymentMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const [bookingRes, paymentModeRes] = await Promise.all([
          api.get(`/bookings/${bookingId}`),
          api.get('/payments/mode'),
        ]);
        if (bookingRes.data.success) {
          setBooking(bookingRes.data.data);
          // If already paid, redirect straight to confirmation
          if (bookingRes.data.data.paymentStatus === 'paid') {
            navigate(`/confirmation/${bookingId}`);
          }
        }
        if (
          !paymentModeRes.data.success ||
          typeof paymentModeRes.data.demoEnabled !== 'boolean' ||
          typeof paymentModeRes.data.razorpayEnabled !== 'boolean'
        ) {
          throw new Error('Payment mode is unavailable');
        }
        setPaymentMode(paymentModeRes.data);
        if (!paymentModeRes.data.razorpayEnabled) {
          setCheckoutError('Razorpay checkout is not configured. No real payment can be processed at this time.');
        }
      } catch (err) {
        setCheckoutError('Checkout is currently unavailable. Please retry or contact the hotel.');
        toast.error('Unable to initialize checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  // Razorpay Gateway Checkout
  const handleRazorpayPayment = async () => {
    setCheckoutError('');
    if (!paymentMode?.razorpayEnabled) {
      setCheckoutError('Razorpay checkout is not configured. Please try again later or contact the hotel.');
      return;
    }

    if (!window.Razorpay) {
      setCheckoutError('The Razorpay checkout could not load. Please retry.');
      return;
    }

    setProcessing(true);
    try {
      const orderRes = await api.post('/payments/create-order', { bookingId });
      if (!orderRes.data.success) {
        toast.error('Failed to initiate payment gateway');
        setProcessing(false);
        return;
      }

      const { orderId, amount, currency, keyId, mode } = orderRes.data;

      if (mode !== 'razorpay_live_or_test' || !orderId || !amount || !currency || !keyId) {
        setCheckoutError('The payment gateway returned an unexpected checkout mode. No payment was processed.');
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Hotelier Luxury Hospitality',
        description: `Reservation #${booking.bookingReference}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success('Payment verified successfully!');
              navigate(`/confirmation/${bookingId}`);
            }
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: booking.guestDetails?.name,
          email: booking.guestDetails?.email,
          contact: booking.guestDetails?.phone,
        },
        theme: {
          color: '#c5a880',
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      razorpayInstance.open();
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Unable to initialize Razorpay checkout. Please retry.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDemoPayment = async () => {
    setCheckoutError('');
    if (!paymentMode?.demoEnabled) {
      setCheckoutError('Demo payment mode is not enabled. No payment was processed.');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post('/payments/test-payment', { bookingId });
      if (res.data.success) {
        toast.success('Demo payment recorded. No real payment was processed.');
        navigate(`/confirmation/${bookingId}`);
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Demo payment could not be completed. No payment was processed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading payment...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Reservation Not Found</h4>
      </div>
    );
  }

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="mb-4">
              <span className="badge badge-gold mb-2">Secure Checkout</span>
              <h2 className="font-serif fw-bold">Complete Your Reservation</h2>
              <p className="text-muted m-0">
                Booking Reference: <strong className="text-dark">#{booking.bookingReference}</strong>
              </p>
            </div>

            {/* Reservation Summary Card */}
            <div className="card luxury-card p-4 border-0 mb-4 shadow-sm">
              <h5 className="font-serif fw-bold mb-3 border-bottom pb-2">Reservation Summary</h5>
              <div className="row g-3 text-secondary small mb-3">
                <div className="col-md-6">
                  <span className="text-muted d-block">Hotel</span>
                  <strong className="text-dark fs-6">{booking.hotelId?.name}</strong>
                  <div>{booking.hotelId?.city}, India</div>
                </div>
                <div className="col-md-6">
                  <span className="text-muted d-block">Accommodation</span>
                  <strong className="text-dark fs-6">{booking.roomId?.categoryId?.name || 'Luxury Suite'}</strong>
                  <div>Room #{booking.roomId?.roomNumber}</div>
                </div>
                <div className="col-md-6">
                  <span className="text-muted d-block">Check-In</span>
                  <strong className="text-dark">{new Date(booking.checkIn).toLocaleDateString()}</strong>
                  <div>From {booking.hotelId?.policies?.checkInTime || '14:00'}</div>
                </div>
                <div className="col-md-6">
                  <span className="text-muted d-block">Check-Out</span>
                  <strong className="text-dark">{new Date(booking.checkOut).toLocaleDateString()}</strong>
                  <div>Until {booking.hotelId?.policies?.checkOutTime || '11:00'}</div>
                </div>
                <div className="col-md-12">
                  <span className="text-muted d-block">Guest Information</span>
                  <strong className="text-dark">
                    {booking.guestDetails?.name} ({booking.guestDetails?.email}, {booking.guestDetails?.phone})
                  </strong>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-light p-3 rounded text-secondary small">
                <div className="d-flex justify-content-between mb-1">
                  <span>
                    Room Rate ({booking.pricing.nights} Night{booking.pricing.nights > 1 ? 's' : ''})
                  </span>
                  <span>₹{(booking.pricing.roomPricePerNight * booking.pricing.nights).toLocaleString('en-IN')}</span>
                </div>
                {booking.pricing.discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-success mb-1">
                    <span>Promotional Discount</span>
                    <span>-₹{booking.pricing.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-1">
                  <span>GST Taxes (12%)</span>
                  <span>₹{booking.pricing.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-top pt-2 mt-2 d-flex justify-content-between text-dark fw-bold fs-5">
                  <span>Total Amount Due</span>
                  <span style={{ color: '#ab8d64' }}>₹{booking.pricing.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Options Card */}
            <div className="card luxury-card p-4 border-0 mb-4 shadow-sm">
              <h5 className="font-serif fw-bold mb-3 d-flex align-items-center gap-2">
                <Lock size={18} className="text-warning" />
                <span>Select Payment Method</span>
              </h5>

              <p className="text-muted small mb-4">
                Gateway payments are processed by Razorpay. Demo mode, when explicitly enabled by the backend, never charges a card.
              </p>

              {checkoutError && (
                <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3 small" role="alert">
                  <span>{checkoutError}</span>
                  <button className="btn btn-outline-danger btn-sm flex-shrink-0" onClick={handleRazorpayPayment} disabled={processing}>
                    Retry Razorpay
                  </button>
                </div>
              )}

              {/* Live Razorpay Checkout Option */}
              <div className="p-3 border rounded mb-3 bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded bg-light border text-warning">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h6 className="m-0 fw-bold">Razorpay Payment Gateway</h6>
                    <small className="text-muted">UPI, Credit/Debit Cards, NetBanking, Wallets</small>
                  </div>
                </div>
                <button
                  className="btn btn-gold px-4"
                  onClick={handleRazorpayPayment}
                  disabled={processing || !paymentMode?.razorpayEnabled}
                >
                  {processing ? 'Processing...' : paymentMode?.razorpayEnabled ? `Pay ₹${booking.pricing.totalAmount.toLocaleString('en-IN')}` : 'Gateway unavailable'}
                </button>
              </div>

              {paymentMode?.demoEnabled && (
                <div className="p-3 border border-warning rounded bg-warning bg-opacity-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 text-warning mb-1">
                      <AlertTriangle size={16} />
                      <strong className="text-dark small">Demo Payment — No Real Charge</strong>
                    </div>
                    <p className="text-muted small m-0" style={{ maxWidth: '420px' }}>
                      This developer/demo-only option confirms a reservation without contacting Razorpay or charging a payment method.
                    </p>
                  </div>
                  <button
                    className="btn btn-charcoal btn-sm px-3 flex-shrink-0"
                    onClick={handleDemoPayment}
                    disabled={processing}
                  >
                    Confirm Demo Payment
                  </button>
                </div>
              )}
            </div>

            <div className="d-flex align-items-center justify-content-between text-muted small">
              <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-muted p-0 small">
                <ArrowLeft size={14} className="me-1" /> Return to Room
              </button>
              <div className="d-flex align-items-center gap-1">
                <ShieldCheck size={16} className="text-success" />
                <span>Verified SSL Hospitality Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
