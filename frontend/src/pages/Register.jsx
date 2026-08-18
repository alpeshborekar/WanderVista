import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Globe, Eye, EyeOff, ArrowLeft, Compass, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Register.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'India',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError('');
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        password: formData.password
      });
      navigate('/');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        
        {/* Back Link */}
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to All Packages
        </Link>

        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <Compass size={32} className={styles.brandIcon} />
          <h1 className={styles.brandTitle}>Create an Account</h1>
          <p className={styles.brandSubtitle}>Join WanderVista to book and manage world-class tours</p>
        </div>

        {apiError && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.field}>
            <label className={styles.label}>Full Name *</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.fieldIcon} />
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Priya Patel"
                value={formData.fullName}
                onChange={handleChange}
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              />
            </div>
            {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email Address *</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.fieldIcon} />
              <input
                type="email"
                name="email"
                placeholder="priya@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
            </div>
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number *</label>
              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.fieldIcon} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                />
              </div>
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Country</label>
              <div className={styles.inputWrapper}>
                <Globe size={18} className={styles.fieldIcon} />
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Password *</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                />
              </div>
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirm Password *</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                />
              </div>
              {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footerNote}>
          Already have an account? <Link to="/login">Sign In</Link>
        </div>

      </div>
    </div>
  );
}
