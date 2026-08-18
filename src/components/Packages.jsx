import React from 'react';
import { motion } from 'framer-motion';
import { Check, CalendarDays, Utensils, Building2, Car, UserCheck, Crown, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Packages.module.css';

const packages = [
  {
    id: 'starter',
    title: 'STARTER EXPLORER',
    price: '₹899',
    badge: 'Basic',
    icon: <Zap size={18} />,
    popular: false,
    buttonText: 'Get Started',
    features: [
      { text: '5 Days / 4 Nights', icon: CalendarDays },
      { text: 'Breakfast Included', icon: Utensils },
      { text: '3-Star Hotel', icon: Building2 },
      { text: 'Shared Bus', icon: Car },
      { text: 'Audio Guide', icon: UserCheck }
    ]
  },
  {
    id: 'pro',
    title: 'ADVENTURE PRO',
    price: '₹1,699',
    badge: 'Most Popular',
    icon: <Sparkles size={18} />,
    popular: true,
    buttonText: 'Choose Plan',
    features: [
      { text: '10 Days / 9 Nights', icon: CalendarDays },
      { text: 'All Meals Included', icon: Utensils },
      { text: '4-Star Hotel', icon: Building2 },
      { text: 'Private Car', icon: Car },
      { text: 'Personal Guide', icon: UserCheck }
    ]
  },
  {
    id: 'luxury',
    title: 'LUXURY ESCAPE',
    price: '₹3,299',
    badge: 'Premium',
    icon: <Crown size={18} />,
    popular: false,
    buttonText: 'Go Premium',
    features: [
      { text: '15 Days / 14 Nights', icon: CalendarDays },
      { text: 'Gourmet Dining', icon: Utensils },
      { text: '5-Star Resort', icon: Building2 },
      { text: 'Private Jet Transfer', icon: Car },
      { text: 'VIP Concierge', icon: UserCheck }
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function Packages() {
  return (
    <section id="packages" className={styles.packagesSection}>
      <div className={styles.container}>
        
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.badge}>
            <Sparkles size={16} />
            <span>Pricing Plans</span>
          </div>
          <h2 className={styles.title}>Choose Your Perfect Package</h2>
        </motion.div>

        <motion.div 
          className={styles.cardsGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {packages.map((pkg) => (
            <motion.div 
              key={pkg.id} 
              variants={cardVariants}
              className={`${styles.card} ${pkg.popular ? styles.cardPopular : ''}`}
            >
              {pkg.popular && (
                <div className={styles.ribbon}>{pkg.badge}</div>
              )}
              
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  {pkg.title}
                </div>
                <div className={styles.cardPrice}>
                  {pkg.price}<span className={styles.priceUnit}>/person</span>
                </div>
              </div>

              <ul className={styles.featuresList}>
                {pkg.features.map((feature, idx) => {
                  const IconComponent = feature.icon;
                  return (
                    <li key={idx} className={styles.featureItem}>
                      <div className={`${styles.iconWrap} ${pkg.popular ? styles.popularIconWrap : ''}`}>
                        <IconComponent size={14} />
                      </div>
                      <span>{feature.text}</span>
                    </li>
                  );
                })}
              </ul>

              <Link to="/destinations" className={`${styles.cardBtn} ${pkg.popular ? styles.primaryBtn : styles.outlineBtn}`}>
                {pkg.buttonText}
                <Check size={16} />
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
