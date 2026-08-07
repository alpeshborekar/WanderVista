import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Globe, ArrowLeft, CheckCircle, AlertCircle, Compass } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", 
  "Germany", "France", "Japan", "India", "Brazil", "South Africa"
];

const Register = () => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    phoneCode: '+1',
    phone: '',
    country: '',
    password: '', 
    confirmPassword: '',
    terms: false 
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (min 10 digits)';
    }

    if (!formData.country) newErrors.country = 'Please select a country';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8 || !/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase & number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must agree to the Terms & Conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/');
      }, 2000);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.overlay}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={styles.overlayContent}
          >
            <div className={styles.logoWrapper}>
              <Compass className={styles.logoIcon} size={56} />
            </div>
            <h1 className={styles.logoText}>WanderVista</h1>
            <p className={styles.tagline}>Discover the world's wonders with us.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className={styles.rightPanel}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.formContainer}
        >
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={20} />
            Back to home
          </Link>

          <div className={styles.mobileLogo}>
            <Compass className={styles.logoIconMobile} size={32} />
            <span>WanderVista</span>
          </div>

          <div className={styles.headerText}>
            <h2>Create Account</h2>
            <p>Join thousands of travelers</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* Full Name */}
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                />
              </div>
              <AnimatePresence>
                {errors.fullName && <motion.span initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={styles.errorText}>{errors.fullName}</motion.span>}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                />
              </div>
              <AnimatePresence>
                {errors.email && <motion.span initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={styles.errorText}>{errors.email}</motion.span>}
              </AnimatePresence>
            </div>

            <div className={styles.row}>
              {/* Phone */}
              <div className={styles.inputGroup}>
                <div className={`${styles.inputWrapper} ${styles.phoneWrapper}`}>
                  <Phone className={styles.inputIcon} size={20} />
                  <select 
                    name="phoneCode" 
                    value={formData.phoneCode} 
                    onChange={handleChange}
                    className={styles.codeSelect}
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+61">+61</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${styles.input} ${styles.phoneInput} ${errors.phone ? styles.inputError : ''}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.phone && <motion.span initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={styles.errorText}>{errors.phone}</motion.span>}
                </AnimatePresence>
              </div>

              {/* Country */}
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Globe className={styles.inputIcon} size={20} />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`${styles.input} ${styles.select} ${errors.country ? styles.inputError : ''}`}
                  >
                    <option value="" disabled>Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <AnimatePresence>
                  {errors.country && <motion.span initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={styles.errorText}>{errors.country}</motion.span>}
                </AnimatePresence>
              </div>
            </div>

            <div className={styles.row}>
              {/* Password */}
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  />
                  <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && <motion.span initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={styles.errorText}>{errors.password}</motion.span>}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  />
                  <button type="button" className={styles.togglePassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && <motion.span initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={styles.errorText}>{errors.confirmPassword}</motion.span>}
                </AnimatePresence>
              </div>
            </div>

            {/* Terms */}
            <div className={styles.termsGroup}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />
                <span className={styles.checkmark}></span>
                I agree to the Terms & Conditions and Privacy Policy
              </label>
              <AnimatePresence>
                {errors.terms && <motion.span initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={styles.errorText}>{errors.terms}</motion.span>}
              </AnimatePresence>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className={styles.submitBtn}
            >
              Create Account
            </motion.button>
          </form>

          <p className={styles.bottomText}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </motion.div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={styles.toast}
          >
            <CheckCircle size={24} />
            <span>Account created successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
