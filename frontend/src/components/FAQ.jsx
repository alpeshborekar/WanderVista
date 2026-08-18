import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: 'How do I book a trip with WanderVista?',
    answer: 'Simply browse our destinations, select your preferred package, fill in your details, and confirm with secure payment. Our booking confirmation arrives within minutes.'
  },
  {
    question: 'Can I customize my travel package?',
    answer: 'Absolutely! Our personalized trip service lets you customize every aspect of your journey from destinations to activities, dining preferences, and accommodation.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'We offer flexible cancellation up to 48 hours before departure for a full refund. Cancellations within 48 hours are subject to a 25% fee.'
  },
  {
    question: 'Are flights included in the packages?',
    answer: 'Most of our packages include return flights. Specific inclusions are clearly listed on each package page. We also offer land-only options.'
  },
  {
    question: 'How do I contact customer support?',
    answer: 'Our 24/7 support team is available via live chat, phone (+1-800-WANDER), or email at support@wandervista.com.'
  },
  {
    question: 'Is travel insurance included?',
    answer: 'Basic travel insurance is included in Adventure Pro and Luxury Escape packages. Starter Explorer offers optional insurance at checkout.'
  },
  {
    question: 'Can I travel solo or must I join a group?',
    answer: 'Both options are available! We offer solo traveler packages, couple packages, family packages, and group tours.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, PayPal, Apple Pay, Google Pay, and bank transfers. All transactions are secured with 256-bit encryption.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.leftCol}>
          <div className={styles.header}>
            <div className={styles.badge}>
              <HelpCircle className={styles.badgeIcon} size={16} />
              <span>FAQs</span>
            </div>
            <h2 className={styles.title}>Frequently Asked Questions</h2>
            <p className={styles.subtitle}>
              Everything you need to know about booking, managing, and enjoying your travels with WanderVista.
            </p>
          </div>

          <motion.div 
            className={styles.decorativeCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.cardContent}>
              <h3>Still have questions?</h3>
              <p>Our travel experts are ready to help you plan the perfect getaway.</p>
              <button className={styles.contactBtn}>Contact Support</button>
            </div>
          </motion.div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.accordion}>
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className={`${styles.faqItem} ${isOpen ? styles.active : ''}`}
                >
                  <button 
                    className={styles.faqQuestion} 
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={styles.iconContainer}
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={styles.faqAnswerContainer}
                      >
                        <div className={styles.faqAnswer}>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
