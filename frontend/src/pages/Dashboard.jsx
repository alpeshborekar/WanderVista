import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Package, CheckCircle, Clock, XCircle, TrendingUp, Compass, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import styles from './Dashboard.module.css';

const STATUS_CONFIG = {
  confirmed: { icon: CheckCircle, color: '#10b981', bg: '#f0fdf4', label: 'Confirmed' },
  pending: { icon: Clock, color: '#f59e0b', bg: '#fffbeb', label: 'Pending' },
  cancelled: { icon: XCircle, color: '#ef4444', bg: '#fef2f2', label: 'Cancelled' },
  completed: { icon: CheckCircle, color: '#3b82f6', bg: '#eff6ff', label: 'Completed' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    bookingsAPI.getMyBookings()
      .then(data => setBookings(data.bookings))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancelBooking(id);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert('Failed to cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    spent: bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0),
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        {/* Welcome Header */}
        <motion.div className={styles.welcomeCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.avatarLarge}>{initials}</div>
          <div className={styles.welcomeText}>
            <h1>Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
            <p>{user?.email} · {user?.country || 'Explorer'}</p>
          </div>
          <div className={styles.welcomeActions}>
            <Link to="/destinations" className={styles.exploreBtn}><Compass size={18} /> Explore Destinations</Link>
            <Link to="/profile" className={styles.profileBtn}>Edit Profile</Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {[
            { label: 'Total Trips', value: stats.total, icon: MapPin, color: '#3b82f6' },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: '#10b981' },
            { label: 'Completed', value: stats.completed, icon: TrendingUp, color: '#6366f1' },
            { label: 'Total Spent', value: `₹${stats.spent.toLocaleString('en-IN')}`, icon: Package, color: '#f59e0b' },
          ].map((stat, i) => (
            <motion.div key={stat.label} className={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className={styles.statIcon} style={{ background: stat.color + '20', color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bookings */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Bookings</h2>
            <Link to="/destinations" className={styles.newBookingBtn}><ArrowRight size={16} /> New Booking</Link>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🗺️</span>
              <h3>No bookings yet</h3>
              <p>Start your adventure by booking a destination!</p>
              <Link to="/destinations" className={styles.exploreBtn}><Compass size={16} /> Explore Now</Link>
            </div>
          ) : (
            <div className={styles.bookingsGrid}>
              {bookings.map((booking, i) => {
                const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;
                return (
                  <motion.div key={booking._id} className={styles.bookingCard}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    {booking.destination?.image && (
                      <div className={styles.bookingImg}>
                        <img src={booking.destination.image} alt={booking.destination?.name} />
                      </div>
                    )}
                    <div className={styles.bookingBody}>
                      <div className={styles.bookingTop}>
                        <h3 className={styles.destName}>
                          <MapPin size={16} />
                          {booking.destination?.name || 'Destination'}, {booking.destination?.country}
                        </h3>
                        <span className={styles.statusBadge} style={{ color: statusCfg.color, background: statusCfg.bg }}>
                          <StatusIcon size={14} />{statusCfg.label}
                        </span>
                      </div>

                      <div className={styles.bookingMeta}>
                        <span><Calendar size={14} /> {new Date(booking.startDate).toLocaleDateString('en-IN')} – {new Date(booking.endDate).toLocaleDateString('en-IN')}</span>
                        <span><Users size={14} /> {booking.travelers} travelers</span>
                        <span><Package size={14} /> {booking.packageType} plan</span>
                      </div>

                      <div className={styles.bookingFooter}>
                        <div className={styles.bookingPrice}>₹{booking.totalPrice.toLocaleString('en-IN')}</div>
                        <div className={styles.bookingRef}>Ref: {booking.bookingRef}</div>
                        {booking.status === 'confirmed' && (
                          <button className={styles.cancelBtn} onClick={() => handleCancel(booking._id)}
                            disabled={cancelling === booking._id}>
                            {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
