const Booking = require('../models/Booking');
const Package = require('../models/Package');

exports.getMyBookings = async (req, res) => {
  try {
    const query = req.user ? { $or: [{ user: req.user._id }, { 'leadTraveler.email': req.user.email }] } : {};
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching customer bookings.' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ $or: [{ _id: req.params.id }, { bookingRef: req.params.id }] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reservation not found.' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving booking.' });
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
      return res.status(400).json({ success: false, message: 'Missing required reservation fields.' });
    }

    // Verify package is active
    const pkg = await Package.findOne({
      $or: [{ id: packageId }, { _id: packageId }]
    });

    if (!pkg || pkg.isActive === false) {
      return res.status(400).json({ success: false, message: 'This tour package is currently closed for bookings.' });
    }

    // Check date availability if schedule exists
    if (pkg.schedule && pkg.schedule.length > 0) {
      const scheduleItem = pkg.schedule.find(s => s.date === departureDate);
      if (scheduleItem) {
        if (scheduleItem.isClosed) {
          return res.status(400).json({ success: false, message: 'This departure date is closed by the organization.' });
        }
        const remaining = (scheduleItem.capacity || 12) - (scheduleItem.bookedSpots || 0);
        if (Number(travelersCount) > remaining) {
          return res.status(400).json({
            success: false,
            message: `Only ${remaining} spot${remaining === 1 ? '' : 's'} available on this departure date.`
          });
        }
        // Update booked spots
        scheduleItem.bookedSpots = (scheduleItem.bookedSpots || 0) + Number(travelersCount);
        await pkg.save();
      }
    }

    const bookingRef = 'WV-' + Math.floor(100000 + Math.random() * 900000);

    // Initial status is ALWAYS 'pending' per organization requirement
    const booking = await Booking.create({
      user: req.user?._id || null,
      packageId,
      packageTitle: pkg.title || packageTitle,
      destination: pkg.destination || destination,
      country: pkg.country || country,
      coverImage: pkg.coverImage || coverImage,
      departureDate,
      travelersCount: Number(travelersCount),
      leadTraveler,
      additionalTravelers: additionalTravelers || [],
      specialRequests: specialRequests || '',
      pricePerPerson: Number(pricePerPerson || pkg.price),
      subtotal: Number(subtotal),
      taxes: Number(taxes),
      totalPrice: Number(totalPrice),
      status: 'pending',
      bookingRef
    });

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully and is pending organization confirmation.',
      booking
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking reservation.' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ $or: [{ _id: req.params.id }, { bookingRef: req.params.id }] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reservation not found.' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Your booking has been cancelled.', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error cancelling booking.' });
  }
};
