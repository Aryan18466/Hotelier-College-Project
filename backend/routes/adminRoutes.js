const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
