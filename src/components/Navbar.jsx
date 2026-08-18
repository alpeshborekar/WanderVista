import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Menu, X, Moon, Sun, LogIn, UserPlus, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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

  useEffect(() => {
    setActiveLink(location.pathname !== '/' ? '' : 'home');
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    if (location.pathname !== '/') { window.location.href = `/#${id}`; return; }
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    setActiveLink(id);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoContainer}>
          <Compass className={styles.logoIcon} size={28} />
          <span className={styles.logoText}>WanderVista</span>
        </Link>

        <div className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} onClick={(e) => scrollToSection(e, link.id)}
                  className={`${styles.navLink} ${activeLink === link.id ? styles.active : ''}`}>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button className={styles.avatarBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <div className={styles.avatar}>{initials}</div>
                  <span className={styles.userName}>{user?.fullName?.split(' ')[0]}</span>
                  <ChevronDown size={16} className={userMenuOpen ? styles.chevronUp : ''} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }} className={styles.dropdown}>
                      <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/profile" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <User size={16} /> Profile
                      </Link>
                      <hr className={styles.dropdownDivider} />
                      <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}><LogIn size={18} /><span>Login</span></Link>
                <Link to="/register" className={styles.registerBtn}><UserPlus size={18} /><span>Register</span></Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.mobileActions}>
          <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className={styles.mobileMenu}>
            <ul className={styles.mobileNavLinks}>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} onClick={(e) => scrollToSection(e, link.id)}
                    className={`${styles.mobileNavLink} ${activeLink === link.id ? styles.active : ''}`}>{link.name}</a>
                </li>
              ))}
            </ul>
            <div className={styles.mobileAuthLinks}>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className={styles.loginBtn} onClick={() => setMobileMenuOpen(false)}><LayoutDashboard size={18} /><span>Dashboard</span></Link>
                  <button className={styles.registerBtn} onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}><LogOut size={18} /><span>Logout</span></button>
                </>
              ) : (
                <>
                  <Link to="/login" className={styles.loginBtn} onClick={() => setMobileMenuOpen(false)}><LogIn size={18} /><span>Login</span></Link>
                  <Link to="/register" className={styles.registerBtn} onClick={() => setMobileMenuOpen(false)}><UserPlus size={18} /><span>Register</span></Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
