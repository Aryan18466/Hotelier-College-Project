const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Add review for a completed or verified stay
// @route   POST /api/reviews
// @access  Private (Guest)
exports.addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId, rating (1-5), and review comment',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Verify ownership
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review your own stays' });
    }

    // Must be paid and confirmed or completed
    if (booking.paymentStatus !== 'paid' || booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed or confirmed paid stays',
      });
    }

    // Check if review already submitted
    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this stay',
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      hotelId: booking.hotelId,
      roomId: booking.roomId,
      bookingId: booking._id,
      rating: Number(rating),
      comment,
      isVerifiedStay: true,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a hotel or room
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const { hotelId, roomId } = req.query;
    const query = {};

    if (hotelId) query.hotelId = hotelId;
    if (roomId) query.roomId = roomId;

    const reviews = await Review.find(query)
      .populate('userId', 'name profileImage')
      .populate('hotelId', 'name')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user reviews
// @route   GET /api/reviews/my
// @access  Private (Guest)
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('hotelId', 'name city')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Author / Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
