import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Users, MapPin, Download, Printer, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { bookingsAPI } from '../services/api';
import styles from './BookingConfirmation.module.css';

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);

  useEffect(() => {
    if (!booking && id) {
      bookingsAPI.getBookingById(id)
        .then(res => {
          if (res.booking) setBooking(res.booking);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingContainer}>Loading confirmation details...</div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.errorContainer}>
          <h2>Booking Record Found</h2>
          <p>Your booking has been saved. You can manage and review it in My Bookings.</p>
          <Link to="/my-bookings" className={styles.primaryBtn}>
            Go to My Bookings
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          
          {/* Success Banner */}
          <div className={styles.successBanner}>
            <div className={styles.successIconWrapper}>
              <CheckCircle size={44} className={styles.successIcon} />
            </div>
            <h1 className={styles.successTitle}>Booking Confirmed!</h1>
            <p className={styles.successDesc}>
              Thank you, <strong>{booking.leadTraveler?.fullName}</strong>. Your tour package reservation has been confirmed and registered.
            </p>
            <div className={styles.refTag}>
              <span>Booking Reference:</span>
              <strong>{booking.bookingRef || id}</strong>
            </div>
          </div>

          {/* Detailed Receipt Card */}
          <div className={styles.receiptCard}>
            
            <div className={styles.receiptHeader}>
              <div>
                <h2 className={styles.receiptTitle}>{booking.packageTitle}</h2>
                <div className={styles.receiptLocation}>
                  <MapPin size={15} />
                  <span>{booking.destination}, {booking.country}</span>
                </div>
              </div>
              <div className={styles.statusPill}>
                <span className={styles.statusDot} />
                Confirmed
              </div>
            </div>

            <div className={styles.detailsGrid}>
              
              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Departure Date</span>
                <div className={styles.detailValue}>
                  <Calendar size={15} />
                  <strong>
                    {new Date(booking.departureDate).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </strong>
                </div>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Total Travelers</span>
                <div className={styles.detailValue}>
                  <Users size={15} />
                  <strong>{booking.travelersCount} Person{booking.travelersCount > 1 ? 's' : ''}</strong>
                </div>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Primary Contact</span>
                <div className={styles.detailValue}>
                  <strong>{booking.leadTraveler?.email}</strong>
                  <span className={styles.subText}>{booking.leadTraveler?.phone}</span>
                </div>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Booking Created</span>
                <div className={styles.detailValue}>
                  <span>{new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}</span>
                </div>
              </div>

            </div>

            {/* Special Requests if any */}
            {booking.specialRequests && (
              <div className={styles.specialReqBlock}>
                <span className={styles.detailLabel}>Special Requests</span>
                <p className={styles.specialReqText}>{booking.specialRequests}</p>
              </div>
            )}

            {/* Financial Summary */}
            <div className={styles.paymentSummary}>
              <div className={styles.payRow}>
                <span>Package Base Rate ({booking.travelersCount} × ₹{booking.pricePerPerson?.toLocaleString('en-IN')})</span>
                <span>₹{booking.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.payRow}>
                <span>Taxes & GST (5%)</span>
                <span>₹{booking.taxes?.toLocaleString('en-IN')}</span>
              </div>
              <div className={`${styles.payRow} ${styles.payTotalRow}`}>
                <span>Total Amount Paid</span>
                <span className={styles.grandPrice}>₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className={styles.actionsBar}>
              <button onClick={handlePrint} className={styles.printBtn}>
                <Printer size={16} /> Print / Save Voucher
              </button>
              <div className={styles.navLinksGroup}>
                <Link to="/my-bookings" className={styles.primaryBtn}>
                  View in My Bookings
                </Link>
                <Link to="/" className={styles.secondaryBtn}>
                  Explore More Packages <ArrowRight size={15} />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
