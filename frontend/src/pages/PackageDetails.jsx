import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Star, Users, Check, X, ArrowLeft, Clock,
  ShieldCheck, AlertCircle, ChevronDown, ChevronUp, Share2, Compass
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { packagesAPI } from '../services/api';
import styles from './PackageDetails.module.css';

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [openItineraryDay, setOpenItineraryDay] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPackage();
  }, [id]);

  const fetchPackage = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await packagesAPI.getOne(id);
      if (res.package) {
        setPkg(res.package);
        if (res.package.availableDates && res.package.availableDates.length > 0) {
          setSelectedDate(res.package.availableDates[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!pkg) return;
    const dateParam = selectedDate || pkg.availableDates?.[0] || '';
    navigate(`/booking?packageId=${pkg.id || pkg._id}&date=${dateParam}&travelers=${travelers}`);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading tour package details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.errorContainer}>
          <AlertCircle size={48} className={styles.errorIcon} />
          <h2>Package Not Found</h2>
          <p>{error || 'The requested tour package could not be retrieved.'}</p>
          <Link to="/" className={styles.backButton}>
            <ArrowLeft size={16} /> Back to All Packages
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = pkg.price * travelers;
  const taxes = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + taxes;

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          
          {/* Breadcrumb Navigation */}
          <nav className={styles.breadcrumbs}>
            <Link to="/">All Packages</Link>
            <span className={styles.breadSep}>/</span>
            <span>{pkg.country}</span>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadCurrent}>{pkg.title}</span>
          </nav>

          {/* Header Title Section */}
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <span className={styles.categoryBadge}>{pkg.category}</span>
              <div className={styles.ratingBadge}>
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                <span className={styles.ratingScore}>{pkg.rating.toFixed(1)}</span>
                <span className={styles.reviewText}>({pkg.reviewCount} verified reviews)</span>
              </div>
            </div>

            <h1 className={styles.title}>{pkg.title}</h1>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <MapPin size={16} className={styles.metaIcon} />
                <span>{pkg.destination}, {pkg.country} {pkg.flag}</span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={16} className={styles.metaIcon} />
                <span>{pkg.duration}</span>
              </div>
              <div className={styles.metaItem}>
                <Users size={16} className={styles.metaIcon} />
                <span>{pkg.groupSize}</span>
              </div>
            </div>
          </header>

          {/* Photo Gallery */}
          <section className={styles.gallerySection}>
            <div className={styles.mainImageWrap}>
              <img
                src={pkg.images?.[selectedImage] || pkg.coverImage}
                alt={`${pkg.title} photo`}
                className={styles.mainImage}
              />
            </div>
            {pkg.images && pkg.images.length > 1 && (
              <div className={styles.thumbnailRow}>
                {pkg.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`${styles.thumbnailBtn} ${selectedImage === idx ? styles.thumbnailActive : ''}`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={img} alt="" className={styles.thumbnailImg} />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Two Column Layout: Main Content + Sticky Booking Box */}
          <div className={styles.contentGrid}>
            
            {/* Left Column: Itinerary, Overview, Included/Excluded */}
            <div className={styles.leftCol}>
              
              {/* Tour Overview */}
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionHeading}>Tour Overview</h2>
                <p className={styles.overviewText}>{pkg.overview}</p>
              </section>

              {/* Day-by-Day Itinerary */}
              {pkg.itinerary && pkg.itinerary.length > 0 && (
                <section className={styles.sectionBlock}>
                  <h2 className={styles.sectionHeading}>Day-by-Day Itinerary</h2>
                  <div className={styles.itineraryList}>
                    {pkg.itinerary.map((item) => {
                      const isOpen = openItineraryDay === item.day;
                      return (
                        <div key={item.day} className={styles.itineraryCard}>
                          <button
                            className={styles.itineraryHeader}
                            onClick={() => setOpenItineraryDay(isOpen ? 0 : item.day)}
                          >
                            <div className={styles.dayBadge}>Day {item.day}</div>
                            <span className={styles.itineraryTitle}>{item.title}</span>
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          {isOpen && (
                            <div className={styles.itineraryBody}>
                              <p>{item.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Inclusions & Exclusions */}
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionHeading}>What’s Included & Excluded</h2>
                <div className={styles.incExcGrid}>
                  
                  {/* Included */}
                  <div className={styles.incBox}>
                    <h3 className={styles.incTitle}>
                      <Check size={18} className={styles.incIcon} /> Included Services
                    </h3>
                    <ul className={styles.incList}>
                      {pkg.included?.map((inc, i) => (
                        <li key={i}><Check size={14} className={styles.checkIcon} /> {inc}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Excluded */}
                  <div className={styles.excBox}>
                    <h3 className={styles.excTitle}>
                      <X size={18} className={styles.excIcon} /> Excluded Services
                    </h3>
                    <ul className={styles.excList}>
                      {pkg.excluded?.map((exc, i) => (
                        <li key={i}><X size={14} className={styles.crossIcon} /> {exc}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              </section>

            </div>

            {/* Right Column: Sticky Booking Widget */}
            <div className={styles.rightCol}>
              <div className={styles.bookingWidget}>
                
                <div className={styles.widgetHeader}>
                  <div className={styles.priceHead}>
                    <span className={styles.widgetPrice}>₹{pkg.price.toLocaleString('en-IN')}</span>
                    <span className={styles.widgetUnit}> / person</span>
                  </div>
                  <div className={styles.allTaxes}>All taxes calculated at checkout</div>
                </div>

                <hr className={styles.widgetDivider} />

                {/* Form: Departure Date */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <Calendar size={14} /> Select Departure Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={styles.selectInput}
                  >
                    {pkg.availableDates?.map((d) => (
                      <option key={d} value={d}>
                        {new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form: Number of Travelers */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <Users size={14} /> Number of Travelers
                  </label>
                  <div className={styles.counterRow}>
                    <button
                      type="button"
                      className={styles.counterBtn}
                      onClick={() => setTravelers(t => Math.max(1, t - 1))}
                      disabled={travelers <= 1}
                    >
                      -
                    </button>
                    <span className={styles.counterVal}>{travelers} traveler{travelers > 1 ? 's' : ''}</span>
                    <button
                      type="button"
                      className={styles.counterBtn}
                      onClick={() => setTravelers(t => Math.min(12, t + 1))}
                      disabled={travelers >= 12}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className={styles.priceBreakdown}>
                  <div className={styles.breakdownRow}>
                    <span>₹{pkg.price.toLocaleString('en-IN')} × {travelers} traveler{travelers > 1 ? 's' : ''}</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span>Taxes & GST (5%)</span>
                    <span>₹{taxes.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
                    <span>Total Price</span>
                    <span className={styles.totalAmount}>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleBookNow}
                  className={styles.proceedButton}
                >
                  Proceed to Booking
                </button>

                <div className={styles.guaranteeNote}>
                  <ShieldCheck size={16} />
                  <span>Free cancellation up to 14 days before departure</span>
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
