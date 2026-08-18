import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, MapPin, Globe, Star } from 'lucide-react';
import { useCounter } from '../hooks/useCounter';
import styles from './Statistics.module.css';

const StatCard = ({ icon: Icon, end, suffix, label, decimals = 0, isActive }) => {
  const count = useCounter(end, 2000, isActive, decimals);

  return (
    <div className={styles.stat}>
      <div className={styles.iconWrap}>
        <Icon size={28} color="white" />
      </div>
      <div className={styles.numberWrap}>
        <span className={styles.number}>
          {decimals > 0 ? count.toFixed(decimals) : count}
        </span>
        <span className={styles.suffix}>{suffix}</span>
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default function Statistics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { icon: Users, end: 100, suffix: 'K+', label: 'Happy Travelers' },
    { icon: MapPin, end: 350, suffix: '+', label: 'Destinations' },
    { icon: Globe, end: 50, suffix: '+', label: 'Countries' },
    { icon: Star, end: 4.9, suffix: '★', label: 'Average Rating', decimals: 1 }
  ];

  return (
    <section className={styles.section} ref={ref}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <div className={styles.statItem}>
                <StatCard {...stat} isActive={isInView} />
              </div>
              {index < stats.length - 1 && (
                <div className={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
