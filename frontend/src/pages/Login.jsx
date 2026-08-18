import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, Star, Globe, Compass, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError('');
    try {
      await login(formData.email, formData.password);
      setShowToast(true);
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
  };

  return (
    <div className={styles.container}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.overlay}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.overlayContent}
          >
            <div className={styles.logoWrapper}>
              <Compass className={styles.logoIcon} size={48} />
              <h1 className={styles.logoText}>WanderVista</h1>
            </div>
            <h2 className={styles.tagline}>Your Journey Begins Here</h2>
            <div className={styles.trustBadges}>
              <motion.div whileHover={{ y: -5 }} className={styles.badge}><Shield size={24} /><span>Secure Booking</span></motion.div>
              <motion.div whileHover={{ y: -5 }} className={styles.badge}><Star size={24} /><span>Top Rated</span></motion.div>
              <motion.div whileHover={{ y: -5 }} className={styles.badge}><Globe size={24} /><span>Global Reach</span></motion.div>
            </div>
          </motion.div>
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} className={`${styles.floatingElement} ${styles.float1}`} />
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} className={`${styles.floatingElement} ${styles.float2}`} />
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.formContainer}
        >
          {/* BACK BUTTON */}
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className={styles.mobileLogo}>
            <Compass className={styles.logoIconMobile} size={32} />
            <span>WanderVista</span>
          </div>

          <div className={styles.headerText}>
            <h2>Welcome Back!</h2>
            <p>Sign in to your account</p>
          </div>

          {apiError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.apiError}>
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`} />
              </div>
              <AnimatePresence>
                {errors.email && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={styles.errorText}>{errors.email}</motion.span>}
              </AnimatePresence>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={20} />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={formData.password} onChange={handleChange}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`} />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={styles.errorText}>{errors.password}</motion.span>}
              </AnimatePresence>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="remember" checked={formData.remember} onChange={handleChange} />
                <span className={styles.checkmark}></span>
                Remember Me
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
            </motion.button>
          </form>

          <p className={styles.bottomText}>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }} className={styles.toast}>
            <CheckCircle size={24} />
            <span>Login successful! Redirecting...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
