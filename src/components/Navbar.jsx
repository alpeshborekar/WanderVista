import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Menu, X, Moon, Sun, LogIn, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import styles from './Navbar.module.css';

const navLinks = [
  { name: 'Home', id: 'home' },
  { name: 'Destinations', id: 'destinations' },
  { name: 'Packages', id: 'packages' },
  { name: 'Gallery', id: 'gallery' },
  { name: 'About', id: 'about' },
  { name: 'Contact', id: 'contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Basic scroll spy
      const sections = navLinks.map(link => document.getElementById(link.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveLink(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use location to determine active link if on a different page (though mostly single page with scroll)
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveLink('');
    } else {
      setActiveLink('home');
    }
  }, [location.pathname]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      // If we're not on home page, ideally navigate to home then scroll, but for now just close menu
      window.location.href = `/#${id}`;
      return;
    }
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveLink(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Compass className={styles.logoIcon} size={28} />
          <span className={styles.logoText}>WanderVista</span>
        </div>

        <div className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`${styles.navLink} ${activeLink === link.id ? styles.active : ''}`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className={styles.loginBtn}>
              <LogIn size={18} />
              <span>Login</span>
            </Link>
            <Link to="/register" className={styles.registerBtn}>
              <UserPlus size={18} />
              <span>Register</span>
            </Link>
          </div>
        </div>

        <div className={styles.mobileActions}>
          <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className={styles.hamburger}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={styles.mobileMenu}
          >
            <ul className={styles.mobileNavLinks}>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => scrollToSection(e, link.id)}
                    className={`${styles.mobileNavLink} ${activeLink === link.id ? styles.active : ''}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className={styles.mobileAuthLinks}>
              <Link to="/login" className={styles.loginBtn} onClick={() => setMobileMenuOpen(false)}>
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/register" className={styles.registerBtn} onClick={() => setMobileMenuOpen(false)}>
                <UserPlus size={18} />
                <span>Register</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
