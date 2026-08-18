import { PACKAGES, getPackageById } from '../data/packagesData';

const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('wv_token');
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

// Packages API
export const packagesAPI = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/packages${query ? '?' + query : ''}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.packages && data.packages.length > 0) return data;
      }
    } catch (e) {
      // fallback to local data
    }

    // Client-side filtering fallback
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
      const res = await fetch(`${BASE_URL}/packages/${id}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.package) return data;
      }
    } catch (e) {
      // fallback
    }
    const pkg = getPackageById(id);
    if (pkg) return { success: true, package: pkg };
    throw new Error('Package not found');
  }
};

// Bookings API (syncs with backend + localStorage fallback)
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
      const res = await fetch(`${BASE_URL}/bookings`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        // merge with local bookings if any
        const local = getLocalBookings();
        const serverIds = new Set(data.bookings.map(b => b._id || b.bookingRef));
        const extraLocal = local.filter(b => !serverIds.has(b._id || b.bookingRef));
        return { success: true, bookings: [...extraLocal, ...data.bookings] };
      }
    } catch (e) {
      // fallback
    }
    return { success: true, bookings: getLocalBookings() };
  },

  getBookingById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${id}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) return data;
      }
    } catch (e) {
      // fallback
    }
    const local = getLocalBookings().find(b => b._id === id || b.bookingRef === id);
    if (local) return { success: true, booking: local };
    throw new Error('Booking not found');
  },

  createBooking: async (bookingData) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          // also save locally as backup
          const local = getLocalBookings();
          saveLocalBookings([data.booking, ...local]);
          return data;
        }
      }
    } catch (e) {
      // fallback
    }

    // Local fallback creation
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
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        // Update local list too
        const local = getLocalBookings().map(b => (b._id === id || b.bookingRef === id) ? { ...b, status: 'cancelled' } : b);
        saveLocalBookings(local);
        return data;
      }
    } catch (e) {
      // fallback
    }

    const local = getLocalBookings().map(b => (b._id === id || b.bookingRef === id) ? { ...b, status: 'cancelled' } : b);
    saveLocalBookings(local);
    return { success: true, message: 'Booking cancelled successfully' };
  }
};

// Auth API
export const authAPI = {
  register: (body) => fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  login: (body) => fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe: () => fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  updateProfile: (body) => fetch(`${BASE_URL}/auth/profile`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  changePassword: (body) => fetch(`${BASE_URL}/auth/change-password`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse)
};
