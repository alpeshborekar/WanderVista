import React from 'react';
import { Compass, Mail, Phone, MapPin, ShieldCheck, CreditCard, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand info */}
          <div className={styles.brandCol}>
            <div className={styles.brand}>
              <Compass size={24} className={styles.brandIcon} />
              <span>WanderVista</span>
            </div>
            <p className={styles.brandDesc}>
              Curated international travel packages, guided expeditions, and cultural tours crafted for discerning travelers.
            </p>
            <div className={styles.badges}>
              <div className={styles.badgeItem}>
                <ShieldCheck size={16} /> <span>100% Verified Tours</span>
              </div>
              <div className={styles.badgeItem}>
                <CreditCard size={16} /> <span>Secure Payments</span>
              </div>
              <div className={styles.badgeItem}>
                <Clock size={16} /> <span>24/7 Travel Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Explore</h4>
            <ul className={styles.links}>
              <li><Link to="/">All Packages</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Tour Styles</h4>
            <ul className={styles.links}>
              <li><Link to="/?category=Mountain+%26+Alpine">Mountain & Alpine</Link></li>
              <li><Link to="/?category=Beach+%26+Coastal">Beach & Coastal</Link></li>
              <li><Link to="/?category=Cultural+Heritage">Cultural Heritage</Link></li>
              <li><Link to="/?category=City+Exploration">City Exploration</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Direct Support</h4>
            <div className={styles.contactItem}>
              <Mail size={16} />
              <span>support@wandervista.com</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={16} />
              <span>+91 1800 200 4545</span>
            </div>
            <div className={styles.contactItem}>
              <MapPin size={16} />
              <span>Mumbai & Zurich Operations Hub</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} WanderVista Travel Co. All rights reserved. All prices displayed in INR (₹).
          </div>
          <div className={styles.legalLinks}>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Cancellation Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
