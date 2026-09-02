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

// 1. Admin Login (Private Organization Account)
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
        message: 'Access denied: This portal is reserved exclusively for the organization owner/administrator.'
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

// 2. Get Authenticated Admin Profile
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

// 3. Admin Operations & Analytics Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalPackages = await Package.countDocuments();
    const activePackages = await Package.countDocuments({ isActive: { $ne: false } });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const revenueByPackage = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
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
        pendingBookings,
        confirmedBookings,
        rejectedBookings,
        cancelledBookings,
        completedBookings,
        totalPackages,
        activePackages,
        totalCustomers
      },
      charts: {
        revenueByPackage,
        statusDistribution: [
          { status: 'Pending', count: pendingBookings, color: '#f59e0b' },
          { status: 'Confirmed', count: confirmedBookings, color: '#16a34a' },
          { status: 'Rejected', count: rejectedBookings, color: '#dc2626' },
          { status: 'Cancelled', count: cancelledBookings, color: '#6b7280' },
          { status: 'Completed', count: completedBookings, color: '#2563eb' }
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

// 4. Manage Packages: Get All (including disabled ones)
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
      capacity,
      coverImage,
      images,
      shortDescription,
      overview,
      included,
      excluded,
      availableDates,
      schedule,
      isActive
    } = req.body;

    if (!title || !destination || !country || !price || !duration || !coverImage) {
      return res.status(400).json({ success: false, message: 'Please provide all required package fields.' });
    }

    const packageId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const datesArray = availableDates && availableDates.length > 0
      ? availableDates
      : [new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]];

    const defaultSchedule = schedule && schedule.length > 0
      ? schedule
      : datesArray.map(d => ({ date: d, capacity: Number(capacity) || 12, bookedSpots: 0, isClosed: false }));

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
      groupSize: groupSize || `Max ${capacity || 12} travelers`,
      capacity: Number(capacity) || 12,
      rating: 5.0,
      reviewCount: 1,
      featured: true,
      isActive: isActive !== undefined ? isActive : true,
      coverImage,
      images: images && images.length > 0 ? images : [coverImage],
      shortDescription: shortDescription || overview?.substring(0, 150) || '',
      overview: overview || shortDescription || '',
      included: included || ['Boutique Accommodations', 'Daily Breakfast', 'Certified Tour Guide'],
      excluded: excluded || ['International Flights', 'Travel Insurance'],
      availableDates: datesArray,
      schedule: defaultSchedule,
      itinerary: [
        { day: 1, title: 'Arrival & Welcome', description: 'Arrive at destination and meet your tour leader.' }
      ]
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

// 7. Manage Packages: Toggle Active State
exports.togglePackageActive = async (req, res) => {
  try {
    const pkg = await Package.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    pkg.isActive = !pkg.isActive;
    await pkg.save();

    res.json({
      success: true,
      message: `Package ${pkg.isActive ? 'enabled for customers' : 'disabled from customer listing'}.`,
      isActive: pkg.isActive,
      package: pkg
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle package status.' });
  }
};

// 8. Manage Packages: Delete Package
exports.deletePackage = async (req, res) => {
  try {
    const deleted = await Package.findOneAndDelete({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    res.json({ success: true, message: 'Package removed from platform.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete package.' });
  }
};

// 9. Manage Bookings: Get All Bookings
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

// 10. Manage Bookings: Update Status (Confirm / Reject / Cancel / Complete)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['pending', 'confirmed', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status value.' });
    }

    const booking = await Booking.findOne({ $or: [{ _id: req.params.id }, { bookingRef: req.params.id }] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = status;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;
    await booking.save();

    res.json({
      success: true,
      message: `Booking ${booking.bookingRef} status updated to ${status}.`,
      booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
};

// 11. Manage Availability: Add / Update Departure Date for a Package
exports.updateAvailability = async (req, res) => {
  try {
    const { date, capacity, isClosed, action } = req.body; // action: 'add', 'remove', 'toggleClosed'
    const pkg = await Package.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] });

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    if (!pkg.schedule) pkg.schedule = [];

    if (action === 'add') {
      if (!date) return res.status(400).json({ success: false, message: 'Departure date required.' });
      if (!pkg.availableDates.includes(date)) pkg.availableDates.push(date);
      const existing = pkg.schedule.find(s => s.date === date);
      if (!existing) {
        pkg.schedule.push({
          date,
          capacity: Number(capacity) || pkg.capacity || 12,
          bookedSpots: 0,
          isClosed: false
        });
      }
    } else if (action === 'remove') {
      pkg.availableDates = pkg.availableDates.filter(d => d !== date);
      pkg.schedule = pkg.schedule.filter(s => s.date !== date);
    } else if (action === 'toggleClosed') {
      const item = pkg.schedule.find(s => s.date === date);
      if (item) {
        item.isClosed = !item.isClosed;
      }
    }

    await pkg.save();
    res.json({ success: true, message: 'Availability schedule updated.', schedule: pkg.schedule, availableDates: pkg.availableDates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update availability schedule.' });
  }
};

// 12. Manage Customers: List All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

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
