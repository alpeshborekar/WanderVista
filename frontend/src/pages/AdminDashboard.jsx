import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, Users, Package, Database, CheckCircle,
  XCircle, ArrowLeft, RefreshCw, BarChart2, Shield, LogOut,
  Plus, Edit, Trash2, Search, Filter, Clock, MapPin, DollarSign,
  AlertTriangle, X, Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminAPI } from '../services/api';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, packages, bookings, customers
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
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
    shortDescription: '',
    overview: ''
  });

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
      setPackages(pkgRes.packages || []);
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

  // Booking Status Update
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      showToast(`Booking status updated to ${newStatus}.`);
      setBookings(prev =>
        prev.map(b => (b._id === bookingId || b.bookingRef === bookingId) ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Package Management (Add / Edit / Delete)
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
      coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
      shortDescription: '',
      overview: ''
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
      coverImage: pkg.coverImage || '',
      shortDescription: pkg.shortDescription || '',
      overview: pkg.overview || ''
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
        showToast('New tour package added to catalog.');
        if (res.package) setPackages(prev => [res.package, ...prev]);
      }
      setShowPkgModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save package.', 'error');
    }
  };

  const handleDeletePkg = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tour package from the catalog?')) return;
    try {
      await adminAPI.deletePackage(id);
      showToast('Package deleted from catalog.');
      setPackages(prev => prev.filter(p => p.id !== id && p._id !== id));
    } catch (err) {
      showToast(err.message || 'Failed to delete package.', 'error');
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
    totalRevenue: bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalPrice || 0), 0),
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    totalPackages: packages.length || 6,
    totalCustomers: customers.length || 1
  };

  const maxRevenue = Math.max(...(stats?.charts?.revenueByPackage?.map(p => p.totalRevenue) || [1]), 1);

  return (
    <div className={styles.adminLayout}>
      
      {/* Top Admin Navigation Bar */}
      <header className={styles.adminHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.brandBadge}>
            <Shield size={18} className={styles.shieldIcon} />
            <span>WanderVista Admin Portal</span>
          </div>
          <span className={styles.envTag}>Production Mode</span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {adminUser?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className={styles.adminDetails}>
              <span className={styles.adminName}>{adminUser?.fullName || 'Administrator'}</span>
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
        
        {/* Sub-header & Navigation Tabs */}
        <div className={styles.controlStrip}>
          <div className={styles.tabGroup}>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.tabActive : ''}`}
            >
              <BarChart2 size={16} /> Analytics & KPI Overview
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`${styles.tabBtn} ${activeTab === 'packages' ? styles.tabActive : ''}`}
            >
              <Package size={16} /> Manage Packages ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.tabActive : ''}`}
            >
              <Calendar size={16} /> Manage Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`${styles.tabBtn} ${activeTab === 'customers' ? styles.tabActive : ''}`}
            >
              <Users size={16} /> Manage Customers ({customers.length})
            </button>
          </div>

          <button onClick={loadAllAdminData} className={styles.refreshBtn} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
            <span>Sync Live DB</span>
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
        {/* TAB 1: ANALYTICS & KPI OVERVIEW */}
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
                  <div className={styles.kpiSub}>From {summary.confirmedBookings} active reservations</div>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#4ade80' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>Total Reservations</div>
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
                  <div className={styles.kpiLabel}>Tour Packages in Catalog</div>
                  <div className={styles.kpiValue}>{summary.totalPackages}</div>
                  <div className={styles.kpiSub}>Active global itineraries</div>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIcon} style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24' }}>
                  <Users size={22} />
                </div>
                <div>
                  <div className={styles.kpiLabel}>Registered Customers</div>
                  <div className={styles.kpiValue}>{summary.totalCustomers}</div>
                  <div className={styles.kpiSub}>Customer Accounts in MongoDB</div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className={styles.chartsGrid}>
              
              {/* Revenue by Package */}
              <div className={styles.chartPanel}>
                <h3 className={styles.panelTitle}>Revenue by Tour Package (₹)</h3>
                <p className={styles.panelSub}>Aggregated confirmed income per package</p>

                <div className={styles.barList}>
                  {stats?.charts?.revenueByPackage?.length > 0 ? (
                    stats.charts.revenueByPackage.map((item, idx) => {
                      const pct = Math.round((item.totalRevenue / maxRevenue) * 100);
                      return (
                        <div key={idx} className={styles.barItem}>
                          <div className={styles.barMeta}>
                            <span className={styles.barName}>{item._id}</span>
                            <span className={styles.barVal}>₹{item.totalRevenue.toLocaleString('en-IN')} ({item.bookingsCount} bookings)</span>
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

              {/* Status Ratio & Categories */}
              <div className={styles.chartPanel}>
                <h3 className={styles.panelTitle}>Booking Status Distribution</h3>
                <p className={styles.panelSub}>Ratio of confirmed vs cancelled reservations</p>

                <div className={styles.statusMeterWrap}>
                  <div className={styles.statusMeter}>
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
                      <span className={styles.dot} style={{ background: '#22c55e' }} />
                      <span>Confirmed: <strong>{summary.confirmedBookings}</strong> ({summary.totalBookings > 0 ? Math.round((summary.confirmedBookings / summary.totalBookings) * 100) : 100}%)</span>
                    </div>
                    <div className={styles.legendEntry}>
                      <span className={styles.dot} style={{ background: '#ef4444' }} />
                      <span>Cancelled: <strong>{summary.cancelledBookings}</strong> ({summary.totalBookings > 0 ? Math.round((summary.cancelledBookings / summary.totalBookings) * 100) : 0}%)</span>
                    </div>
                  </div>
                </div>

                <hr className={styles.panelDivider} />

                <h4 className={styles.miniTitle}>Tour Categories in Database</h4>
                <div className={styles.categoryPills}>
                  <div className={styles.pill}>⛰️ Mountain & Alpine: <strong>2 tours</strong></div>
                  <div className={styles.pill}>🏛️ Cultural Heritage: <strong>3 tours</strong></div>
                  <div className={styles.pill}>🏖️ Beach & Coastal: <strong>2 tours</strong></div>
                  <div className={styles.pill}>🏙️ City Exploration: <strong>1 tour</strong></div>
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
                  <h2 className={styles.panelHeading}>Tour Packages Catalog (`db.packages`)</h2>
                  <p className={styles.panelSub}>Create, edit, and manage all published travel itineraries.</p>
                </div>
                <button onClick={handleOpenAddPkg} className={styles.primaryBtn}>
                  <Plus size={16} /> Add New Tour Package
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Tour Title</th>
                      <th>Destination / Country</th>
                      <th>Category</th>
                      <th>Price / Person</th>
                      <th>Duration</th>
                      <th>Group Size</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(p => (
                      <tr key={p.id || p._id}>
                        <td>
                          <img src={p.coverImage} alt="" className={styles.tableThumb} />
                        </td>
                        <td>
                          <strong className={styles.pkgTitleText}>{p.title}</strong>
                        </td>
                        <td>
                          {p.destination}, {p.country} {p.flag}
                        </td>
                        <td>
                          <span className={styles.catBadge}>{p.category}</span>
                        </td>
                        <td>
                          <strong className={styles.priceHighlight}>₹{p.price?.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>{p.duration}</td>
                        <td>{p.groupSize}</td>
                        <td>⭐ {p.rating} ({p.reviewCount})</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              onClick={() => handleOpenEditPkg(p)}
                              className={styles.editBtn}
                              title="Edit Package"
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
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MANAGE BOOKINGS */}
        {/* ========================================================= */}
        {activeTab === 'bookings' && (
          <div className={styles.tabContent}>
            <div className={styles.tablePanel}>
              
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelHeading}>Customer Bookings (`db.bookings`)</h2>
                  <p className={styles.panelSub}>View customer reservations, verify departure dates, and update statuses.</p>
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
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
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
                        <th>Lead Traveler</th>
                        <th>Contact Email & Phone</th>
                        <th>Tour Package</th>
                        <th>Departure Date</th>
                        <th>Travelers</th>
                        <th>Total Paid</th>
                        <th>Status</th>
                        <th>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => (
                        <tr key={b._id || b.bookingRef}>
                          <td><code className={styles.refCode}>{b.bookingRef}</code></td>
                          <td><strong>{b.leadTraveler?.fullName}</strong></td>
                          <td>
                            <div>{b.leadTraveler?.email}</div>
                            <span className={styles.subText}>{b.leadTraveler?.phone}</span>
                          </td>
                          <td>{b.packageTitle}</td>
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
                                  title="Mark Confirmed"
                                >
                                  Confirm
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
        {/* TAB 4: MANAGE CUSTOMERS */}
        {/* ========================================================= */}
        {activeTab === 'customers' && (
          <div className={styles.tabContent}>
            <div className={styles.tablePanel}>
              
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelHeading}>Registered Customers (`db.users` role='customer')</h2>
                  <p className={styles.panelSub}>Customer directory, registered contact information, and total spending.</p>
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
                        <td><strong>{c.totalBookings || 0}</strong></td>
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
      {/* MODAL: ADD / EDIT PACKAGE */}
      {/* ========================================================= */}
      {showPkgModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            
            <div className={styles.modalHeader}>
              <h3>{editingPkg ? 'Edit Tour Package' : 'Create New Tour Package'}</h3>
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
                  <label>Group Size</label>
                  <input
                    type="text"
                    placeholder="e.g. Max 12 travelers"
                    value={pkgFormData.groupSize}
                    onChange={(e) => setPkgFormData(f => ({ ...f, groupSize: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.modalField}>
                <label>Cover Image URL (Unsplash / Direct Link) *</label>
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
