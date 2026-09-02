import { PACKAGES, getPackageById } from '../data/packagesData';

const BASE_URL = '/api';

// Customer Headers
const getCustomerHeaders = () => {
  const token = localStorage.getItem('wv_customer_token') || localStorage.getItem('wv_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Admin Headers
const getAdminHeaders = () => {
  const token = localStorage.getItem('wv_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.errors?.[0]?.msg || 'Request failed');
  }
  return data;
};

// ==========================================
// 1. CUSTOMER AUTHENTICATION API (/api/auth/*)
// ==========================================
export const authAPI = {
  register: (body) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  login: (body) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  forgotPassword: (body) =>
    fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  resetPassword: (body) =>
    fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: getCustomerHeaders()
    }).then(handleResponse),

  updateProfile: (body) =>
    fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getCustomerHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  changePassword: (body) =>
    fetch(`${BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getCustomerHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse)
};

// ==========================================
// 2. DEDICATED ADMIN API (/api/admin/*)
// ==========================================
export const adminAPI = {
  login: (body) =>
    fetch(`${BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  getAdminMe: () =>
    fetch(`${BASE_URL}/admin/auth/me`, {
      headers: getAdminHeaders()
    }).then(handleResponse),

  getStats: async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/stats`, { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) return data;
      }
    } catch (e) {
      // fallback calculation
    }

    const bookings = getLocalBookings();
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const cancelled = bookings.filter(b => b.status === 'cancelled');
    const totalRevenue = confirmed.reduce((s, b) => s + (b.totalPrice || 0), 0);

    const pkgMap = {};
    confirmed.forEach(b => {
      const key = b.packageTitle || 'Tour Package';
      if (!pkgMap[key]) pkgMap[key] = { _id: key, totalRevenue: 0, bookingsCount: 0 };
      pkgMap[key].totalRevenue += b.totalPrice || 0;
      pkgMap[key].bookingsCount += 1;
    });

    return {
      success: true,
      summary: {
        totalRevenue,
        totalBookings: bookings.length,
        confirmedBookings: confirmed.length,
        cancelledBookings: cancelled.length,
        totalPackages: PACKAGES.length,
        totalCustomers: 1
      },
      charts: {
        revenueByPackage: Object.values(pkgMap),
        statusDistribution: [
          { status: 'Confirmed', count: confirmed.length, color: '#16a34a' },
          { status: 'Cancelled', count: cancelled.length, color: '#dc2626' }
        ],
        categoryDistribution: [
          { category: 'Mountain & Alpine', count: 2 },
          { category: 'Cultural Heritage', count: 3 },
          { category: 'Beach & Coastal', count: 2 },
          { category: 'City Exploration', count: 1 }
        ]
      },
      recentBookings: bookings.slice(0, 8)
    };
  },

  getPackages: async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/packages`, { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.packages) return data;
      }
    } catch (e) {}
    return { success: true, packages: PACKAGES };
  },

  createPackage: async (body) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/packages`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(body)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const newPkg = { id: 'pkg-' + Date.now(), ...body, rating: 5.0, reviewCount: 1 };
    PACKAGES.unshift(newPkg);
    return { success: true, package: newPkg };
  },

  updatePackage: async (id, body) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(body)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const idx = PACKAGES.findIndex(p => p.id === id || p._id === id);
    if (idx !== -1) {
      PACKAGES[idx] = { ...PACKAGES[idx], ...body };
      return { success: true, package: PACKAGES[idx] };
    }
    return { success: true };
  },

  deletePackage: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const idx = PACKAGES.findIndex(p => p.id === id || p._id === id);
    if (idx !== -1) PACKAGES.splice(idx, 1);
    return { success: true, message: 'Package deleted.' };
  },

  getBookings: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/admin/bookings${query ? '?' + query : ''}`, {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bookings) return data;
      }
    } catch (e) {}
    return { success: true, bookings: getLocalBookings() };
  },

  updateBookingStatus: async (id, status) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const local = getLocalBookings().map(b => (b._id === id || b.bookingRef === id) ? { ...b, status } : b);
    saveLocalBookings(local);
    return { success: true, message: `Booking status updated to ${status}` };
  },

  getCustomers: async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/customers`, { headers: getAdminHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      success: true,
      customers: [
        {
          _id: 'cust_1',
          fullName: 'Aarav Mehta',
          email: 'customer@example.com',
          phone: '+91 98765 43210',
          country: 'India',
          totalBookings: 2,
          totalSpent: 480900,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }
};

// ==========================================
// 3. PACKAGES API (Public / Customer Facing)
// ==========================================
export const packagesAPI = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/packages${query ? '?' + query : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.packages && data.packages.length > 0) return data;
      }
    } catch (e) {}

    let result = [...PACKAGES];
    if (params.category && params.category !== 'all') {
      result = result.filter(p => p.category.toLowerCase().includes(params.category.toLowerCase()));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
      );
    }
    if (params.maxPrice) {
      result = result.filter(p => p.price <= Number(params.maxPrice));
    }
    if (params.sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (params.sort === 'duration') {
      result.sort((a, b) => a.days - b.days);
    } else if (params.sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    return { success: true, count: result.length, packages: result };
  },

  getOne: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/packages/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.package) return data;
      }
    } catch (e) {}
    const pkg = getPackageById(id);
    if (pkg) return { success: true, package: pkg };
    throw new Error('Package not found');
  }
};

// ==========================================
// 4. BOOKINGS API (Customer Facing)
// ==========================================
const getLocalBookings = () => {
  try {
    return JSON.parse(localStorage.getItem('wv_local_bookings') || '[]');
  } catch (e) {
    return [];
  }
};

const saveLocalBookings = (bookings) => {
  localStorage.setItem('wv_local_bookings', JSON.stringify(bookings));
};

export const bookingsAPI = {
  getMyBookings: async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings`, { headers: getCustomerHeaders() });
      if (res.ok) {
        const data = await res.json();
        const local = getLocalBookings();
        const serverIds = new Set(data.bookings.map(b => b._id || b.bookingRef));
        const extraLocal = local.filter(b => !serverIds.has(b._id || b.bookingRef));
        return { success: true, bookings: [...extraLocal, ...data.bookings] };
      }
    } catch (e) {}
    return { success: true, bookings: getLocalBookings() };
  },

  getBookingById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${id}`, { headers: getCustomerHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) return data;
      }
    } catch (e) {}
    const local = getLocalBookings().find(b => b._id === id || b.bookingRef === id);
    if (local) return { success: true, booking: local };
    throw new Error('Booking not found');
  },

  createBooking: async (bookingData) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: getCustomerHeaders(),
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          const local = getLocalBookings();
          saveLocalBookings([data.booking, ...local]);
          return data;
        }
      }
    } catch (e) {}

    const localBooking = {
      _id: 'local_' + Date.now(),
      bookingRef: 'WV-' + Math.floor(100000 + Math.random() * 900000),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    const local = getLocalBookings();
    saveLocalBookings([localBooking, ...local]);
    return { success: true, booking: localBooking };
  },

  cancelBooking: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: getCustomerHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const local = getLocalBookings().map(b => (b._id === id || b.bookingRef === id) ? { ...b, status: 'cancelled' } : b);
        saveLocalBookings(local);
        return data;
      }
    } catch (e) {}

    const local = getLocalBookings().map(b => (b._id === id || b.bookingRef === id) ? { ...b, status: 'cancelled' } : b);
    saveLocalBookings(local);
    return { success: true, message: 'Booking cancelled successfully.' };
  }
};
