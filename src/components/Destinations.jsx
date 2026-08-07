import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import styles from './Destinations.module.css';

const destinationsData = [
  {
    id: 1,
    name: 'Bali',
    country: 'Indonesia',
    flag: '🇮🇩',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    rating: 4.9,
    price: 899,
  },
  {
    id: 2,
    name: 'Switzerland',
    country: 'Switzerland',
    flag: '🇨🇭',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80',
    rating: 4.8,
    price: 1299,
  },
  {
    id: 3,
    name: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    rating: 4.7,
    price: 799,
  },
  {
    id: 4,
    name: 'Dubai',
    country: 'UAE',
    flag: '🇦🇪',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    rating: 4.8,
    price: 1099,
  },
  {
    id: 5,
    name: 'Maldives',
    country: 'Maldives',
    flag: '🇲🇻',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80',
    rating: 5.0,
    price: 1599,
  },
  {
    id: 6,
    name: 'Japan',
    country: 'Japan',
    flag: '🇯🇵',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80',
    rating: 4.9,
    price: 999,
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
};

const Destinations = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="destinations" className={styles.destinationsSection}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className={styles.badge}>Top Locations</span>
        <h2 className={styles.title}>Explore Popular Destinations</h2>
        <p className={styles.subtitle}>
          Discover some of the most beautiful and iconic destinations around the world. Your next adventure awaits.
        </p>
      </motion.div>

      <motion.div 
        ref={ref}
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {destinationsData.map((dest) => (
          <motion.div
            key={dest.id}
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className={styles.cardWrapper}
          >
            <div className={styles.flagBadge}>
              <span>{dest.flag}</span>
              <span>{dest.country}</span>
            </div>
            
            <div className={styles.imageContainer}>
              <img src={dest.image} alt={dest.name} className={styles.image} />
              <div className={styles.gradientOverlay}></div>
            </div>

            <div className={styles.content}>
              <h3 className={styles.destinationName}>
                <MapPin size={20} />
                {dest.name}
              </h3>
              
              <div className={styles.details}>
                <div className={styles.rating}>
                  <Star size={16} fill="currentColor" />
                  <span>{dest.rating.toFixed(1)}</span>
                </div>
                <div className={styles.price}>
                  From ${dest.price.toLocaleString()}
                </div>
              </div>
            </div>

            <div className={styles.hoverContent}>
              <button className={styles.bookButton}>
                Book Now <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Destinations;
