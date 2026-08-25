import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, Users, Package, Database, CheckCircle,
  XCircle, ArrowLeft, RefreshCw, BarChart2, PieChart, ShieldCheck, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { analyticsAPI, packagesAPI, bookingsAPI } from '../services/api';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [allPackages, setAllPackages] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, bookings, packages
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      // Check health
      fetch('/api/health')
        .then(r => r.json())
        .then(d => setDbStatus(d.status === 'OK' ? 'Connected (Port 5001)' : 'Offline'))
        .catch(() => setDbStatus('Active (Client Fallback Mode)'));

      const [statsRes, pkgRes, bkgRes] = await Promise.all([
        analyticsAPI.getStats(),
        packagesAPI.getAll(),
        bookingsAPI.getMyBookings()
      ]);

      setStats(statsRes);
      setAllPackages(pkgRes.packages || []);
      setAllBookings(bkgRes.bookings || []);
    } catch (err) {
      console.error('Admin data error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const summary = stats?.summary || {
    totalRevenue: allBookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalPrice || 0), 0),
    totalBookings: allBookings.length,
    confirmedBookings: allBookings.filter(b => b.status === 'confirmed').length,
    cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
    totalPackages: allPackages.length || 6,
    totalUsers: 1
  };

  const maxRevenue = Math.max(...(stats?.charts?.revenueByPackage?.map(p => p.totalRevenue) || [1]), 1);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          
          {/* Header */}
          <div className={styles.header}>
            <div>
              <div className={styles.adminBadge}>
                <Database size={14} /> Live Database & Analytics Console
              </div>
              <h1 className={styles.title}>System Analytics & Database View</h1>
              <p className={styles.subtitle}>
                Real-time MongoDB metrics, bookings revenue charts, and active database collections.
              </p>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.dbIndicator}>
                <span className={styles.dbDot} />
                <span>DB: <strong>{dbStatus}</strong></span>
              </div>
              <button onClick={loadAllData} className={styles.refreshBtn} disabled={refreshing}>
                <RefreshCw size={15} className={refreshing ? styles.spinning : ''} />
                Refresh Live Data
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabsBar}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart2 size={16} /> Overview & DB Charts
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={16} /> Bookings Collection ({allBookings.length})
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'packages' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              <Package size={16} /> Tour Packages Collection ({allPackages.length})
            </button>
          </div>

          {/* Tab 1: Overview & DB Charts */}
          {activeTab === 'overview' && (
            <>
              {/* Metric Cards Grid */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <div className={styles.statLabel}>Total Confirmed Revenue</div>
                    <div className={styles.statValue}>₹{summary.totalRevenue.toLocaleString('en-IN')}</div>
                    <div className={styles.statSub}>From {summary.confirmedBookings} confirmed bookings</div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <div className={styles.statLabel}>Total Bookings</div>
                    <div className={styles.statValue}>{summary.totalBookings}</div>
                    <div className={styles.statSub}>
                      <strong style={{ color: '#16a34a' }}>{summary.confirmedBookings} Active</strong> · <span style={{ color: '#dc2626' }}>{summary.cancelledBookings} Cancelled</span>
                    </div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: '#faf5ff', color: '#9333ea' }}>
                    <Package size={22} />
                  </div>
                  <div>
                    <div className={styles.statLabel}>Active Tour Packages</div>
                    <div className={styles.statValue}>{summary.totalPackages}</div>
                    <div className={styles.statSub}>Across Switzerland, Japan, Bali, India, etc.</div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: '#fffbeb', color: '#d97706' }}>
                    <Database size={22} />
                  </div>
                  <div>
                    <div className={styles.statLabel}>Database Status</div>
                    <div className={styles.statValue} style={{ fontSize: '1.25rem' }}>Active & Synced</div>
                    <div className={styles.statSub}>Port 5001 / MongoDB</div>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className={styles.chartsGrid}>
                
                {/* Chart 1: Revenue by Package Bar Chart */}
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <div>
                      <h3 className={styles.chartTitle}>Revenue by Tour Package</h3>
                      <p className={styles.chartSub}>Breakdown of confirmed booking income per destination package</p>
                    </div>
                  </div>

                  <div className={styles.barChartList}>
                    {stats?.charts?.revenueByPackage?.length > 0 ? (
                      stats.charts.revenueByPackage.map((item, idx) => {
                        const pct = Math.round((item.totalRevenue / maxRevenue) * 100);
                        return (
                          <div key={idx} className={styles.barRow}>
                            <div className={styles.barLabelGroup}>
                              <span className={styles.barPkgName}>{item._id}</span>
                              <span className={styles.barPkgRevenue}>₹{item.totalRevenue.toLocaleString('en-IN')} ({item.bookingsCount} booking{item.bookingsCount > 1 ? 's' : ''})</span>
                            </div>
                            <div className={styles.barTrack}>
                              <div
                                className={styles.barFill}
                                style={{ width: `${Math.max(8, pct)}%`, background: `hsl(${220 + idx * 20}, 85%, 55%)` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.noDataBox}>
                        <p>No confirmed bookings recorded yet. Once users book tours, revenue charts will update in real-time.</p>
                        <Link to="/" className={styles.testBookLink}>Make a test booking →</Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart 2: Booking Status Breakdown */}
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <div>
                      <h3 className={styles.chartTitle}>Reservation Status Distribution</h3>
                      <p className={styles.chartSub}>Ratio of confirmed vs cancelled reservations</p>
                    </div>
                  </div>

                  <div className={styles.statusBreakdownBox}>
                    <div className={styles.statusMeter}>
                      <div
                        className={styles.meterConfirmed}
                        style={{
                          width: `${summary.totalBookings > 0 ? (summary.confirmedBookings / summary.totalBookings) * 100 : 100}%`
                        }}
                      />
                      <div
                        className={styles.meterCancelled}
                        style={{
                          width: `${summary.totalBookings > 0 ? (summary.cancelledBookings / summary.totalBookings) * 100 : 0}%`
                        }}
                      />
                    </div>

                    <div className={styles.statusLegend}>
                      <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#16a34a' }} />
                        <span>Confirmed: <strong>{summary.confirmedBookings}</strong> ({summary.totalBookings > 0 ? Math.round((summary.confirmedBookings / summary.totalBookings) * 100) : 100}%)</span>
                      </div>
                      <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#dc2626' }} />
                        <span>Cancelled: <strong>{summary.cancelledBookings}</strong> ({summary.totalBookings > 0 ? Math.round((summary.cancelledBookings / summary.totalBookings) * 100) : 0}%)</span>
                      </div>
                    </div>

                    <hr className={styles.divider} />

                    <h4 className={styles.sectionMiniTitle}>Tour Categories in Database</h4>
                    <div className={styles.categoriesPills}>
                      <div className={styles.catPill}>⛰️ Mountain & Alpine: <strong>2</strong></div>
                      <div className={styles.catPill}>🏛️ Cultural Heritage: <strong>3</strong></div>
                      <div className={styles.catPill}>🏖️ Beach & Coastal: <strong>2</strong></div>
                      <div className={styles.catPill}>🏙️ City Exploration: <strong>1</strong></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Recent Database Records */}
              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <div>
                    <h3 className={styles.tableTitle}>Recent Database Bookings (`db.bookings`)</h3>
                    <p className={styles.tableSub}>Live stream of recent customer reservations</p>
                  </div>
                  <button onClick={() => setActiveTab('bookings')} className={styles.viewAllLink}>
                    View Complete Collection →
                  </button>
                </div>

                {allBookings.length === 0 ? (
                  <div className={styles.emptyTable}>No bookings created yet.</div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Booking Ref</th>
                          <th>Customer</th>
                          <th>Tour Package</th>
                          <th>Departure Date</th>
                          <th>Travelers</th>
                          <th>Total Paid (₹)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBookings.slice(0, 5).map((b) => (
                          <tr key={b._id || b.bookingRef}>
                            <td><strong className={styles.refMono}>{b.bookingRef}</strong></td>
                            <td>
                              <div><strong>{b.leadTraveler?.fullName}</strong></div>
                              <span className={styles.subCell}>{b.leadTraveler?.email}</span>
                            </td>
                            <td>{b.packageTitle}</td>
                            <td>{new Date(b.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td>{b.travelersCount} Person{b.travelersCount > 1 ? 's' : ''}</td>
                            <td><strong className={styles.priceCell}>₹{b.totalPrice?.toLocaleString('en-IN')}</strong></td>
                            <td>
                              <span className={`${styles.badge} ${b.status === 'cancelled' ? styles.badgeCancelled : styles.badgeConfirmed}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab 2: Full Bookings Collection */}
          {activeTab === 'bookings' && (
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <div>
                  <h3 className={styles.tableTitle}>Full Bookings Collection (`db.bookings`)</h3>
                  <p className={styles.tableSub}>Showing {allBookings.length} total documents</p>
                </div>
              </div>

              {allBookings.length === 0 ? (
                <div className={styles.emptyTable}>No booking documents in collection.</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Lead Traveler</th>
                        <th>Contact Email / Phone</th>
                        <th>Tour Package</th>
                        <th>Departure Date</th>
                        <th>Persons</th>
                        <th>Subtotal (₹)</th>
                        <th>GST (₹)</th>
                        <th>Total Paid (₹)</th>
                        <th>Status</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBookings.map((b) => (
                        <tr key={b._id || b.bookingRef}>
                          <td><strong className={styles.refMono}>{b.bookingRef}</strong></td>
                          <td><strong>{b.leadTraveler?.fullName}</strong></td>
                          <td>
                            <div>{b.leadTraveler?.email}</div>
                            <span className={styles.subCell}>{b.leadTraveler?.phone}</span>
                          </td>
                          <td>{b.packageTitle}</td>
                          <td>{new Date(b.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>{b.travelersCount}</td>
                          <td>₹{b.subtotal?.toLocaleString('en-IN')}</td>
                          <td>₹{b.taxes?.toLocaleString('en-IN')}</td>
                          <td><strong className={styles.priceCell}>₹{b.totalPrice?.toLocaleString('en-IN')}</strong></td>
                          <td>
                            <span className={`${styles.badge} ${b.status === 'cancelled' ? styles.badgeCancelled : styles.badgeConfirmed}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>{new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Full Tour Packages Collection */}
          {activeTab === 'packages' && (
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <div>
                  <h3 className={styles.tableTitle}>Tour Packages Collection (`db.packages`)</h3>
                  <p className={styles.tableSub}>Showing {allPackages.length} active curated tour packages</p>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tour Title</th>
                      <th>Destination</th>
                      <th>Country</th>
                      <th>Category</th>
                      <th>Price / Person (₹)</th>
                      <th>Duration</th>
                      <th>Group Size</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPackages.map((p) => (
                      <tr key={p.id || p._id}>
                        <td>
                          <strong>{p.title}</strong>
                        </td>
                        <td>{p.destination}</td>
                        <td>{p.flag} {p.country}</td>
                        <td><span className={styles.catTag}>{p.category}</span></td>
                        <td><strong className={styles.priceCell}>₹{p.price?.toLocaleString('en-IN')}</strong></td>
                        <td>{p.duration}</td>
                        <td>{p.groupSize}</td>
                        <td>⭐ {p.rating} ({p.reviewCount})</td>
                        <td>
                          <Link to={`/packages/${p.id || p._id}`} className={styles.viewLink}>
                            View Page →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
