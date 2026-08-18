const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('wv_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.errors?.[0]?.msg || 'Something went wrong');
  }
  return data;
};

export const authAPI = {
  register: (body) => fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  login: (body) => fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe: () => fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  updateProfile: (body) => fetch(`${BASE_URL}/auth/profile`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  changePassword: (body) => fetch(`${BASE_URL}/auth/change-password`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
};

export const destinationsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/destinations${query ? '?' + query : ''}`, { headers: getHeaders() }).then(handleResponse);
  },
  getOne: (id) => fetch(`${BASE_URL}/destinations/${id}`, { headers: getHeaders() }).then(handleResponse),
};

export const bookingsAPI = {
  getMyBookings: () => fetch(`${BASE_URL}/bookings`, { headers: getHeaders() }).then(handleResponse),
  createBooking: (body) => fetch(`${BASE_URL}/bookings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  cancelBooking: (id) => fetch(`${BASE_URL}/bookings/${id}/cancel`, { method: 'PUT', headers: getHeaders() }).then(handleResponse),
};
