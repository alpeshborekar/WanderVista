import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Users, User, Mail, Phone, ShieldCheck,
  CheckCircle, ArrowLeft, ArrowRight, CreditCard, Lock, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { packagesAPI, bookingsAPI } from '../services/api';
import { PACKAGES } from '../data/packagesData';
import styles from './Booking.module.css';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialPackageId = searchParams.get('packageId') || PACKAGES[0].id;
  const initialDate = searchParams.get('date') || '';
  const initialTravelers = Math.max(1, Number(searchParams.get('travelers')) || 2);

  const [selectedPackageId, setSelectedPackageId] = useState(initialPackageId);
  const [pkg, setPkg] = useState(null);
  const [departureDate, setDepartureDate] = useState(initialDate);
  const [travelersCount, setTravelersCount] = useState(initialTravelers);

  const [leadTraveler, setLeadTraveler] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [additionalTravelers, setAdditionalTravelers] = useState(
    Array.from({ length: initialTravelers - 1 }, () => ({ fullName: '' }))
  );

  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Load selected package details
  useEffect(() => {
    loadPackage(selectedPackageId);
  }, [selectedPackageId]);

  // Adjust additional travelers array when count changes
  useEffect(() => {
    const extraNeeded = Math.max(0, travelersCount - 1);
    setAdditionalTravelers(prev => {
      if (prev.length === extraNeeded) return prev;
      if (prev.length < extraNeeded) {
        const added = Array.from({ length: extraNeeded - prev.length }, () => ({ fullName: '' }));
        return [...prev, ...added];
      }
      return prev.slice(0, extraNeeded);
    });
  }, [travelersCount]);

  const loadPackage = async (id) => {
    try {
      const res = await packagesAPI.getOne(id);
      if (res.package) {
        setPkg(res.package);
        if (!departureDate || !res.package.availableDates?.includes(departureDate)) {
          setDepartureDate(res.package.availableDates?.[0] || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeadChange = (e) => {
    const { name, value } = e.target;
    setLeadTraveler(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleAdditionalChange = (idx, value) => {
    setAdditionalTravelers(prev => {
      const copy = [...prev];
      copy[idx] = { fullName: value };
      return copy;
    });
  };

  const validateForm = () => {
    const errs = {};
    if (!leadTraveler.fullName.trim()) errs.fullName = 'Lead traveler name is required';
    if (!leadTraveler.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(leadTraveler.email)) {
      errs.email = 'Please enter a valid email';
    }
    if (!leadTraveler.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (leadTraveler.phone.trim().length < 8) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!departureDate) {
      errs.date = 'Please select a departure date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    if (!pkg) return;

    setSubmitting(true);
    setApiError('');

    const subtotal = pkg.price * travelersCount;
    const taxes = Math.round(subtotal * 0.05);
    const totalPrice = subtotal + taxes;

    try {
      const payload = {
        packageId: pkg.id || pkg._id,
        packageTitle: pkg.title,
        destination: pkg.destination,
        country: pkg.country,
        coverImage: pkg.coverImage,
        departureDate,
        travelersCount,
        leadTraveler,
        additionalTravelers,
        specialRequests,
        pricePerPerson: pkg.price,
        subtotal,
        taxes,
        totalPrice
      };

      const res = await bookingsAPI.createBooking(payload);
      if (res.booking) {
        navigate(`/booking/confirmation/${res.booking.bookingRef || res.booking._id}`, {
          state: { booking: res.booking }
        });
      }
    } catch (err) {
      setApiError(err.message || 'Failed to process booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!pkg) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingBox}>Loading booking details...</div>
        <Footer />
      </div>
    );
  }

  const subtotal = pkg.price * travelersCount;
  const taxes = Math.round(subtotal * 0.05);
  const totalPrice = subtotal + taxes;

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          
          <div className={styles.pageHeader}>
            <Link to={`/packages/${pkg.id || pkg._id}`} className={styles.backLink}>
              <ArrowLeft size={16} /> Back to Package Details
            </Link>
            <h1 className={styles.pageTitle}>Complete Your Booking</h1>
            <p className={styles.pageSubtitle}>
              Confirm your travel dates, traveler details, and review the transparent pricing summary.
            </p>
          </div>

          {apiError && (
            <div className={styles.errorAlert}>
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          <div className={styles.grid}>
            
            {/* Left Form: Booking Details & Traveler Information */}
            <div className={styles.formCol}>
              <form onSubmit={handleSubmitBooking} className={styles.bookingForm}>
                
                {/* Section 1: Selected Package & Date */}
                <div className={styles.cardSection}>
                  <h2 className={styles.sectionTitle}>1. Tour Package & Departure Date</h2>

                  {/* Package Selector */}
                  <div className={styles.field}>
                    <label className={styles.label}>Selected Travel Package</label>
                    <select
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                      className={styles.select}
                    >
                      {PACKAGES.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} — ₹{p.price.toLocaleString('en-IN')}/person ({p.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formRow}>
                    {/* Departure Date */}
                    <div className={styles.field}>
                      <label className={styles.label}>
                        <Calendar size={15} /> Departure Date
                      </label>
                      <select
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className={`${styles.select} ${errors.date ? styles.inputError : ''}`}
                      >
                        {pkg.availableDates?.map(d => (
                          <option key={d} value={d}>
                            {new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' })}
                          </option>
                        ))}
                      </select>
                      {errors.date && <span className={styles.errorText}>{errors.date}</span>}
                    </div>

                    {/* Number of Travelers */}
                    <div className={styles.field}>
                      <label className={styles.label}>
                        <Users size={15} /> Travelers Count
                      </label>
                      <div className={styles.counterControl}>
                        <button
                          type="button"
                          className={styles.counterBtn}
                          onClick={() => setTravelersCount(t => Math.max(1, t - 1))}
                          disabled={travelersCount <= 1}
                        >
                          -
                        </button>
                        <span className={styles.counterText}>{travelersCount} Person{travelersCount > 1 ? 's' : ''}</span>
                        <button
                          type="button"
                          className={styles.counterBtn}
                          onClick={() => setTravelersCount(t => Math.min(10, t + 1))}
                          disabled={travelersCount >= 10}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Primary / Lead Traveler Details */}
                <div className={styles.cardSection}>
                  <h2 className={styles.sectionTitle}>2. Lead Traveler Information</h2>
                  <p className={styles.sectionSubtext}>
                    Primary contact person for booking confirmation and itinerary updates.
                  </p>

                  <div className={styles.field}>
                    <label className={styles.label}>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Rajesh Sharma"
                      value={leadTraveler.fullName}
                      onChange={handleLeadChange}
                      className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                    />
                    {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="rajesh@example.com"
                        value={leadTraveler.email}
                        onChange={handleLeadChange}
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      />
                      {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={leadTraveler.phone}
                        onChange={handleLeadChange}
                        className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                      />
                      {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                    </div>
                  </div>
                </div>

                {/* Section 3: Additional Travelers (if any) */}
                {additionalTravelers.length > 0 && (
                  <div className={styles.cardSection}>
                    <h2 className={styles.sectionTitle}>3. Additional Co-Traveler Details</h2>
                    <div className={styles.additionalGrid}>
                      {additionalTravelers.map((t, idx) => (
                        <div key={idx} className={styles.field}>
                          <label className={styles.label}>Traveler {idx + 2} Full Name</label>
                          <input
                            type="text"
                            placeholder={`Traveler ${idx + 2} Name`}
                            value={t.fullName}
                            onChange={(e) => handleAdditionalChange(idx, e.target.value)}
                            className={styles.input}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 4: Special Requests */}
                <div className={styles.cardSection}>
                  <h2 className={styles.sectionTitle}>Special Requests or Dietary Notes (Optional)</h2>
                  <textarea
                    rows={3}
                    placeholder="E.g., Vegetarian meals, twin bedding request, airport wheelchair assistance, anniversary trip note..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className={styles.textarea}
                  />
                </div>

                {/* Submit Action */}
                <div className={styles.actionRow}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? 'Confirming Booking...' : (
                      <>
                        <Lock size={16} />
                        Confirm & Reserve Tour (₹{totalPrice.toLocaleString('en-IN')})
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Right Summary: Sticky Card */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryHeader}>Booking Summary</h3>

                {/* Mini Package preview */}
                <div className={styles.pkgPreview}>
                  <img src={pkg.coverImage} alt={pkg.title} className={styles.pkgThumb} />
                  <div className={styles.pkgInfo}>
                    <div className={styles.pkgCountry}>{pkg.country} {pkg.flag}</div>
                    <div className={styles.pkgTitle}>{pkg.title}</div>
                    <div className={styles.pkgDuration}>{pkg.duration}</div>
                  </div>
                </div>

                <hr className={styles.summaryDivider} />

                {/* Details Breakdown */}
                <div className={styles.summaryMetaList}>
                  <div className={styles.metaRow}>
                    <span>Departure Date:</span>
                    <strong>
                      {departureDate ? new Date(departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not selected'}
                    </strong>
                  </div>
                  <div className={styles.metaRow}>
                    <span>Travelers:</span>
                    <strong>{travelersCount} Person{travelersCount > 1 ? 's' : ''}</strong>
                  </div>
                  <div className={styles.metaRow}>
                    <span>Group Style:</span>
                    <strong>{pkg.groupSize}</strong>
                  </div>
                </div>

                <hr className={styles.summaryDivider} />

                {/* Pricing Calculation */}
                <div className={styles.calcList}>
                  <div className={styles.calcRow}>
                    <span>₹{pkg.price.toLocaleString('en-IN')} × {travelersCount} traveler{travelersCount > 1 ? 's' : ''}</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>GST & Travel Services (5%)</span>
                    <span>₹{taxes.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={`${styles.calcRow} ${styles.totalCalcRow}`}>
                    <span>Total Amount Payable</span>
                    <span className={styles.finalPrice}>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className={styles.reassurance}>
                  <ShieldCheck size={18} className={styles.shieldIcon} />
                  <div>
                    <strong>Zero hidden booking fees</strong>
                    <p>Instant confirmation voucher issued upon booking.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
