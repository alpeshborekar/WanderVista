import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import PackageDetails from './pages/PackageDetails';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Listings */}
            <Route path="/" element={<Home />} />
            <Route path="/packages/:id" element={<PackageDetails />} />

            {/* Booking Flow */}
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/confirmation/:id" element={<BookingConfirmation />} />

            {/* User Management & Bookings */}
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/dashboard" element={<Navigate to="/my-bookings" replace />} />
            <Route path="/destinations" element={<Navigate to="/" replace />} />
            <Route path="/profile" element={<Profile />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
