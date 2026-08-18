const express = require('express');
const router = express.Router();
const { getMyBookings, createBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyBookings);
router.post('/', protect, createBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
