const express = require('express');
const {
  getServices,
  createService,
  updateService,
  requestService,
  getServiceRequests,
  updateServiceRequestStatus,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('admin'), createService);

router.put('/:id', protect, authorize('admin'), updateService);

router.post('/request', protect, requestService);
router.get('/requests', protect, getServiceRequests);
router.put('/requests/:id', protect, authorize('staff', 'admin'), updateServiceRequestStatus);

module.exports = router;
