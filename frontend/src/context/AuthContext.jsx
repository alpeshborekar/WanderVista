import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wv_customer_token') || localStorage.getItem('wv_token');
    if (token) {
      authAPI.getMe()
        .then(data => {
          if (data.user && data.user.role === 'customer') {
            setUser(data.user);
          } else if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('wv_customer_token');
          localStorage.removeItem('wv_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Customer Login
  const login = useCallback(async (email, password) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem('wv_customer_token', data.token);
    setUser(data.user);
    return data;
  }, []);

  // Customer Register
  const register = useCallback(async (formData) => {
    const data = await authAPI.register(formData);
    localStorage.setItem('wv_customer_token', data.token);
    setUser(data.user);
    return data;
  }, []);

  // Customer Forgot Password
  const forgotPassword = useCallback(async (email) => {
    return await authAPI.forgotPassword({ email });
  }, []);

  // Customer Reset Password
  const resetPassword = useCallback(async (email, resetCode, newPassword) => {
    return await authAPI.resetPassword({ email, resetCode, newPassword });
  }, []);

  // Customer Logout
  const logout = useCallback(() => {
    localStorage.removeItem('wv_customer_token');
    localStorage.removeItem('wv_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        updateUser,
        isAuthenticated: !!user && user.role !== 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
