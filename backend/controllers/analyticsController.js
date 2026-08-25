const Booking = require('../models/Booking');
const Package = require('../models/Package');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const totalPackages = await Package.countDocuments();
    const totalUsers = await User.countDocuments();

    // Total revenue from confirmed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Revenue by Package / Destination
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

    // Bookings by Status
    const statusDistribution = [
      { status: 'Confirmed', count: confirmedBookings, color: '#16a34a' },
      { status: 'Cancelled', count: cancelledBookings, color: '#dc2626' }
    ];

    // Packages category breakdown
    const categoryAgg = await Package.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalPackages,
        totalUsers
      },
      charts: {
        revenueByPackage,
        statusDistribution,
        categoryDistribution: categoryAgg.map(c => ({ category: c._id, count: c.count }))
      },
      recentBookings
    });
  } catch (err) {
    console.error('Analytics stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to calculate analytics' });
  }
};
