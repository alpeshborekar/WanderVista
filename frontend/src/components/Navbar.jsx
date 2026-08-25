import React, { useState, useEffect, useRef } from 'react';
import { Compass, Menu, X, Moon, Sun, User, LogOut, Calendar, ChevronDown, BarChart2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <Compass className={styles.brandIcon} size={26} strokeWidth={2.2} />
          <span className={styles.brandText}>WanderVista</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}>
            All Packages
          </Link>
          <Link to="/my-bookings" className={`${styles.navLink} ${location.pathname === '/my-bookings' ? styles.active : ''}`}>
            My Bookings
          </Link>
          <Link to="/admin" className={`${styles.navLink} ${location.pathname === '/admin' ? styles.active : ''}`}>
            DB & Analytics
          </Link>
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>
          <button className={styles.themeBtn} onClick={toggleTheme} aria-label="Toggle color theme" title="Toggle Theme">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className={styles.userDropdownWrapper} ref={dropdownRef}>
              <button
                className={styles.userBtn}
                onClick={() => setUserDropdownOpen(v => !v)}
                aria-expanded={userDropdownOpen}
              >
                <div className={styles.avatar}>{initials}</div>
                <span className={styles.userName}>{user?.fullName?.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={15} className={`${styles.chevron} ${userDropdownOpen ? styles.chevronOpen : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{user?.fullName}</div>
                    <div className={styles.dropdownEmail}>{user?.email}</div>
                  </div>
                  <hr className={styles.dropdownDivider} />
                  <Link to="/my-bookings" className={styles.dropdownItem}>
                    <Calendar size={16} /> My Bookings
                  </Link>
                  <Link to="/admin" className={styles.dropdownItem}>
                    <BarChart2 size={16} /> DB & Analytics
                  </Link>
                  <Link to="/profile" className={styles.dropdownItem}>
                    <User size={16} /> Profile Settings
                  </Link>
                  <hr className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginBtn}>Sign In</Link>
              <Link to="/register" className={styles.registerBtn}>Create Account</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" className={styles.mobileLink}>All Packages</Link>
          <Link to="/my-bookings" className={styles.mobileLink}>My Bookings</Link>
          <Link to="/admin" className={styles.mobileLink}>DB & Analytics</Link>
          <hr className={styles.mobileDivider} />
          {isAuthenticated ? (
            <>
              <Link to="/profile" className={styles.mobileLink}>Profile Settings</Link>
              <button className={`${styles.mobileLink} ${styles.mobileLogout}`} onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <div className={styles.mobileAuthRow}>
              <Link to="/login" className={styles.loginBtn}>Sign In</Link>
              <Link to="/register" className={styles.registerBtn}>Create Account</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
