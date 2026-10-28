import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  MapPin,
  Users,
  Bed,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Star,
  Clock,
  ArrowLeft,
  Calendar,
  Share2,
} from 'lucide-react';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 5.0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  // Booking Card Inputs
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');

  // Live Availability & Price Calculation State
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [conflictingBooking, setConflictingBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        if (res.data.success) {
          setRoom(res.data.data);
          setReviews(res.data.reviews || []);
          setReviewStats(res.data.reviewStats || { avgRating: 5.0, totalReviews: 0 });
          if (res.data.data.images && res.data.data.images.length > 0) {
            setActiveImage(res.data.data.images[0]);
          }
        }
      } catch (err) {
        toast.error('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  // Whenever dates change, run availability check
  useEffect(() => {
    if (checkIn && checkOut && new Date(checkOut) > new Date(checkIn)) {
      const checkAvail = async () => {
        setAvailabilityChecking(true);
        try {
          const res = await api.get(`/rooms/${id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
          setIsAvailable(res.data.isAvailable);
          setConflictingBooking(res.data.conflictingBooking);
        } catch (err) {
          setIsAvailable(false);
        } finally {
          setAvailabilityChecking(false);
        }
      };
      checkAvail();
    } else {
      setIsAvailable(null);
    }
  }, [id, checkIn, checkOut]);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading room...</span>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container py-5 text-center">
        <h4>Room Not Found</h4>
        <Link to="/rooms" className="btn btn-gold btn-sm mt-3">
          Browse Rooms
        </Link>
      </div>
    );
  }

  // Calculate pricing breakdown
  const nights =
    checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
      ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
      : 1;

  const baseRate = room.price;
  const rawSubtotal = baseRate * nights;
  const discountPercent = room.discountPercentage || 0;
  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const subtotal = rawSubtotal - discountAmount;
  const taxAmount = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + taxAmount;

  const handleCreateReservation = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in or register to complete your reservation');
      navigate(`/login?redirect=/rooms/${id}`);
      return;
    }

    if (!checkIn || !checkOut) {
      toast.warning('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (isAvailable === false) {
      toast.error('Room is not available for the selected dates. Please adjust your calendar.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', {
        roomId: room._id,
        checkIn,
        checkOut,
        guestCount: {
          adults: Number(adults),
          children: Number(childrenCount),
        },
        guestDetails: {
          name: user.name,
          email: user.email,
          phone: user.phone || '+91 98765 00000',
          specialRequests,
        },
      });

      if (res.data.success) {
        toast.success('Reservation initiated! Please proceed to secure payment.');
        navigate(`/payment/${res.data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize booking');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 d-flex align-items-center justify-content-between">
          <Link to="/rooms" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
            <ArrowLeft size={16} /> Back to All Rooms
          </Link>
          <div className="d-flex align-items-center gap-2 text-muted small">
            <MapPin size={14} className="text-warning" />
            <span>
              {room.hotelId?.name} • {room.hotelId?.city}
            </span>
          </div>
        </div>

        {/* Room Title Header */}
        <div className="mb-4">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span className="badge badge-gold">{room.categoryId?.name}</span>
            <span className="badge bg-dark">Room #{room.roomNumber}</span>
            <span className="badge bg-light text-dark border">Floor {room.floor}</span>
            {room.discountPercentage > 0 && (
              <span className="badge bg-danger text-white">{room.discountPercentage}% Special Offer</span>
            )}
          </div>
          <h1 className="font-serif fw-bold display-5 mb-2">{room.categoryId?.name}</h1>
          <div className="d-flex align-items-center gap-3 text-secondary small">
            <div className="d-flex align-items-center gap-1">
              <Star size={16} fill="#c5a880" stroke="#c5a880" />
              <strong className="text-dark">{reviewStats.avgRating ? reviewStats.avgRating.toFixed(1) : '5.0'}</strong>
              <span>({reviewStats.totalReviews || reviews.length} verified stays)</span>
            </div>
            <span>•</span>
            <div className="d-flex align-items-center gap-1">
              <Users size={16} />
              <span>
                Up to {room.capacity.adults} Adults, {room.capacity.children} Children
              </span>
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="row g-3 mb-5">
          <div className="col-lg-8">
            <div className="rounded overflow-hidden shadow-sm" style={{ height: '460px' }}>
              <img
                src={
                  activeImage ||
                  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
                }
                alt="Room view"
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-3 h-100">
              {(room.images || []).map((img, idx) => (
                <div
                  key={idx}
                  className={`rounded overflow-hidden border ${activeImage === img ? 'border-warning border-2' : ''}`}
                  style={{ height: '140px', cursor: 'pointer' }}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content & Booking Sticky Card Row */}
        <div className="row g-5">
          {/* Left Column: Room Overview & Amenities & Reviews */}
          <div className="col-lg-7">
            {/* Description */}
            <div className="mb-5">
              <h4 className="font-serif fw-bold mb-3">Suite Overview</h4>
              <p className="text-secondary leading-relaxed mb-4">
                {room.categoryId?.description ||
                  'Impeccably appointed luxury accommodation featuring handcrafted finishes, opulent marble bathroom, panoramic views, and signature Hotelier amenities.'}
              </p>

              <div className="p-3 rounded bg-light border d-flex flex-wrap gap-4 text-dark small">
                <div>
                  <span className="text-muted d-block">Bed Configuration</span>
                  <strong>California King Bed</strong>
                </div>
                <div>
                  <span className="text-muted d-block">Occupancy</span>
                  <strong>{room.capacity.adults} Adults + {room.capacity.children} Child</strong>
                </div>
                <div>
                  <span className="text-muted d-block">Location</span>
                  <strong>Floor {room.floor} ({room.hotelId?.name})</strong>
                </div>
              </div>
            </div>

            {/* Exclusive Amenities */}
            <div className="mb-5">
              <h4 className="font-serif fw-bold mb-3">Amenities & Inclusions</h4>
              <div className="row g-2">
                {(room.amenities || []).map((item, index) => (
                  <div key={index} className="col-md-6">
                    <div className="d-flex align-items-center gap-2 p-2 rounded bg-white border">
                      <Sparkles size={16} className="text-warning flex-shrink-0" />
                      <span className="small text-dark fw-medium">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="mb-5 p-4 rounded bg-white border">
              <h5 className="font-serif fw-bold mb-3">Hotel & Cancellation Policy</h5>
              <div className="d-flex flex-column gap-2 text-secondary small">
                <div className="d-flex align-items-center gap-2">
                  <Clock size={16} className="text-warning" />
                  <span>
                    Check-in: <strong>{room.hotelId?.policies?.checkInTime || '14:00'}</strong> | Check-out:{' '}
                    <strong>{room.hotelId?.policies?.checkOutTime || '11:00'}</strong>
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={16} className="text-success" />
                  <span>
                    {room.hotelId?.policies?.cancellationPolicy ||
                      'Free cancellation up to 48 hours prior to check-in. 100% refund guaranteed.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Reviews */}
            <div className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h4 className="font-serif fw-bold m-0">Verified Guest Reviews</h4>
                <div className="d-flex align-items-center gap-1 text-warning">
                  <Star size={18} fill="#c5a880" stroke="#c5a880" />
                  <span className="fw-bold text-dark fs-5">{reviewStats.avgRating ? reviewStats.avgRating.toFixed(1) : '5.0'}</span>
                  <span className="text-muted small">/ 5.0</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="p-4 rounded bg-white border text-center text-muted small">
                  Be among the first guests to leave a verified stay review for this suite.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded bg-white border">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={
                              rev.userId?.profileImage ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                            }
                            alt="Guest"
                            className="rounded-circle"
                            style={{ width: 34, height: 34, objectFit: 'cover' }}
                          />
                          <div>
                            <span className="fw-bold small text-dark d-block">{rev.userId?.name || 'Verified Guest'}</span>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex text-warning">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="#c5a880" stroke="#c5a880" />
                          ))}
                        </div>
                      </div>
                      <p className="text-secondary small m-0">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Interactive Booking Widget */}
          <div className="col-lg-5">
            <div className="card luxury-card p-4 border-0 sticky-top shadow-md" style={{ top: '90px' }}>
              <div className="d-flex align-items-baseline justify-content-between border-bottom pb-3 mb-3">
                <div>
                  <span className="fs-3 fw-bold text-dark">
                    ₹{(room.price * (1 - (room.discountPercentage || 0) / 100)).toLocaleString('en-IN')}
                  </span>
                  <span className="text-muted small"> / night</span>
                  {room.discountPercentage > 0 && (
                    <div className="small text-danger fw-semibold">
                      Save {room.discountPercentage}% from standard rate ₹{room.price.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
                <span className="badge bg-light text-success border">Instant Booking</span>
              </div>

              {/* Form Controls */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Check-In Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Check-Out Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Adults</label>
                  <select
                    className="form-select"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                  >
                    {[...Array(room.capacity.adults)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Adult{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Children</label>
                  <select
                    className="form-select"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                  >
                    {[...Array((room.capacity.children || 0) + 1)].map((_, i) => (
                      <option key={i} value={i}>
                        {i} Children
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Special Requests (Optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. airport pickup, quiet room, late check-in"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                ></textarea>
              </div>

              {/* Availability Alert Banner */}
              {availabilityChecking && (
                <div className="alert alert-info py-2 small d-flex align-items-center gap-2 mb-3">
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  <span>Checking room availability...</span>
                </div>
              )}

              {isAvailable === true && (
                <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
                  <CheckCircle size={16} />
                  <span>Room is available for these dates!</span>
                </div>
              )}

              {isAvailable === false && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} />
                  <span>Room is reserved for overlapping dates. Choose different dates.</span>
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="bg-light p-3 rounded mb-4 text-secondary small">
                <div className="d-flex justify-content-between mb-1">
                  <span>
                    ₹{baseRate.toLocaleString('en-IN')} × {nights} Night{nights > 1 ? 's' : ''}
                  </span>
                  <span>₹{rawSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-success mb-1">
                    <span>Special Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-1">
                  <span>Goods & Services Tax (12% GST)</span>
                  <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-top pt-2 mt-2 d-flex justify-content-between text-dark fw-bold fs-6">
                  <span>Total Due</span>
                  <span className="text-dark">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn btn-gold w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                onClick={handleCreateReservation}
                disabled={bookingLoading || isAvailable === false}
              >
                {bookingLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Creating Reservation...</span>
                  </>
                ) : (
                  <span>Reserve Suite</span>
                )}
              </button>

              <div className="text-center mt-3 text-muted small" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={14} className="text-warning me-1" />
                Guaranteed Best Rate • Direct Hotel Confirmation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
