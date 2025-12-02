import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const userData = localStorage.getItem('userData');
  
  if (!userData) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userData);
    
    // Check if user is guest and trying to access admin routes
    if (requireAdmin && (user.isGuest || user.role !== 'admin')) {
      return <Navigate to="/" replace />;
    }

    // Check if admin is trying to access user-only routes
    if (!requireAdmin && user.role === 'admin' && !user.isGuest) {
      return <Navigate to="/admin" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
