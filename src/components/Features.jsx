import React from 'react';
import { motion } from 'framer-motion';
import { BadgePercent, Headphones, Shield, Lock, Heart, Zap } from 'lucide-react';
import styles from './Features.module.css';

const featuresData = [
  {
    icon: BadgePercent,
    title: 'Best Price Guarantee',
    description: 'We guarantee the best prices on all our packages. Find a cheaper price and we will match it.'
  },
  {
    icon: Headphones,
    title: '24/7 Customer Support',
    description: 'Our dedicated team is available around the clock to assist you with any questions or concerns.'
  },
  {
    icon: Shield,
    title: 'Trusted by Thousands',
    description: 'Join thousands of satisfied travelers who have experienced the world with our reliable services.'
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Your transactions are protected with industry-leading encryption and security protocols.'
  },
  {
    icon: Heart,
    title: 'Personalized Trips',
    description: 'We craft unique, tailor-made itineraries that match your personal travel style and preferences.'
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    description: 'Skip the wait. Book your dream vacation instantly with our seamless reservation system.'
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

const Features = () => {
  return (
    <section id="features" className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className={styles.badge}>Why Choose Us</span>
            <h2 className={styles.title}>Why Travelers Choose Us</h2>
            <p className={styles.subtitle}>
              We go above and beyond to provide unforgettable experiences. Here's why we are the preferred choice for globetrotters worldwide.
            </p>
          </motion.div>
        </div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {featuresData.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} className={styles.card} variants={itemVariants}>
                <div className={styles.iconWrapper}>
                  <Icon size={28} className={styles.icon} />
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDescription}>{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
