import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Globe, Lock, Save, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    country: user?.country || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const data = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNew) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/dashboard" className={styles.backLink}><ArrowLeft size={18} /> Back to Dashboard</Link>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Manage your account information</p>
        </div>

        <div className={styles.content}>
          {/* Left - Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarLarge}>{initials}</div>
            <h3 className={styles.avatarName}>{user?.fullName}</h3>
            <p className={styles.avatarEmail}>{user?.email}</p>
            <div className={styles.memberSince}>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</div>
          </div>

          <div className={styles.forms}>
            {/* Profile Form */}
            <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className={styles.cardTitle}><User size={20} /> Personal Information</h2>
              <form onSubmit={handleProfileSave} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}><User size={16} /> Full Name</label>
                  <input className={styles.input} type="text" value={profileForm.fullName}
                    onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}><Mail size={16} /> Email</label>
                  <input className={`${styles.input} ${styles.readOnly}`} type="email" value={user?.email} readOnly />
                  <span className={styles.hint}>Email cannot be changed</span>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}><Phone size={16} /> Phone</label>
                    <input className={styles.input} type="tel" value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}><Globe size={16} /> Country</label>
                    <input className={styles.input} type="text" value={profileForm.country}
                      onChange={e => setProfileForm(p => ({ ...p, country: e.target.value }))} placeholder="Your country" />
                  </div>
                </div>

                {profileMsg && (
                  <div className={`${styles.msg} ${profileMsg.type === 'success' ? styles.msgSuccess : styles.msgError}`}>
                    {profileMsg.type === 'success' && <CheckCircle size={16} />}
                    {profileMsg.text}
                  </div>
                )}

                <button type="submit" className={styles.saveBtn} disabled={profileLoading}>
                  <Save size={18} /> {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>

            {/* Password Form */}
            <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className={styles.cardTitle}><Lock size={20} /> Change Password</h2>
              <form onSubmit={handlePwSave} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Current Password</label>
                  <input className={styles.input} type="password" value={pwForm.currentPassword}
                    onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>New Password</label>
                    <input className={styles.input} type="password" value={pwForm.newPassword}
                      onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min 8 characters" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Confirm New Password</label>
                    <input className={styles.input} type="password" value={pwForm.confirmNew}
                      onChange={e => setPwForm(p => ({ ...p, confirmNew: e.target.value }))} placeholder="Repeat new password" />
                  </div>
                </div>

                {pwMsg && (
                  <div className={`${styles.msg} ${pwMsg.type === 'success' ? styles.msgSuccess : styles.msgError}`}>
                    {pwMsg.type === 'success' && <CheckCircle size={16} />}
                    {pwMsg.text}
                  </div>
                )}

                <button type="submit" className={styles.saveBtn} disabled={pwLoading}>
                  <Lock size={18} /> {pwLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
