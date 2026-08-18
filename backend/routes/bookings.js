const express = require('express');
const router = express.Router();
const { getMyBookings, getBookingById, createBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Optional auth so demo works even without login or with login
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getMyBookings);
router.get('/:id', getBookingById);
router.post('/', optionalAuth, createBooking);
router.put('/:id/cancel', optionalAuth, cancelBooking);

module.exports = router;
