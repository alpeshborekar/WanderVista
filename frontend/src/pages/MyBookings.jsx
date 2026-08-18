import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Users, CheckCircle, XCircle, ArrowRight,
  AlertTriangle, Compass, Clock, RotateCcw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { bookingsAPI } from '../services/api';
import styles from './MyBookings.module.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.getMyBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!showCancelModal) return;
    const targetId = showCancelModal._id || showCancelModal.bookingRef;
    setCancellingId(targetId);
    try {
      await bookingsAPI.cancelBooking(targetId);
      setActionMessage('Your booking has been successfully cancelled.');
      setBookings(prev =>
        prev.map(b => (b._id === targetId || b.bookingRef === targetId) ? { ...b, status: 'cancelled' } : b)
      );
      setShowCancelModal(null);
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>My Bookings</h1>
              <p className={styles.subtitle}>
                Review your upcoming expeditions, confirmed reservations, and booking references.
              </p>
            </div>
            <Link to="/" className={styles.newBookingBtn}>
              <Compass size={16} /> Explore New Tours
            </Link>
          </div>

          {actionMessage && (
            <div className={styles.noticeAlert}>
              <CheckCircle size={18} />
              <span>{actionMessage}</span>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <p>Retrieving your travel bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className={styles.emptyCard}>
              <Compass size={48} className={styles.emptyIcon} />
              <h2>No Bookings Found</h2>
              <p>You haven't reserved any travel packages yet. Explore our curated tours to start planning your next journey.</p>
              <Link to="/" className={styles.primaryBtn}>
                Browse All Packages
              </Link>
            </div>
          ) : (
            <div className={styles.bookingList}>
              {bookings.map((b) => {
                const isCancelled = b.status === 'cancelled';
                return (
                  <div key={b._id || b.bookingRef} className={styles.bookingCard}>
                    
                    {/* Thumbnail Image */}
                    <div className={styles.imageCol}>
                      <img
                        src={b.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'}
                        alt={b.packageTitle}
                        className={styles.cardImage}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className={styles.infoCol}>
                      
                      <div className={styles.cardTop}>
                        <div>
                          <div className={styles.refCode}>Ref: {b.bookingRef}</div>
                          <h3 className={styles.pkgTitle}>
                            <Link to={`/packages/${b.packageId}`}>{b.packageTitle}</Link>
                          </h3>
                        </div>

                        <div className={`${styles.statusBadge} ${isCancelled ? styles.statusCancelled : styles.statusConfirmed}`}>
                          {isCancelled ? (
                            <>
                              <XCircle size={14} /> Cancelled
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} /> Confirmed
                            </>
                          )}
                        </div>
                      </div>

                      <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                          <MapPin size={15} />
                          <span>{b.destination}, {b.country}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Calendar size={15} />
                          <span>
                            {new Date(b.departureDate).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <Users size={15} />
                          <span>{b.travelersCount} Traveler{b.travelersCount > 1 ? 's' : ''} ({b.leadTraveler?.fullName})</span>
                        </div>
                      </div>

                      {b.specialRequests && (
                        <div className={styles.requestsSnippet}>
                          <strong>Special Request:</strong> {b.specialRequests}
                        </div>
                      )}

                      {/* Card Footer: Total Price & Actions */}
                      <div className={styles.cardFooter}>
                        <div className={styles.priceWrap}>
                          <span className={styles.priceLabel}>Total Paid</span>
                          <span className={styles.totalAmount}>₹{b.totalPrice?.toLocaleString('en-IN')}</span>
                        </div>

                        <div className={styles.btnGroup}>
                          <Link
                            to={`/booking/confirmation/${b.bookingRef || b._id}`}
                            state={{ booking: b }}
                            className={styles.voucherBtn}
                          >
                            View Receipt
                          </Link>

                          {!isCancelled && (
                            <button
                              onClick={() => setShowCancelModal(b)}
                              className={styles.cancelBtn}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalIconWrap}>
              <AlertTriangle size={28} className={styles.modalAlertIcon} />
            </div>
            <h3 className={styles.modalTitle}>Cancel This Reservation?</h3>
            <p className={styles.modalDesc}>
              Are you sure you want to cancel your booking for <strong>{showCancelModal.packageTitle}</strong> (Ref: {showCancelModal.bookingRef})?
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowCancelModal(null)}
                className={styles.modalKeepBtn}
                disabled={!!cancellingId}
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className={styles.modalConfirmCancelBtn}
                disabled={!!cancellingId}
              >
                {cancellingId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
