import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('wv_admin_token');
    if (adminToken) {
      adminAPI.getAdminMe()
        .then(data => {
          if (data.admin && data.admin.role === 'admin') {
            setAdminUser(data.admin);
          } else {
            localStorage.removeItem('wv_admin_token');
            setAdminUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('wv_admin_token');
          setAdminUser(null);
        })
        .finally(() => setAdminLoading(false));
    } else {
      setAdminLoading(false);
    }
  }, []);

  // Admin Login
  const adminLogin = useCallback(async (email, password) => {
    const data = await adminAPI.login({ email, password });
    if (data.token && data.admin?.role === 'admin') {
      localStorage.setItem('wv_admin_token', data.token);
      setAdminUser(data.admin);
      return data;
    }
    throw new Error('Access denied: Unauthorized administrative login.');
  }, []);

  // Admin Logout
  const adminLogout = useCallback(() => {
    localStorage.removeItem('wv_admin_token');
    setAdminUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminLoading,
        adminLogin,
        adminLogout,
        isAdminAuthenticated: !!adminUser && adminUser.role === 'admin'
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
