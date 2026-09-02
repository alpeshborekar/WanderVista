import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle, AlertCircle, Compass, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: request code, 2: set new password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [demoCodeHint, setDemoCodeHint] = useState('');

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await forgotPassword(email.trim());
      setMessage({ type: 'success', text: 'Verification code generated! Please enter the code below along with your new password.' });
      if (res.resetCode) {
        setDemoCodeHint(res.resetCode);
        setResetCode(res.resetCode);
      }
      setStep(2);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send reset code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter the verification code.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await resetPassword(email.trim(), resetCode.trim(), newPassword);
      setMessage({ type: 'success', text: 'Password reset successfully! Redirecting to sign in...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Invalid verification code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Back Link */}
        <Link to="/login" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div className={styles.brandHeader}>
          <div className={styles.iconWrap}>
            <KeyRound size={28} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Reset Account Password</h1>
          <p className={styles.subtitle}>
            {step === 1
              ? 'Enter your registered customer email to receive a password reset verification code.'
              : 'Enter the verification code and choose your new secure password.'}
          </p>
        </div>

        {message && (
          <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Registered Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.fieldIcon} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className={styles.form}>
            
            {demoCodeHint && (
              <div className={styles.hintBox}>
                <span>Verification Code: <strong>{demoCodeHint}</strong></span>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Verification Code</label>
              <div className={styles.inputWrapper}>
                <KeyRound size={18} className={styles.fieldIcon} />
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>New Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirm New Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
            </button>

            <button
              type="button"
              className={styles.backStepBtn}
              onClick={() => { setStep(1); setMessage(null); }}
            >
              Use a different email address
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
