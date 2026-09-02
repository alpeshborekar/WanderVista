import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Customer Pages
import Home from './pages/Home';
import PackageDetails from './pages/PackageDetails';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Dedicated Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* ========================================= */}
              {/* 1. CUSTOMER-FACING TRAVEL WEBSITE ROUTES  */}
              {/* ========================================= */}
              <Route path="/" element={<Home />} />
              <Route path="/packages/:id" element={<PackageDetails />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/booking/confirmation/:id" element={<BookingConfirmation />} />
              <Route path="/destinations" element={<Navigate to="/" replace />} />

              {/* Customer Account & Bookings */}
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={<Navigate to="/my-bookings" replace />} />

              {/* Customer Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ========================================= */}
              {/* 2. DEDICATED ADMIN PORTAL & MANAGEMENT    */}
              {/* ========================================= */}
              {/* Dedicated Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Strictly Protected Admin Console */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
              <Route path="/analytics" element={<Navigate to="/admin" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
