const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  adminLogin,
  getAdminMe,
  getDashboardStats,
  getAllPackages,
  createPackage,
  updatePackage,
  togglePackageActive,
  deletePackage,
  getAllBookings,
  updateBookingStatus,
  updateAvailability,
  getAllCustomers
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/auth');

// 1. Admin Auth
router.post('/auth/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], adminLogin);

router.get('/auth/me', protectAdmin, getAdminMe);

// 2. Admin Analytics
router.get('/stats', protectAdmin, getDashboardStats);

// 3. Admin Package Management
router.get('/packages', protectAdmin, getAllPackages);
router.post('/packages', protectAdmin, createPackage);
router.put('/packages/:id', protectAdmin, updatePackage);
router.patch('/packages/:id/toggle-active', protectAdmin, togglePackageActive);
router.put('/packages/:id/availability', protectAdmin, updateAvailability);
router.delete('/packages/:id', protectAdmin, deletePackage);

// 4. Admin Booking Management
router.get('/bookings', protectAdmin, getAllBookings);
router.put('/bookings/:id/status', protectAdmin, updateBookingStatus);

// 5. Admin Customer Management
router.get('/customers', protectAdmin, getAllCustomers);

module.exports = router;
