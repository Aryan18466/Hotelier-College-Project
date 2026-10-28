const express = require('express');
const {
  addReview,
  getReviews,
  getMyReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, addReview);

router.get('/my', protect, getMyReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
