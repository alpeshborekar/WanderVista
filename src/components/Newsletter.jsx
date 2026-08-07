import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Mail } from 'lucide-react';
import styles from './Newsletter.module.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
    }, 500);
  };

  return (
    <section id="newsletter" className={styles.newsletterSection}>
      <div className={styles.decorativeBlobs}>
        <motion.div 
          className={`${styles.blob} ${styles.blobPrimary}`}
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className={`${styles.blob} ${styles.blobSecondary}`}
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className={styles.container}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.iconContainer}>
            <Send size={32} className={styles.planeIcon} />
          </div>
          
          <span className={styles.badge}>Stay Connected</span>
          
          <h2 className={styles.title}>Get Exclusive Travel Deals</h2>
          <p className={styles.subtitle}>
            Subscribe to our newsletter and receive handpicked deals, hidden gems, and travel inspiration directly in your inbox.
          </p>

          {isSubscribed ? (
            <motion.div 
              className={styles.successMessage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle size={48} className={styles.successIcon} />
              <h3>Thank you! You are subscribed.</h3>
              <p>Check your inbox for our latest deals.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Mail size={20} className={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="Enter your email address"
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Subscribe Now
                </button>
              </div>
              {error && <span className={styles.errorMessage}>{error}</span>}
            </form>
          )}

          <div className={styles.trustBadges}>
            <span className={styles.trustBadge}>No Spam</span>
            <span className={styles.divider}>•</span>
            <span className={styles.trustBadge}>Unsubscribe Anytime</span>
            <span className={styles.divider}>•</span>
            <span className={styles.trustBadge}>50K+ Subscribers</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
