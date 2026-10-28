const express = require('express');
const {
  getTasks,
  createTask,
  updateTaskStatus,
} = require('../controllers/housekeepingController');
const { getTurnoverDashboard } = require('../controllers/turnoverController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('staff', 'admin'));

// Turnover Intelligence dashboard (must be before /:id)
router.get('/turnover-dashboard', getTurnoverDashboard);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.put('/:id', updateTaskStatus);

module.exports = router;
