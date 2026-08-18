import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, MapPin, ArrowRight, SlidersHorizontal, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { destinationsAPI } from '../services/api';
import styles from './DestinationsPage.module.css';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'beach', label: '🏖️ Beach' },
  { key: 'mountain', label: '⛰️ Mountain' },
  { key: 'city', label: '🏙️ City' },
  { key: 'adventure', label: '🧗 Adventure' },
  { key: 'culture', label: '🏛️ Culture' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

// Fallback static data when API is unavailable
const STATIC_DESTINATIONS = [
  { _id: '1', name: 'Bali', country: 'Indonesia', flag: '🇮🇩', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', rating: 4.9, price: 899, category: 'beach', featured: true, duration: '7 Days' },
  { _id: '2', name: 'Switzerland', country: 'Switzerland', flag: '🇨🇭', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80', rating: 4.8, price: 1299, category: 'mountain', featured: true, duration: '10 Days' },
  { _id: '3', name: 'Paris', country: 'France', flag: '🇫🇷', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', rating: 4.7, price: 799, category: 'city', featured: false, duration: '5 Days' },
  { _id: '4', name: 'Dubai', country: 'UAE', flag: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', rating: 4.8, price: 1099, category: 'city', featured: true, duration: '7 Days' },
  { _id: '5', name: 'Maldives', country: 'Maldives', flag: '🇲🇻', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', rating: 5.0, price: 1599, category: 'beach', featured: true, duration: '7 Days' },
  { _id: '6', name: 'Japan', country: 'Japan', flag: '🇯🇵', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80', rating: 4.9, price: 999, category: 'culture', featured: false, duration: '12 Days' },
  { _id: '7', name: 'Santorini', country: 'Greece', flag: '🇬🇷', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80', rating: 4.8, price: 1199, category: 'beach', featured: false, duration: '7 Days' },
  { _id: '8', name: 'Patagonia', country: 'Argentina', flag: '🇦🇷', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', rating: 4.7, price: 1399, category: 'adventure', featured: false, duration: '14 Days' },
];

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const params = { sort };
    if (category !== 'all') params.category = category;
    if (search) params.search = search;

    setLoading(true);
    destinationsAPI.getAll(params)
      .then(data => setDestinations(data.destinations))
      .catch(() => {
        // Fallback to static data
        let filtered = STATIC_DESTINATIONS;
        if (category !== 'all') filtered = filtered.filter(d => d.category === category);
        if (search) filtered = filtered.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
        if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
        else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
        else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
        setDestinations(filtered);
      })
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className={styles.heroBadge}><Globe2 size={16} /><span>Explore the World</span></div>
          <h1 className={styles.heroTitle}>Find Your Next<br />Adventure</h1>
          <p className={styles.heroSubtitle}>Discover breathtaking destinations across the globe, handpicked for unforgettable experiences.</p>

          <form className={styles.searchBar} onSubmit={handleSearch}>
            <Search size={20} className={styles.searchIcon} />
            <input type="text" placeholder="Search destinations..." value={searchInput}
              onChange={e => setSearchInput(e.target.value)} className={styles.searchInput} />
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>
        </motion.div>
      </section>

      <section className={styles.content}>
        <div className={styles.filters}>
          <div className={styles.categoryTabs}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)}
                className={`${styles.tab} ${category === cat.key ? styles.tabActive : ''}`}>
                {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.sortWrapper}>
            <SlidersHorizontal size={16} />
            <select value={sort} onChange={e => setSort(e.target.value)} className={styles.sortSelect}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : destinations.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🗺️</span>
            <h3>No destinations found</h3>
            <p>Try adjusting your search or filters.</p>
            <button onClick={() => { setCategory('all'); setSearch(''); setSearchInput(''); }} className={styles.resetBtn}>Reset Filters</button>
          </div>
        ) : (
          <motion.div className={styles.grid} layout>
            <AnimatePresence mode="popLayout">
              {destinations.map((dest, i) => (
                <motion.div key={dest._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }} className={styles.card}>
                  <div className={styles.imageWrap}>
                    <img src={dest.image} alt={dest.name} className={styles.cardImage} loading="lazy" />
                    <div className={styles.imageOverlay} />
                    {dest.featured && <span className={styles.featuredBadge}>⭐ Featured</span>}
                    <div className={styles.flagBadge}>{dest.flag} {dest.country}</div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.destName}><MapPin size={16} />{dest.name}</h3>
                      <div className={styles.rating}><Star size={14} fill="currentColor" />{dest.rating.toFixed(1)}</div>
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.duration}>🗓 {dest.duration}</span>
                      <span className={styles.price}>From ₹{dest.price.toLocaleString('en-IN')}</span>
                    </div>
                    <Link to={`/booking?dest=${dest._id}&name=${encodeURIComponent(dest.name)}&price=${dest.price}`} className={styles.bookBtn}>
                      Book Now <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
}
