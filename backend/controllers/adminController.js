const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Package = require('../models/Package');

const generateAdminToken = (id) => {
  return jwt.sign(
    { id, role: 'admin' },
    process.env.JWT_SECRET || 'wandervista_super_secret_key_2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 1. Admin Login
exports.adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: This portal is reserved for administrators only.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
    }

    const token = generateAdminToken(user._id);

    res.json({
      success: true,
      token,
      admin: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error during admin authentication.' });
  }
};

// 2. Get Authenticated Admin Info
exports.getAdminMe = async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt
    }
  });
};

// 3. Admin Dashboard Analytics & Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const totalPackages = await Package.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const revenueByPackage = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$packageTitle',
          totalRevenue: { $sum: '$totalPrice' },
          bookingsCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 6 }
    ]);

    const categoryAgg = await Package.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalPackages,
        totalCustomers
      },
      charts: {
        revenueByPackage,
        statusDistribution: [
          { status: 'Confirmed', count: confirmedBookings, color: '#16a34a' },
          { status: 'Cancelled', count: cancelledBookings, color: '#dc2626' }
        ],
        categoryDistribution: categoryAgg.map(c => ({ category: c._id, count: c.count }))
      },
      recentBookings
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics.' });
  }
};

// 4. Manage Packages: Get All
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json({ success: true, count: packages.length, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching packages.' });
  }
};

// 5. Manage Packages: Create Package
exports.createPackage = async (req, res) => {
  try {
    const {
      title,
      destination,
      country,
      flag,
      category,
      price,
      duration,
      days,
      nights,
      groupSize,
      coverImage,
      images,
      shortDescription,
      overview,
      included,
      excluded,
      availableDates,
      itinerary
    } = req.body;

    if (!title || !destination || !country || !price || !duration || !coverImage) {
      return res.status(400).json({ success: false, message: 'Please provide all required package fields.' });
    }

    const packageId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const newPackage = await Package.create({
      id: packageId,
      title,
      destination,
      country,
      flag: flag || '✈️',
      category: category || 'Mountain & Alpine',
      price: Number(price),
      duration,
      days: Number(days) || 7,
      nights: Number(nights) || 6,
      groupSize: groupSize || 'Max 12 travelers',
      rating: 5.0,
      reviewCount: 1,
      featured: true,
      coverImage,
      images: images && images.length > 0 ? images : [coverImage],
      shortDescription: shortDescription || overview?.substring(0, 150) || '',
      overview: overview || shortDescription || '',
      included: included || ['Boutique Accommodations', 'Daily Breakfast', 'Certified Tour Guide'],
      excluded: excluded || ['International Flights', 'Travel Insurance'],
      availableDates: availableDates || [new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0]],
      itinerary: itinerary || [{ day: 1, title: 'Arrival & Welcome', description: 'Arrive at destination and meet your tour leader.' }]
    });

    res.status(201).json({ success: true, message: 'Package created successfully.', package: newPackage });
  } catch (err) {
    console.error('Create package error:', err);
    res.status(500).json({ success: false, message: 'Failed to create package.' });
  }
};

// 6. Manage Packages: Update Package
exports.updatePackage = async (req, res) => {
  try {
    const updated = await Package.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    res.json({ success: true, message: 'Package updated successfully.', package: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update package.' });
  }
};

// 7. Manage Packages: Delete Package
exports.deletePackage = async (req, res) => {
  try {
    const deleted = await Package.findOneAndDelete({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    res.json({ success: true, message: 'Package removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete package.' });
  }
};

// 8. Manage Bookings: Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { bookingRef: { $regex: search, $options: 'i' } },
        { packageTitle: { $regex: search, $options: 'i' } },
        { 'leadTraveler.fullName': { $regex: search, $options: 'i' } },
        { 'leadTraveler.email': { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

// 9. Manage Bookings: Update Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    const booking = await Booking.findOne({ $or: [{ _id: req.params.id }, { bookingRef: req.params.id }] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: `Booking status updated to ${status}.`, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
};

// 10. Manage Customers: List All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    // Attach booking count for each customer
    const customerIds = customers.map(c => c._id);
    const bookingCounts = await Booking.aggregate([
      { $match: { user: { $in: customerIds } } },
      { $group: { _id: '$user', count: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } }
    ]);

    const countMap = {};
    bookingCounts.forEach(b => {
      countMap[b._id.toString()] = { count: b.count, totalSpent: b.totalSpent };
    });

    const enrichedCustomers = customers.map(c => ({
      ...c.toObject(),
      totalBookings: countMap[c._id.toString()]?.count || 0,
      totalSpent: countMap[c._id.toString()]?.totalSpent || 0
    }));

    res.json({ success: true, count: enrichedCustomers.length, customers: enrichedCustomers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer list.' });
  }
};
