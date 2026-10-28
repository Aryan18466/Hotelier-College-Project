const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    validate,
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
    validate,
  ],
  login
);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.get('/logout', logout);

module.exports = router;
