import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Bookmark, Star, Globe, Users, MapPin } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // Generate random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <section className={styles.heroSection}>
      <div 
        className={styles.parallaxBg} 
        style={{ transform: `translateY(${offsetY * 0.5}px)` }}
      />
      <div className={styles.overlay} />
      
      <div className={styles.particles}>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={styles.particle}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div 
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className={styles.badge}>
          ✈ Award Winning Travel Platform
        </motion.div>
        
        <motion.h1 variants={itemVariants} className={styles.title}>
          <span className={styles.titleLine1}>Explore the World</span>
          <span className={styles.titleLine2}>Without Limits</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className={styles.subtitle}>
          Discover breathtaking destinations, curated experiences, and unforgettable adventures tailored just for you.
        </motion.p>
        
        <motion.div variants={itemVariants} className={styles.actions}>
          <a href="#destinations" className={`${styles.btn} ${styles.btnPrimary}`}>
            Explore Destinations <ChevronRight size={20} />
          </a>
          <a href="#packages" className={`${styles.btn} ${styles.btnSecondary}`}>
            Book Now <Bookmark size={20} />
          </a>
        </motion.div>
      </motion.div>

      <motion.div 
        className={styles.statsBar}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className={styles.statItem}>
          <div className={styles.statIcon}><MapPin size={20} /></div>
          <div className={styles.statText}>
            <span className={styles.statValue}>500+</span>
            <span className={styles.statLabel}>Destinations</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}><Globe size={20} /></div>
          <div className={styles.statText}>
            <span className={styles.statValue}>50+</span>
            <span className={styles.statLabel}>Countries</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}><Users size={20} /></div>
          <div className={styles.statText}>
            <span className={styles.statValue}>100K+</span>
            <span className={styles.statLabel}>Travelers</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}><Star size={20} /></div>
          <div className={styles.statText}>
            <span className={styles.statValue}>4.9★</span>
            <span className={styles.statLabel}>Rating</span>
          </div>
        </div>
      </motion.div>

      <motion.a 
        href="#destinations"
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown size={32} />
        </motion.div>
      </motion.a>
    </section>
  );
};

export default Hero;
