import React from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <motion.footer 
      className={styles.footer}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1 */}
          <div className={styles.col}>
            <div className={styles.logoContainer}>
              <Compass size={32} className={styles.logoIcon} />
              <span className={styles.logoText}>WanderVista</span>
            </div>
            <p className={styles.tagline}>
              Discover the world's most amazing destinations. We make your travel dreams come true with curated experiences and expert guidance.
            </p>
            <div className={styles.socialIcons}>
              <a href="#" className={styles.socialBtn} aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
              <a href="#" className={styles.socialBtn} aria-label="Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
              <a href="#" className={styles.socialBtn} aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
              <a href="#" className={styles.socialBtn} aria-label="Youtube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#020917"/></svg></a>
              <a href="#" className={styles.socialBtn} aria-label="Linkedin"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
            </div>
          </div>

          {/* Column 2 */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/destinations">Destinations</Link></li>
              <li><Link to="/packages">Packages</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Support</h3>
            <ul className={styles.linkList}>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/booking-policy">Booking Policy</Link></li>
              <li><Link to="/cancellation">Cancellation</Link></li>
              <li><Link to="/sitemap">Sitemap</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Contact Us</h3>
            <ul className={styles.contactList}>
              <li>
                <MapPin size={20} className={styles.contactIcon} />
                <span>123 Travel St, New York, NY 10001</span>
              </li>
              <li>
                <Phone size={20} className={styles.contactIcon} />
                <span>+1 (800) WANDER-5</span>
              </li>
              <li>
                <Mail size={20} className={styles.contactIcon} />
                <span>hello@wandervista.com</span>
              </li>
              <li>
                <Clock size={20} className={styles.contactIcon} />
                <span>Mon-Sun: 24/7 Support</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bottomBar}>
          <p>&copy; 2024 WanderVista. All rights reserved.</p>
          <p className={styles.madeWithLove}>Made with Love for Travelers</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
