import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle } from 'lucide-react';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    country: 'USA',
    rating: 5,
    text: 'WanderVista made our Bali honeymoon absolutely magical! Every detail was perfectly arranged.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
  },
  {
    id: 2,
    name: 'Marcus Chen',
    country: 'Canada',
    rating: 5,
    text: 'The Switzerland tour exceeded all my expectations. Professional guides and stunning views!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    country: 'India',
    rating: 5,
    text: 'Japan trip was a dream come true. Seamless booking and amazing cultural experiences.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
  },
  {
    id: 4,
    name: 'James Wilson',
    country: 'UK',
    rating: 4,
    text: 'Dubai package was luxurious at a great price. Highly recommend WanderVista!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
  },
  {
    id: 5,
    name: 'Elena Rodriguez',
    country: 'Spain',
    rating: 5,
    text: 'The Maldives escape was out of this world. Worth every penny!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80',
  },
  {
    id: 6,
    name: 'Ahmed Al-Farsi',
    country: 'UAE',
    rating: 5,
    text: 'Paris trip was romantic and perfectly curated. Will book again!',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function Testimonials() {
  return (
    <section id="testimonials" className={styles.testimonialsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <motion.span 
            className={styles.badge}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Traveler Stories
          </motion.span>
          <motion.h2 
            className={styles.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            What Our Travelers Say
          </motion.h2>
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Discover unforgettable experiences through the stories of our community.
          </motion.p>
        </div>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} className={styles.card} variants={itemVariants}>
              <div className={styles.quoteIconWrapper}>
                <Quote className={styles.quoteIcon} />
              </div>
              
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={i < testimonial.rating ? styles.starFilled : styles.starEmpty} 
                  />
                ))}
              </div>
              
              <p className={styles.reviewText}>"{testimonial.text}"</p>
              
              <div className={styles.authorInfo}>
                <img src={testimonial.avatar} alt={testimonial.name} className={styles.avatar} />
                <div className={styles.authorDetails}>
                  <h4 className={styles.authorName}>{testimonial.name}</h4>
                  <div className={styles.authorMeta}>
                    <span className={styles.country}>{testimonial.country}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.verified}>
                      <CheckCircle size={14} className={styles.verifiedIcon} />
                      Verified Traveler
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
