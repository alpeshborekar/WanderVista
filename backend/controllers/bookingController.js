const Booking = require('../models/Booking');

exports.getMyBookings = async (req, res) => {
  try {
    const query = req.user ? { $or: [{ user: req.user._id }, { 'leadTraveler.email': req.user.email }] } : {};
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ $or: [{ _id: req.params.id }, { bookingRef: req.params.id }] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      packageId,
      packageTitle,
      destination,
      country,
      coverImage,
      departureDate,
      travelersCount,
      leadTraveler,
      additionalTravelers,
      specialRequests,
      pricePerPerson,
      subtotal,
      taxes,
      totalPrice
    } = req.body;

    if (!packageId || !departureDate || !travelersCount || !leadTraveler?.fullName || !leadTraveler?.email) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

    const bookingRef = 'WV-' + Math.floor(100000 + Math.random() * 900000);

    const booking = await Booking.create({
      user: req.user?._id || null,
      packageId,
      packageTitle,
      destination,
      country,
      coverImage,
      departureDate,
      travelersCount: Number(travelersCount),
      leadTraveler,
      additionalTravelers: additionalTravelers || [],
      specialRequests: specialRequests || '',
      pricePerPerson: Number(pricePerPerson),
      subtotal: Number(subtotal),
      taxes: Number(taxes),
      totalPrice: Number(totalPrice),
      bookingRef
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ $or: [{ _id: req.params.id }, { bookingRef: req.params.id }] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
};
