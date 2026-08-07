import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Eye } from 'lucide-react';
import styles from './Gallery.module.css';

const images = [
  { id: 1, url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80', title: 'Norwegian Fjords' },
  { id: 2, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80', title: 'Mountain Sunrise' },
  { id: 3, url: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=80', title: 'Tropical Paradise' },
  { id: 4, url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80', title: 'Lakeside Reflections' },
  { id: 5, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', title: 'Desert Adventure' },
  { id: 6, url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80', title: 'Waterfall Magic' },
  { id: 7, url: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=600&q=80', title: 'Ancient Ruins' },
  { id: 8, url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80', title: 'Venice Canals' },
  { id: 9, url: 'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=600&q=80', title: 'Arctic Wonders' }
];

export default function Gallery() {
  return (
    <section id="gallery" className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>Travel Gallery</span>
          <h2 className={styles.title}>Breathtaking Moments</h2>
          <p className={styles.subtitle}>
            Explore the world through the lenses of our travelers and get inspired for your next adventure.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {images.map((image, index) => (
            <motion.div 
              key={image.id}
              className={styles.item}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
            >
              <img src={image.url} alt={image.title} className={styles.image} loading="lazy" />
              <div className={styles.overlay}>
                <div className={styles.overlayContent}>
                  <h3 className={styles.imageTitle}>
                    <MapPin size={18} className={styles.icon} />
                    {image.title}
                  </h3>
                  <button className={styles.viewBtn}>
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
