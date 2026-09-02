import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle, Database } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { adminLogin, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both administrator email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await adminLogin(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials or access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@wandervista.com');
    setPassword('Admin@12345');
    setError('');
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.loginBox}>
        
        {/* Header Badge */}
        <div className={styles.brandHeader}>
          <div className={styles.shieldWrap}>
            <Shield size={28} className={styles.shieldIcon} />
          </div>
          <h1 className={styles.brandTitle}>Admin Console</h1>
          <p className={styles.brandSub}>WanderVista Internal Operations & Management Portal</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={17} className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Administrator Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={17} className={styles.fieldIcon} />
              <input
                type="email"
                placeholder="admin@wandervista.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={styles.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Security Key / Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={17} className={styles.fieldIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className={styles.input}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? 'Authenticating Admin Access...' : (
              <>
                <span>Access Management Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Credentials Notice Box */}
        <div className={styles.credentialNotice}>
          <div className={styles.noticeHeader}>
            <Database size={14} />
            <strong>Default Administrator Credentials</strong>
          </div>
          <div className={styles.credRow}>
            <span>Email:</span> <code>admin@wandervista.com</code>
          </div>
          <div className={styles.credRow}>
            <span>Password:</span> <code>Admin@12345</code>
          </div>
          <button type="button" onClick={handleFillDemo} className={styles.demoFillBtn}>
            Auto-fill Admin Credentials
          </button>
        </div>

        <div className={styles.footerNote}>
          <Link to="/" className={styles.backHomeLink}>
            ← Return to Customer Travel Website
          </Link>
        </div>

      </div>
    </div>
  );
}
