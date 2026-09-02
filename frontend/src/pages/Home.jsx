import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Star, Users, Check, ArrowRight, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { packagesAPI } from '../services/api';
import styles from './Home.module.css';

const CATEGORIES = [
  'All Styles',
  'Mountain & Alpine',
  'Cultural Heritage',
  'Beach & Coastal',
  'City Exploration'
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All Styles');
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchPackages();
  }, [category, sort, searchParams]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'All Styles') params.category = category;
      const q = searchParams.get('search') || search;
      if (q) params.search = q;
      if (sort) params.sort = sort;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await packagesAPI.getAll(params);
      setPackages(res.packages || []);
    } catch (err) {
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search.trim()) next.set('search', search.trim());
    else next.delete('search');
    setSearchParams(next);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat !== 'All Styles') next.set('category', cat);
    else next.delete('category');
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All Styles');
    setSort('featured');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroBadge}>Official Travel & Tour Booking Platform</div>
          <h1 className={styles.heroTitle}>Discover Exceptional Travel Packages</h1>
          <p className={styles.heroSubtitle}>
            Handcrafted itineraries, verified accommodations, and certified expedition leaders organized directly by WanderVista.
          </p>

          {/* Search Bar */}
          <form className={styles.searchBox} onSubmit={handleSearchSubmit}>
            <div className={styles.searchInputGroup}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search destination, country, or tour name (e.g. Switzerland, Kyoto, Bali)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button type="submit" className={styles.searchButton}>
              Search Tours
            </button>
          </form>
        </div>
      </section>

      {/* Main Content & Packages Listing */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          
          {/* Controls: Category Tabs & Sort */}
          <div className={styles.controlsBar}>
            <div className={styles.categoryTabs}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`${styles.categoryTab} ${category === cat ? styles.categoryTabActive : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.sortWrapper}>
              <SlidersHorizontal size={15} className={styles.sortIcon} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={styles.sortSelect}
                aria-label="Sort packages"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="duration">Duration: Short to Long</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Results Summary & Active Filter indicators */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>
              Showing <strong>{packages.length}</strong> available travel package{packages.length === 1 ? '' : 's'}
            </div>
            {(category !== 'All Styles' || search || maxPrice) && (
              <button className={styles.resetLink} onClick={handleResetFilters}>
                <RotateCcw size={13} /> Reset Filters
              </button>
            )}
          </div>

          {/* Package Grid */}
          {loading ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonBody} />
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className={styles.emptyState}>
              <MapPin size={40} className={styles.emptyIcon} />
              <h3>No matching packages found</h3>
              <p>Try searching for a different destination or clearing your active filters.</p>
              <button className={styles.emptyButton} onClick={handleResetFilters}>
                Show All Packages
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {packages.map((pkg) => (
                <div key={pkg.id || pkg._id} className={styles.packageCard}>
                  {/* Card Image */}
                  <div className={styles.imageWrap}>
                    <img
                      src={pkg.coverImage}
                      alt={pkg.title}
                      className={styles.image}
                      loading="lazy"
                    />
                    <div className={styles.flagBadge}>
                      <span>{pkg.flag}</span>
                      <span>{pkg.country}</span>
                    </div>
                    <div className={styles.durationBadge}>
                      <Calendar size={13} />
                      <span>{pkg.duration}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <div className={styles.categoryLabel}>{pkg.category}</div>
                      <div className={styles.ratingBox}>
                        <Star size={14} className={styles.starIcon} fill="#f59e0b" color="#f59e0b" />
                        <span className={styles.ratingVal}>{pkg.rating.toFixed(1)}</span>
                        <span className={styles.reviewCount}>({pkg.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className={styles.cardTitle}>
                      <Link to={`/packages/${pkg.id || pkg._id}`}>{pkg.title}</Link>
                    </h3>

                    <div className={styles.destinationRow}>
                      <MapPin size={14} className={styles.pinIcon} />
                      <span>{pkg.destination}, {pkg.country}</span>
                    </div>

                    <p className={styles.shortDesc}>{pkg.shortDescription}</p>

                    {/* Included tags preview */}
                    <div className={styles.includedTags}>
                      {pkg.included?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className={styles.tagItem}>
                          <Check size={12} className={styles.tagCheck} />
                          <span>{item.length > 36 ? item.substring(0, 36) + '...' : item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Card Footer: Price and CTA */}
                    <div className={styles.cardFooter}>
                      <div className={styles.priceCol}>
                        <span className={styles.priceLabel}>Starting from</span>
                        <div className={styles.priceValue}>
                          ₹{pkg.price.toLocaleString('en-IN')}
                          <span className={styles.priceUnit}> / person</span>
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <Link
                          to={`/packages/${pkg.id || pkg._id}`}
                          className={styles.detailsBtn}
                        >
                          Details
                        </Link>
                        <Link
                          to={`/booking?packageId=${pkg.id || pkg._id}`}
                          className={styles.bookBtn}
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
