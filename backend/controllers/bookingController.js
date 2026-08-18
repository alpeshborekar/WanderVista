const Booking = require('../models/Booking');
const Destination = require('../models/Destination');

const packagePrices = { starter: 1, pro: 1.5, luxury: 2.5 };

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('destination', 'name country flag image price')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { destinationId, packageType, travelers, startDate, endDate, specialRequests } = req.body;
    if (!destinationId || !packageType || !travelers || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const destination = await Destination.findById(destinationId);
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
    const multiplier = packagePrices[packageType] || 1;
    const totalPrice = destination.price * travelers * multiplier;
    const booking = await Booking.create({
      user: req.user._id,
      destination: destinationId,
      packageType,
      travelers,
      startDate,
      endDate,
      totalPrice,
      specialRequests: specialRequests || '',
    });
    const populated = await booking.populate('destination', 'name country flag image price');
    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
