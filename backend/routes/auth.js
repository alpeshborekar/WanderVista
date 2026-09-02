const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protectCustomer } = require('../middleware/auth');

// Customer registration
router.post('/register', [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], register);

// Customer login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

// Forgot & reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Customer protected profile routes
router.get('/me', protectCustomer, getMe);
router.put('/profile', protectCustomer, updateProfile);
router.put('/change-password', protectCustomer, changePassword);

module.exports = router;
