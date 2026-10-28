import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Star, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Review Form State
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, bookingsRes] = await Promise.all([
        api.get('/reviews/my'),
        api.get('/bookings/my'),
      ]);

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data);
      }

      if (bookingsRes.data.success) {
        // Filter paid stays
        const eligible = bookingsRes.data.data.filter(
          (b) => b.paymentStatus === 'paid' && b.bookingStatus !== 'cancelled'
        );
        setEligibleBookings(eligible);
        if (eligible.length > 0) {
          setSelectedBookingId(eligible[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load review data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBookingId || !comment.trim()) {
      toast.warning('Please select a stay and write your feedback');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: selectedBookingId,
        rating: Number(rating),
        comment,
      });

      if (res.data.success) {
        toast.success('Thank you! Your verified review has been published.');
        setComment('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.data.success) {
        toast.success('Review removed');
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="container py-2">
      <div className="mb-4">
        <h3 className="font-serif fw-bold text-dark mb-1">My Stay Reviews & Feedback</h3>
        <p className="text-muted small m-0">Share your experiences and assist fellow travelers with verified reviews.</p>
      </div>

      <div className="row g-4">
        {/* Form to submit review */}
        <div className="col-lg-5">
          <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
            <h5 className="font-serif fw-bold mb-3 d-flex align-items-center gap-2">
              <MessageSquare size={18} className="text-warning" />
              <span>Review a Recent Stay</span>
            </h5>

            {eligibleBookings.length === 0 ? (
              <p className="text-muted small">
                You do not have any completed or confirmed stays eligible for review yet.
              </p>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Select Reservation</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                  >
                    {eligibleBookings.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.hotelId?.name} – Room #{b.roomId?.roomNumber} (#{b.bookingReference})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Overall Rating</label>
                  <div className="d-flex align-items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className="btn btn-link p-0 text-warning"
                        onClick={() => setRating(star)}
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? '#c5a880' : 'none'}
                          stroke="#c5a880"
                        />
                      </button>
                    ))}
                    <span className="small text-muted ms-2">{rating} out of 5 Stars</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Detailed Comments</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="4"
                    placeholder="Describe the room quality, cleanliness, staff attentiveness, and dining experiences..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-gold btn-sm w-100 py-2" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Previous Reviews List */}
        <div className="col-lg-7">
          <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
            <h5 className="font-serif fw-bold mb-3">My Submitted Reviews ({reviews.length})</h5>

            {loading ? (
              <div className="skeleton-box" style={{ height: '140px' }}></div>
            ) : reviews.length === 0 ? (
              <p className="text-muted small m-0">You have not submitted any reviews yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-3 rounded border bg-light">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong className="text-dark d-block">
                          {rev.hotelId?.name} • Room #{rev.roomId?.roomNumber}
                        </strong>
                        <div className="d-flex text-warning mt-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="#c5a880" stroke="#c5a880" />
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="btn btn-sm btn-link text-danger p-0"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-secondary small m-0">{rev.comment}</p>
                    <small className="text-muted d-block mt-2" style={{ fontSize: '0.7rem' }}>
                      Published on {new Date(rev.createdAt).toLocaleDateString()} • Verified Stay
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReviews;
