import React, { useState } from 'react';
import { User, Mail, Phone, Globe, Lock, Save, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
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
    country: user?.country || 'India'
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNew: ''
  });

  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const data = await authAPI.updateProfile(profileForm);
      if (data.user) updateUser(data.user);
      setProfileMsg({ type: 'success', text: 'Personal details updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) {
      setPwMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNew) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPwLoading(true);
    setPwMsg(null);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwMsg({ type: 'success', text: 'Your password was changed successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(null), 4000);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          
          <div className={styles.header}>
            <Link to="/my-bookings" className={styles.backLink}>
              <ArrowLeft size={16} /> Back to My Bookings
            </Link>
            <h1 className={styles.title}>Account Settings</h1>
            <p className={styles.subtitle}>Manage your traveler profile and account security</p>
          </div>

          <div className={styles.contentLayout}>
            
            {/* Sidebar Profile Card */}
            <div className={styles.sidebarCol}>
              <div className={styles.userCard}>
                <div className={styles.avatarLarge}>{initials}</div>
                <h3 className={styles.userName}>{user?.fullName || 'Traveler'}</h3>
                <div className={styles.userEmail}>{user?.email}</div>
                <div className={styles.countryTag}>
                  <Globe size={13} /> {user?.country || 'India'}
                </div>
              </div>
            </div>

            {/* Main Forms */}
            <div className={styles.formsCol}>
              
              {/* Profile Details Form */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <User size={18} /> Personal Information
                </h2>

                <form onSubmit={handleProfileSave} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Email Address (Read-only)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className={`${styles.input} ${styles.inputDisabled}`}
                    />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Country</label>
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm(p => ({ ...p, country: e.target.value }))}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {profileMsg && (
                    <div className={`${styles.msgAlert} ${profileMsg.type === 'success' ? styles.msgSuccess : styles.msgError}`}>
                      {profileMsg.type === 'success' ? <CheckCircle size={16} /> : null}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <button type="submit" className={styles.saveBtn} disabled={profileLoading}>
                    <Save size={16} />
                    {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <Lock size={18} /> Change Password
                </h2>

                <form onSubmit={handlePwSave} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>New Password</label>
                      <input
                        type="password"
                        placeholder="Min 8 characters"
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Repeat new password"
                        value={pwForm.confirmNew}
                        onChange={(e) => setPwForm(p => ({ ...p, confirmNew: e.target.value }))}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {pwMsg && (
                    <div className={`${styles.msgAlert} ${pwMsg.type === 'success' ? styles.msgSuccess : styles.msgError}`}>
                      {pwMsg.type === 'success' ? <CheckCircle size={16} /> : null}
                      <span>{pwMsg.text}</span>
                    </div>
                  )}

                  <button type="submit" className={styles.saveBtn} disabled={pwLoading}>
                    <Lock size={16} />
                    {pwLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
