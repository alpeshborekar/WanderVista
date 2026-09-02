import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, Users, Package, Database, CheckCircle,
  XCircle, ArrowLeft, RefreshCw, BarChart2, Shield, LogOut,
  Plus, Edit, Trash2, Search, Filter, Clock, MapPin, DollarSign,
  AlertTriangle, X, Check, ToggleLeft, ToggleRight, Eye, Ban
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminAPI } from '../services/api';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, packages, availability, bookings, customers
  const [stats, setStats] = useState(null);
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Booking filters & search
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Booking Detail Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Package Modal (Create / Edit)
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgFormData, setPkgFormData] = useState({
    title: '',
    destination: '',
    country: '',
    flag: '✈️',
    category: 'Mountain & Alpine',
    price: '',
    duration: '7 Days / 6 Nights',
    days: 7,
    nights: 6,
    groupSize: 'Max 12 travelers',
    capacity: 12,
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
    shortDescription: '',
    overview: '',
    isActive: true
  });

  // Availability Management State
  const [selectedPkgForAvail, setSelectedPkgForAvail] = useState(null);
  const [newAvailDate, setNewAvailDate] = useState('');
  const [newAvailCapacity, setNewAvailCapacity] = useState(12);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, pkgRes, bkgRes, custRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPackages(),
        adminAPI.getBookings(),
        adminAPI.getCustomers()
      ]);

      setStats(statsRes);
      const pkgsList = pkgRes.packages || [];
      setPackages(pkgsList);
      if (pkgsList.length > 0 && !selectedPkgForAvail) {
        setSelectedPkgForAvail(pkgsList[0]);
      }
      setBookings(bkgRes.bookings || []);
      setCustomers(custRes.customers || []);
    } catch (err) {
      console.error('Admin loading error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAdminLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const showToast = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Booking Status Update (Confirm, Reject, Cancel, Complete)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      showToast(`Booking ${bookingId} status updated to ${newStatus}.`);
      setBookings(prev =>
        prev.map(b => (b._id === bookingId || b.bookingRef === bookingId) ? { ...b, status: newStatus } : b)
      );
      if (selectedBooking && (selectedBooking._id === bookingId || selectedBooking.bookingRef === bookingId)) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Package Active Toggle
  const handleToggleActive = async (pkg) => {
    const pkgId = pkg.id || pkg._id;
    try {
      const res = await adminAPI.togglePackageActive(pkgId);
      const newActive = res.isActive !== undefined ? res.isActive : !pkg.isActive;
      showToast(`Package ${pkg.title} is now ${newActive ? 'Active (Visible to customers)' : 'Disabled (Hidden from catalog)'}.`);
      setPackages(prev =>
        prev.map(p => (p.id === pkgId || p._id === pkgId) ? { ...p, isActive: newActive } : p)
      );
    } catch (err) {
      showToast('Failed to toggle package state.', 'error');
    }
  };

  // Package Modal Open (Add / Edit)
  const handleOpenAddPkg = () => {
    setEditingPkg(null);
    setPkgFormData({
      title: '',
      destination: '',
      country: '',
      flag: '✈️',
      category: 'Mountain & Alpine',
      price: '',
      duration: '7 Days / 6 Nights',
      days: 7,
      nights: 6,
      groupSize: 'Max 12 travelers',
      capacity: 12,
      coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
      shortDescription: '',
      overview: '',
      isActive: true
    });
    setShowPkgModal(true);
  };

  const handleOpenEditPkg = (pkg) => {
    setEditingPkg(pkg);
    setPkgFormData({
      title: pkg.title || '',
      destination: pkg.destination || '',
      country: pkg.country || '',
      flag: pkg.flag || '✈️',
      category: pkg.category || 'Mountain & Alpine',
      price: pkg.price || '',
      duration: pkg.duration || '',
      days: pkg.days || 7,
      nights: pkg.nights || 6,
      groupSize: pkg.groupSize || 'Max 12 travelers',
      capacity: pkg.capacity || 12,
      coverImage: pkg.coverImage || '',
      shortDescription: pkg.shortDescription || '',
      overview: pkg.overview || '',
      isActive: pkg.isActive !== false
    });
    setShowPkgModal(true);
  };

  const handleSavePkg = async (e) => {
    e.preventDefault();
    if (!pkgFormData.title || !pkgFormData.destination || !pkgFormData.price) {
      showToast('Please fill all required package details.', 'error');
      return;
    }

    try {
      if (editingPkg) {
        await adminAPI.updatePackage(editingPkg.id || editingPkg._id, pkgFormData);
        showToast('Package updated successfully.');
        setPackages(prev =>
          prev.map(p => (p.id === editingPkg.id || p._id === editingPkg._id) ? { ...p, ...pkgFormData, price: Number(pkgFormData.price) } : p)
        );
      } else {
        const res = await adminAPI.createPackage(pkgFormData);
        showToast('New tour package created and published.');
        if (res.package) setPackages(prev => [res.package, ...prev]);
      }
      setShowPkgModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save package.', 'error');
    }
  };

  const handleDeletePkg = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this package?')) return;
    try {
      await adminAPI.deletePackage(id);
      showToast('Package deleted from catalog.');
      setPackages(prev => prev.filter(p => p.id !== id && p._id !== id));
    } catch (err) {
      showToast(err.message || 'Failed to delete package.', 'error');
    }
  };

  // Availability Actions
  const handleAddAvailDate = async (e) => {
    e.preventDefault();
    if (!newAvailDate || !selectedPkgForAvail) return;
    const pkgId = selectedPkgForAvail.id || selectedPkgForAvail._id;

    try {
      await adminAPI.updateAvailability(pkgId, {
        date: newAvailDate,
        capacity: Number(newAvailCapacity) || 12,
        action: 'add'
      });
      showToast(`Departure date ${newAvailDate} added with capacity ${newAvailCapacity}.`);
      
      // Update local state
      const updatedDates = [...(selectedPkgForAvail.availableDates || []), newAvailDate];
      const updatedSchedule = [
        ...(selectedPkgForAvail.schedule || []),
        { date: newAvailDate, capacity: Number(newAvailCapacity) || 12, bookedSpots: 0, isClosed: false }
      ];
      
      const updatedPkg = { ...selectedPkgForAvail, availableDates: updatedDates, schedule: updatedSchedule };
      setSelectedPkgForAvail(updatedPkg);
      setPackages(prev => prev.map(p => (p.id === pkgId || p._id === pkgId) ? updatedPkg : p));
      setNewAvailDate('');
    } catch (err) {
      showToast('Failed to add departure date.', 'error');
    }
  };

  const handleToggleCloseDate = async (date) => {
    if (!selectedPkgForAvail) return;
    const pkgId = selectedPkgForAvail.id || selectedPkgForAvail._id;

    try {
      await adminAPI.updateAvailability(pkgId, { date, action: 'toggleClosed' });
      const updatedSchedule = (selectedPkgForAvail.schedule || []).map(s =>
        s.date === date ? { ...s, isClosed: !s.isClosed } : s
      );
      const updatedPkg = { ...selectedPkgForAvail, schedule: updatedSchedule };
      setSelectedPkgForAvail(updatedPkg);
      setPackages(prev => prev.map(p => (p.id === pkgId || p._id === pkgId) ? updatedPkg : p));
      showToast(`Departure date ${date} availability status toggled.`);
    } catch (err) {
      showToast('Failed to toggle date status.', 'error');
    }
  };

  const handleRemoveDate = async (date) => {
    if (!selectedPkgForAvail) return;
    if (!window.confirm(`Remove departure date ${date}?`)) return;
    const pkgId = selectedPkgForAvail.id || selectedPkgForAvail._id;

    try {
      await adminAPI.updateAvailability(pkgId, { date, action: 'remove' });
      const updatedDates = (selectedPkgForAvail.availableDates || []).filter(d => d !== date);
      const updatedSchedule = (selectedPkgForAvail.schedule || []).filter(s => s.date !== date);
      const updatedPkg = { ...selectedPkgForAvail, availableDates: updatedDates, schedule: updatedSchedule };
      setSelectedPkgForAvail(updatedPkg);
      setPackages(prev => prev.map(p => (p.id === pkgId || p._id === pkgId) ? updatedPkg : p));
      showToast(`Departure date ${date} removed.`);
    } catch (err) {
      showToast('Failed to remove departure date.', 'error');
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = bookingFilter === 'all' || b.status === bookingFilter;
    const q = bookingSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      b.bookingRef?.toLowerCase().includes(q) ||
      b.packageTitle?.toLowerCase().includes(q) ||
      b.leadTraveler?.fullName?.toLowerCase().includes(q) ||
      b.leadTraveler?.email?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const summary = stats?.summary || {
    totalRevenue: bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((s, b) => s + (b.totalPrice || 0), 0),
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    rejectedBookings: bookings.filter(b => b.status === 'rejected').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalPackages: packages.length || 4,
    activePackages: packages.filter(p => p.isActive !== false).length,
    totalCustomers: customers.length || 1
  };

  const maxRevenue = Math.max(...(stats?.charts?.revenueByPackage?.map(p => p.totalRevenue) || [1]), 1);

  return (
    <div className={styles.adminLayout}>
      
      {/* Top Admin Header */}
      <header className={styles.adminHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.brandBadge}>
            <Shield size={18} className={styles.shieldIcon} />
            <span>WanderVista Organization Control Center</span>
          </div>
          <span className={styles.envTag}>Official Platform Admin</span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {adminUser?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className={styles.adminDetails}>
              <span className={styles.adminName}>{adminUser?.fullName || 'Organization Admin'}</span>
              <span className={styles.adminEmail}>{adminUser?.email || 'admin@wandervista.com'}</span>
            </div>
          </div>

          <button onClick={handleAdminLogout} className={styles.logoutBtn} title="Sign Out of Admin Console">
            <LogOut size={16} />
            <span>Admin Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className={styles.mainContainer}>
        
        {/* Navigation Tabs */}
        <div className={styles.controlStrip}>
          <div className={styles.tabGroup}>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.tabActive : ''}`}
            >
              <BarChart2 size={16} /> Operations & Analytics
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`${styles.tabBtn} ${activeTab === 'packages' ? styles.tabActive : ''}`}
            >
              <Package size={16} /> Manage Packages ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`${styles.tabBtn} ${activeTab === 'availability' ? styles.tabActive : ''}`}
            >
              <Clock size={16} /> Manage Availability & Capacity
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.tabActive : ''}`}
            >
              <Calendar size={16} /> Manage Bookings ({bookings.length})
              {summary.pendingBookings > 0 && (
                <span className={styles.pendingBadgeMini}>{summary.pendingBookings} New</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`${styles.tabBtn} ${activeTab === 'customers' ? styles.tabActive : ''}`}
            >
              <Users size={16} /> Customers ({customers.length})
            </button>
          </div>

          <button onClick={loadAllAdminData} className={styles.refreshBtn} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
            <span>Sync Database</span>
          </button>
        </div>

        {/* Toast Alert */}
        {notification && (
          <div className={`${styles.toast} ${notification.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
            {notification.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
            <span>{notification.text}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: OPERATIONS & ANALYTICS */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && (
          <div className={styles.tabContent}>
            
            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa' }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>Total Confirmed Revenue</div>
                  <div className={styles.kpiValue}>₹{summary.totalRevenue.toLocaleString('en-IN')}</div>
                  <div className={styles.kpiSub}>From confirmed customer expeditions</div>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>Pending Bookings</div>
                  <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>{summary.pendingBookings}</div>
                  <div className={styles.kpiSub}>Awaiting organization review & confirmation</div>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#4ade80' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>Total Bookings</div>
                  <div className={styles.kpiValue}>{summary.totalBookings}</div>
                  <div className={styles.kpiSub}>
                    <span style={{ color: '#4ade80' }}>{summary.confirmedBookings} Confirmed</span> · <span style={{ color: '#f87171' }}>{summary.cancelledBookings} Cancelled</span>
                  </div>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#c084fc' }}>
                  <Package size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>Active Packages</div>
                  <div className={styles.kpiValue}>{summary.activePackages} / {summary.totalPackages}</div>
                  <div className={styles.kpiSub}>Published in customer catalog</div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className={styles.chartsGrid}>
              
              {/* Revenue by Package */}
              <div className={styles.chartPanel}>
                <h3 className={styles.panelTitle}>Revenue by Tour Package (₹)</h3>
                <p className={styles.panelSub}>Direct income generated per package</p>

                <div className={styles.barList}>
                  {stats?.charts?.revenueByPackage?.length > 0 ? (
                    stats.charts.revenueByPackage.map((item, idx) => {
                      const pct = Math.round((item.totalRevenue / maxRevenue) * 100);
                      return (
                        <div key={idx} className={styles.barItem}>
                          <div className={styles.barMeta}>
                            <span className={styles.barName}>{item._id}</span>
                            <span className={styles.barVal}>₹{item.totalRevenue.toLocaleString('en-IN')} ({item.bookingsCount} confirmed)</span>
                          </div>
                          <div className={styles.barTrack}>
                            <div
                              className={styles.barFill}
                              style={{ width: `${Math.max(8, pct)}%`, background: `hsl(${210 + idx * 25}, 90%, 60%)` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.emptyNotice}>
                      No confirmed bookings recorded yet. New customer bookings will update charts in real-time.
                    </div>
                  )}
                </div>
              </div>

              {/* Status Breakdown & Categories */}
              <div className={styles.chartPanel}>
                <h3 className={styles.panelTitle}>Reservation Status Breakdown</h3>
                <p className={styles.panelSub}>Direct booking pipeline</p>

                <div className={styles.statusMeterWrap}>
                  <div className={styles.statusMeter}>
                    <div
                      className={styles.meterAmber}
                      style={{
                        width: `${summary.totalBookings > 0 ? (summary.pendingBookings / summary.totalBookings) * 100 : 0}%`
                      }}
                    />
                    <div
                      className={styles.meterGreen}
                      style={{
                        width: `${summary.totalBookings > 0 ? (summary.confirmedBookings / summary.totalBookings) * 100 : 100}%`
                      }}
                    />
                    <div
                      className={styles.meterRed}
                      style={{
                        width: `${summary.totalBookings > 0 ? (summary.cancelledBookings / summary.totalBookings) * 100 : 0}%`
                      }}
                    />
                  </div>

                  <div className={styles.legendRow}>
                    <div className={styles.legendEntry}>
                      <span className={styles.dot} style={{ background: '#f59e0b' }} />
                      <span>Pending: <strong>{summary.pendingBookings}</strong></span>
                    </div>
                    <div className={styles.legendEntry}>
                      <span className={styles.dot} style={{ background: '#22c55e' }} />
                      <span>Confirmed: <strong>{summary.confirmedBookings}</strong></span>
                    </div>
                    <div className={styles.legendEntry}>
                      <span className={styles.dot} style={{ background: '#ef4444' }} />
                      <span>Cancelled: <strong>{summary.cancelledBookings}</strong></span>
                    </div>
                  </div>
                </div>

                <hr className={styles.panelDivider} />

                <h4 className={styles.miniTitle}>Direct Organization Controls</h4>
                <div className={styles.quickActionLinks}>
                  <button onClick={() => setActiveTab('bookings')} className={styles.quickActionBtn}>
                    Review Pending Bookings ({summary.pendingBookings}) →
                  </button>
                  <button onClick={() => setActiveTab('availability')} className={styles.quickActionBtn}>
                    Manage Departure Dates & Seats →
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MANAGE PACKAGES */}
        {/* ========================================================= */}
        {activeTab === 'packages' && (
          <div className={styles.tabContent}>
            <div className={styles.tablePanel}>
              
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelHeading}>Organization Tour Packages (`db.packages`)</h2>
                  <p className={styles.panelSub}>Create, edit, toggle visibility, and adjust pricing. Disabled packages immediately disappear from the customer listing.</p>
                </div>
                <button onClick={handleOpenAddPkg} className={styles.primaryBtn}>
                  <Plus size={16} /> Create Tour Package
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Tour Package Title</th>
                      <th>Destination</th>
                      <th>Price / Person</th>
                      <th>Duration</th>
                      <th>Max Capacity</th>
                      <th>Customer Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(p => {
                      const isActive = p.isActive !== false;
                      return (
                        <tr key={p.id || p._id} style={{ opacity: isActive ? 1 : 0.65 }}>
                          <td>
                            <img src={p.coverImage} alt="" className={styles.tableThumb} />
                          </td>
                          <td>
                            <strong className={styles.pkgTitleText}>{p.title}</strong>
                            <span className={styles.subText}>{p.category}</span>
                          </td>
                          <td>
                            {p.destination}, {p.country} {p.flag}
                          </td>
                          <td>
                            <strong className={styles.priceHighlight}>₹{p.price?.toLocaleString('en-IN')}</strong>
                          </td>
                          <td>{p.duration}</td>
                          <td>{p.capacity || 12} Seats</td>
                          <td>
                            <button
                              onClick={() => handleToggleActive(p)}
                              className={`${styles.toggleActiveBtn} ${isActive ? styles.btnActiveOn : styles.btnActiveOff}`}
                              title={isActive ? 'Click to Disable from Customer Website' : 'Click to Enable on Customer Website'}
                            >
                              {isActive ? (
                                <>
                                  <Check size={14} /> Active (Visible)
                                </>
                              ) : (
                                <>
                                  <Ban size={14} /> Disabled (Hidden)
                                </>
                              )}
                            </button>
                          </td>
                          <td>
                            <div className={styles.actionBtns}>
                              <button
                                onClick={() => handleOpenEditPkg(p)}
                                className={styles.editBtn}
                                title="Edit Package Details"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeletePkg(p.id || p._id)}
                                className={styles.deleteBtn}
                                title="Delete Package"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MANAGE AVAILABILITY & CAPACITY */}
        {/* ========================================================= */}
        {activeTab === 'availability' && (
          <div className={styles.tabContent}>
            <div className={styles.tablePanel}>
              
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelHeading}>Availability & Departure Capacity Control</h2>
                  <p className={styles.panelSub}>Directly control available departure dates, set capacity limits, monitor booked seats, and close dates manually.</p>
                </div>
              </div>

              {/* Package Selector */}
              <div className={styles.availSelectorBox}>
                <label>Select Tour Package:</label>
                <select
                  value={selectedPkgForAvail?.id || selectedPkgForAvail?._id || ''}
                  onChange={(e) => {
                    const sel = packages.find(p => (p.id === e.target.value || p._id === e.target.value));
                    if (sel) setSelectedPkgForAvail(sel);
                  }}
                  className={styles.availPkgSelect}
                >
                  {packages.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.title} ({p.destination}) - ₹{p.price?.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPkgForAvail && (
                <div>
                  
                  {/* Add New Date Form */}
                  <form onSubmit={handleAddAvailDate} className={styles.addDateForm}>
                    <div className={styles.addDateInputs}>
                      <div className={styles.field}>
                        <label className={styles.inputLabel}>Add New Departure Date</label>
                        <input
                          type="date"
                          required
                          value={newAvailDate}
                          onChange={(e) => setNewAvailDate(e.target.value)}
                          className={styles.dateInput}
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.inputLabel}>Max Seat Capacity</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={newAvailCapacity}
                          onChange={(e) => setNewAvailCapacity(e.target.value)}
                          className={styles.capacityInput}
                        />
                      </div>

                      <button type="submit" className={styles.primaryBtn} style={{ alignSelf: 'flex-end' }}>
                        <Plus size={15} /> Add Departure Date
                      </button>
                    </div>
                  </form>

                  {/* Schedule Table */}
                  <div className={styles.tableWrap} style={{ marginTop: '1.5rem' }}>
                    <table className={styles.adminTable}>
                      <thead>
                        <tr>
                          <th>Departure Date</th>
                          <th>Total Capacity</th>
                          <th>Booked Seats</th>
                          <th>Remaining Spots</th>
                          <th>Date Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedPkgForAvail.schedule && selectedPkgForAvail.schedule.length > 0
                          ? selectedPkgForAvail.schedule
                          : (selectedPkgForAvail.availableDates || []).map(d => ({
                              date: d,
                              capacity: selectedPkgForAvail.capacity || 12,
                              bookedSpots: 0,
                              isClosed: false
                            }))
                        ).map((s, idx) => {
                          const remaining = Math.max(0, (s.capacity || 12) - (s.bookedSpots || 0));
                          const isFull = remaining === 0;
                          return (
                            <tr key={idx}>
                              <td>
                                <strong>
                                  {new Date(s.date).toLocaleDateString('en-IN', {
                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                  })}
                                </strong>
                                <span className={styles.subText}><code>{s.date}</code></span>
                              </td>
                              <td>{s.capacity || 12} Travelers</td>
                              <td><strong>{s.bookedSpots || 0} Booked</strong></td>
                              <td>
                                <strong style={{ color: isFull ? '#ef4444' : '#4ade80' }}>
                                  {remaining} Spots Left
                                </strong>
                              </td>
                              <td>
                                <span className={`${styles.statusBadge} ${s.isClosed || isFull ? styles.statusCancelled : styles.statusConfirmed}`}>
                                  {s.isClosed ? 'Closed Manually' : isFull ? 'Capacity Full' : 'Open for Bookings'}
                                </span>
                              </td>
                              <td>
                                <div className={styles.actionBtns}>
                                  <button
                                    onClick={() => handleToggleCloseDate(s.date)}
                                    className={styles.btnActionSecondary}
                                    title={s.isClosed ? 'Open Date for Bookings' : 'Close Date'}
                                  >
                                    {s.isClosed ? 'Open Date' : 'Close Date'}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveDate(s.date)}
                                    className={styles.deleteBtn}
                                    title="Delete Date"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MANAGE BOOKINGS */}
        {/* ========================================================= */}
        {activeTab === 'bookings' && (
          <div className={styles.tabContent}>
            <div className={styles.tablePanel}>
              
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelHeading}>Customer Bookings Pipeline (`db.bookings`)</h2>
                  <p className={styles.panelSub}>Review all customer bookings. Default new bookings are <strong>Pending</strong> until confirmed or rejected by the organization.</p>
                </div>

                {/* Filter & Search Bar */}
                <div className={styles.filterControls}>
                  <div className={styles.searchBox}>
                    <Search size={15} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search ref, customer, or tour..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">All Statuses ({bookings.length})</option>
                    <option value="pending">Pending ({summary.pendingBookings})</option>
                    <option value="confirmed">Confirmed ({summary.confirmedBookings})</option>
                    <option value="rejected">Rejected ({summary.rejectedBookings})</option>
                    <option value="cancelled">Cancelled ({summary.cancelledBookings})</option>
                    <option value="completed">Completed ({summary.completedBookings})</option>
                  </select>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className={styles.emptyNotice}>No bookings match the selected criteria.</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Customer / Contact</th>
                        <th>Tour Package</th>
                        <th>Travel Date</th>
                        <th>Travelers</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Update Organization Status</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => (
                        <tr key={b._id || b.bookingRef}>
                          <td><code className={styles.refCode}>{b.bookingRef}</code></td>
                          <td>
                            <strong>{b.leadTraveler?.fullName}</strong>
                            <div className={styles.subText}>{b.leadTraveler?.email}</div>
                            <div className={styles.subText}>{b.leadTraveler?.phone}</div>
                          </td>
                          <td>
                            <strong>{b.packageTitle}</strong>
                            <div className={styles.subText}>{b.destination}, {b.country}</div>
                          </td>
                          <td>
                            {new Date(b.departureDate).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td>{b.travelersCount} Person{b.travelersCount > 1 ? 's' : ''}</td>
                          <td><strong className={styles.priceHighlight}>₹{b.totalPrice?.toLocaleString('en-IN')}</strong></td>
                          <td>
                            <span className={`${styles.statusBadge} ${
                              b.status === 'confirmed' ? styles.statusConfirmed :
                              b.status === 'pending' ? styles.statusPending :
                              b.status === 'rejected' ? styles.statusRejected :
                              b.status === 'cancelled' ? styles.statusCancelled : styles.statusCompleted
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.statusActionGroup}>
                              {b.status !== 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id || b.bookingRef, 'confirmed')}
                                  className={styles.btnConfirm}
                                  title="Confirm Booking"
                                >
                                  Confirm
                                </button>
                              )}
                              {b.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id || b.bookingRef, 'rejected')}
                                  className={styles.btnReject}
                                  title="Reject Booking"
                                >
                                  Reject
                                </button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id || b.bookingRef, 'cancelled')}
                                  className={styles.btnCancel}
                                  title="Cancel Booking"
                                >
                                  Cancel
                                </button>
                              )}
                              {b.status !== 'completed' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id || b.bookingRef, 'completed')}
                                  className={styles.btnComplete}
                                  title="Mark Completed"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className={styles.btnViewDetails}
                              title="View Full Booking Info"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MANAGE CUSTOMERS */}
        {/* ========================================================= */}
        {activeTab === 'customers' && (
          <div className={styles.tabContent}>
            <div className={styles.tablePanel}>
              
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelHeading}>Registered Customers (`db.users` role='customer')</h2>
                  <p className={styles.panelSub}>Customer directory, registered contact information, and lifetime booking history.</p>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th>Country</th>
                      <th>Total Bookings</th>
                      <th>Total Spent</th>
                      <th>Account Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c._id}>
                        <td>
                          <div className={styles.customerRow}>
                            <div className={styles.userInitials}>
                              {c.fullName?.slice(0, 2).toUpperCase() || 'CU'}
                            </div>
                            <strong>{c.fullName}</strong>
                          </div>
                        </td>
                        <td>{c.email}</td>
                        <td>{c.phone || 'N/A'}</td>
                        <td>{c.country || 'India'}</td>
                        <td><strong>{c.totalBookings || 0} Bookings</strong></td>
                        <td><strong className={styles.priceHighlight}>₹{(c.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
                        <td>
                          {new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL: VIEW FULL BOOKING DETAILS */}
      {/* ========================================================= */}
      {selectedBooking && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            
            <div className={styles.modalHeader}>
              <div>
                <h3>Booking Record: {selectedBooking.bookingRef}</h3>
                <span className={`${styles.statusBadge} ${
                  selectedBooking.status === 'confirmed' ? styles.statusConfirmed :
                  selectedBooking.status === 'pending' ? styles.statusPending :
                  selectedBooking.status === 'rejected' ? styles.statusRejected :
                  selectedBooking.status === 'cancelled' ? styles.statusCancelled : styles.statusCompleted
                }`}>
                  Status: {selectedBooking.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.bookingDetailBody}>
              <div className={styles.detailSection}>
                <h4>Tour Package Details</h4>
                <p><strong>Package:</strong> {selectedBooking.packageTitle}</p>
                <p><strong>Destination:</strong> {selectedBooking.destination}, {selectedBooking.country}</p>
                <p><strong>Departure Date:</strong> {new Date(selectedBooking.departureDate).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                })}</p>
              </div>

              <div className={styles.detailSection}>
                <h4>Lead Customer Details</h4>
                <p><strong>Full Name:</strong> {selectedBooking.leadTraveler?.fullName}</p>
                <p><strong>Email Address:</strong> {selectedBooking.leadTraveler?.email}</p>
                <p><strong>Phone Number:</strong> {selectedBooking.leadTraveler?.phone}</p>
              </div>

              {selectedBooking.additionalTravelers && selectedBooking.additionalTravelers.length > 0 && (
                <div className={styles.detailSection}>
                  <h4>Additional Travelers ({selectedBooking.additionalTravelers.length})</h4>
                  <ul>
                    {selectedBooking.additionalTravelers.map((t, i) => (
                      <li key={i}>{t.fullName}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedBooking.specialRequests && (
                <div className={styles.detailSection}>
                  <h4>Customer Special Requests</h4>
                  <p className={styles.reqText}>{selectedBooking.specialRequests}</p>
                </div>
              )}

              <div className={styles.detailSection}>
                <h4>Financial Breakdown</h4>
                <p>Price per Person: ₹{selectedBooking.pricePerPerson?.toLocaleString('en-IN')}</p>
                <p>Travelers: {selectedBooking.travelersCount}</p>
                <p>Subtotal: ₹{selectedBooking.subtotal?.toLocaleString('en-IN')}</p>
                <p>Taxes (5%): ₹{selectedBooking.taxes?.toLocaleString('en-IN')}</p>
                <p><strong className={styles.priceHighlight}>Total Price: ₹{selectedBooking.totalPrice?.toLocaleString('en-IN')}</strong></p>
              </div>

              <div className={styles.modalStatusButtons}>
                <span>Change Status:</span>
                <button onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.bookingRef, 'confirmed')} className={styles.btnConfirm}>
                  Confirm
                </button>
                <button onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.bookingRef, 'rejected')} className={styles.btnReject}>
                  Reject
                </button>
                <button onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.bookingRef, 'cancelled')} className={styles.btnCancel}>
                  Cancel
                </button>
                <button onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.bookingRef, 'completed')} className={styles.btnComplete}>
                  Mark Completed
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PACKAGE */}
      {/* ========================================================= */}
      {showPkgModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            
            <div className={styles.modalHeader}>
              <h3>{editingPkg ? 'Edit Tour Package' : 'Create Organization Tour Package'}</h3>
              <button onClick={() => setShowPkgModal(false)} className={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePkg} className={styles.modalForm}>
              <div className={styles.modalGrid}>
                <div className={styles.modalField}>
                  <label>Package Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiss Alps & Glacier Express"
                    value={pkgFormData.title}
                    onChange={(e) => setPkgFormData(f => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div className={styles.modalField}>
                  <label>Destination City / Region *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Interlaken & Zermatt"
                    value={pkgFormData.destination}
                    onChange={(e) => setPkgFormData(f => ({ ...f, destination: e.target.value }))}
                  />
                </div>

                <div className={styles.modalField}>
                  <label>Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Switzerland"
                    value={pkgFormData.country}
                    onChange={(e) => setPkgFormData(f => ({ ...f, country: e.target.value }))}
                  />
                </div>

                <div className={styles.modalField}>
                  <label>Country Flag Emoji</label>
                  <input
                    type="text"
                    placeholder="🇨🇭"
                    value={pkgFormData.flag}
                    onChange={(e) => setPkgFormData(f => ({ ...f, flag: e.target.value }))}
                  />
                </div>

                <div className={styles.modalField}>
                  <label>Category *</label>
                  <select
                    value={pkgFormData.category}
                    onChange={(e) => setPkgFormData(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="Mountain & Alpine">Mountain & Alpine</option>
                    <option value="Cultural Heritage">Cultural Heritage</option>
                    <option value="Beach & Coastal">Beach & Coastal</option>
                    <option value="City Exploration">City Exploration</option>
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label>Price in INR (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 145000"
                    value={pkgFormData.price}
                    onChange={(e) => setPkgFormData(f => ({ ...f, price: e.target.value }))}
                  />
                </div>

                <div className={styles.modalField}>
                  <label>Duration String</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 Days / 7 Nights"
                    value={pkgFormData.duration}
                    onChange={(e) => setPkgFormData(f => ({ ...f, duration: e.target.value }))}
                  />
                </div>

                <div className={styles.modalField}>
                  <label>Max Seat Capacity Per Departure</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={pkgFormData.capacity}
                    onChange={(e) => setPkgFormData(f => ({ ...f, capacity: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className={styles.modalField}>
                <label>Cover Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={pkgFormData.coverImage}
                  onChange={(e) => setPkgFormData(f => ({ ...f, coverImage: e.target.value }))}
                />
              </div>

              <div className={styles.modalField}>
                <label>Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Concise overview for cards..."
                  value={pkgFormData.shortDescription}
                  onChange={(e) => setPkgFormData(f => ({ ...f, shortDescription: e.target.value }))}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowPkgModal(false)} className={styles.modalCancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  {editingPkg ? 'Save Package Changes' : 'Publish Tour Package'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
