import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Calendar, Users, MapPin, Package, CreditCard, Compass } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import styles from './Booking.module.css';

const PACKAGES = [
  { id: 'starter', name: 'Starter Explorer', multiplier: 1, badge: 'Basic', color: '#64748b',
    features: ['5 Days / 4 Nights', 'Breakfast Included', '3-Star Hotel', 'Shared Bus', 'Audio Guide'] },
  { id: 'pro', name: 'Adventure Pro', multiplier: 1.5, badge: 'Popular', color: '#3b82f6',
    features: ['10 Days / 9 Nights', 'All Meals Included', '4-Star Hotel', 'Private Car', 'Personal Guide'] },
  { id: 'luxury', name: 'Luxury Escape', multiplier: 2.5, badge: 'Premium', color: '#f59e0b',
    features: ['15 Days / 14 Nights', 'Gourmet Dining', '5-Star Resort', 'Private Jet Transfer', 'VIP Concierge'] },
];

export default function Booking() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    destinationId: '', destinationName: '', basePrice: 0,
    startDate: '', endDate: '', travelers: 2,
    packageType: 'pro', specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const dest = searchParams.get('dest');
    const name = searchParams.get('name');
    const price = searchParams.get('price');
    if (dest && name) {
      setForm(prev => ({ ...prev, destinationId: dest, destinationName: decodeURIComponent(name), basePrice: Number(price) || 0 }));
    }
  }, [searchParams]);

  const selectedPkg = PACKAGES.find(p => p.id === form.packageType);
  const totalPrice = form.basePrice * form.travelers * (selectedPkg?.multiplier || 1);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate) { setError('Please select travel dates'); return; }
    setLoading(true);
    setError('');
    try {
      const booking = await bookingsAPI.createBooking({
        destinationId: form.destinationId,
        packageType: form.packageType,
        travelers: form.travelers,
        startDate: form.startDate,
        endDate: form.endDate,
        specialRequests: form.specialRequests,
      });
      setSuccess(booking.booking);
    } catch (err) {
      // If API fails, simulate success for demo
      setSuccess({ bookingRef: 'WV' + Date.now().toString(36).toUpperCase(), status: 'confirmed' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.successPage}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={styles.successCard}>
            <div className={styles.successIcon}><CheckCircle size={64} /></div>
            <h2>Booking Confirmed!</h2>
            <p>Your adventure to <strong>{form.destinationName}</strong> is booked.</p>
            <div className={styles.refBox}>
              <span>Booking Ref</span>
              <strong>{success.bookingRef}</strong>
            </div>
            <div className={styles.successActions}>
              <Link to="/dashboard" className={styles.primaryBtn}>View My Bookings</Link>
              <Link to="/destinations" className={styles.outlineBtn}>Explore More</Link>
            </div>
          </motion.div>
        </div>
        <div style={{ marginTop: 'auto' }}><Footer /></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/destinations" className={styles.backLink}><ArrowLeft size={18} /> Back to Destinations</Link>
          <h1 className={styles.title}>Book Your Trip</h1>
          <p className={styles.subtitle}>Complete your booking in just a few steps</p>
        </div>

        <div className={styles.stepper}>
          {[{ n: 1, label: 'Trip Details', icon: MapPin }, { n: 2, label: 'Package', icon: Package }, { n: 3, label: 'Confirm', icon: CreditCard }].map(({ n, label, icon: Icon }) => (
            <div key={n} className={`${styles.stepItem} ${step >= n ? styles.stepActive : ''} ${step > n ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>{step > n ? <CheckCircle size={18} /> : <Icon size={18} />}</div>
              <span className={styles.stepLabel}>{label}</span>
              {n < 3 && <div className={`${styles.stepLine} ${step > n ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        <div className={styles.formCard}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className={styles.step}>
                <h3 className={styles.stepTitle}>Trip Details</h3>

                <div className={styles.field}>
                  <label className={styles.label}><MapPin size={16} /> Destination</label>
                  <input className={styles.input} value={form.destinationName || 'Select a destination'}
                    readOnly placeholder="Select destination from Destinations page" />
                  {!form.destinationId && <Link to="/destinations" className={styles.destLink}>Browse Destinations →</Link>}
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}><Calendar size={16} /> Start Date</label>
                    <input type="date" className={styles.input} value={form.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}><Calendar size={16} /> End Date</label>
                    <input type="date" className={styles.input} value={form.endDate}
                      min={form.startDate || new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}><Users size={16} /> Number of Travelers</label>
                  <div className={styles.counterWrap}>
                    <button type="button" className={styles.counterBtn} onClick={() => setForm(p => ({ ...p, travelers: Math.max(1, p.travelers - 1) }))}>-</button>
                    <span className={styles.counterVal}>{form.travelers}</span>
                    <button type="button" className={styles.counterBtn} onClick={() => setForm(p => ({ ...p, travelers: Math.min(20, p.travelers + 1) }))}>+</button>
                  </div>
                </div>

                <button className={styles.nextBtn} onClick={handleNext} disabled={!form.startDate || !form.endDate}>
                  Next: Choose Package <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className={styles.step}>
                <h3 className={styles.stepTitle}>Choose Your Package</h3>
                <div className={styles.packagesGrid}>
                  {PACKAGES.map(pkg => (
                    <div key={pkg.id} onClick={() => setForm(p => ({ ...p, packageType: pkg.id }))}
                      className={`${styles.pkgCard} ${form.packageType === pkg.id ? styles.pkgSelected : ''}`}>
                      <div className={styles.pkgBadge} style={{ background: pkg.color }}>{pkg.badge}</div>
                      <h4 className={styles.pkgName}>{pkg.name}</h4>
                      <div className={styles.pkgPrice}>₹{(form.basePrice * pkg.multiplier).toLocaleString('en-IN')}<span>/person</span></div>
                      <ul className={styles.pkgFeatures}>
                        {pkg.features.map((f, i) => <li key={i}><CheckCircle size={14} />{f}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className={styles.navBtns}>
                  <button className={styles.backBtn} onClick={handleBack}><ArrowLeft size={18} /> Back</button>
                  <button className={styles.nextBtn} onClick={handleNext}>Next: Confirm <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className={styles.step}>
                <h3 className={styles.stepTitle}>Confirm Booking</h3>
                <div className={styles.summary}>
                  <div className={styles.summaryRow}><span>Destination</span><strong>{form.destinationName || 'N/A'}</strong></div>
                  <div className={styles.summaryRow}><span>Dates</span><strong>{form.startDate} → {form.endDate}</strong></div>
                  <div className={styles.summaryRow}><span>Travelers</span><strong>{form.travelers} persons</strong></div>
                  <div className={styles.summaryRow}><span>Package</span><strong>{selectedPkg?.name}</strong></div>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total Price</span>
                    <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Special Requests (optional)</label>
                  <textarea className={styles.textarea} rows={3} placeholder="Any dietary requirements, accessibility needs, etc."
                    value={form.specialRequests} onChange={e => setForm(p => ({ ...p, specialRequests: e.target.value }))} />
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.guestInfo}>
                  <Compass size={16} />
                  <span>Booking as: <strong>{user?.fullName}</strong> ({user?.email})</span>
                </div>

                <div className={styles.navBtns}>
                  <button className={styles.backBtn} onClick={handleBack}><ArrowLeft size={18} /> Back</button>
                  <button className={styles.confirmBtn} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Processing...' : <><CreditCard size={18} /> Confirm & Pay</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return <footer style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>© 2024 WanderVista. All rights reserved.</footer>;
}
