const express = require('express');
const { getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getDashboardStats);

module.exports = router;
