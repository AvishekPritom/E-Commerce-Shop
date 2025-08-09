import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute Debug:', { 
    user: !!user, 
    isAuthenticated, 
    loading, 
    requireAuth, 
    path: location.pathname 
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="container my-5">
        <LoadingSpinner 
          fullPage={false}
          text="Checking authentication..." 
          color="primary" 
          size="lg"
        />
      </div>
    );
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('Redirecting to login - user not authenticated');
    // Save the current location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // If route doesn't require authentication and user is authenticated
  // (e.g., login page when user is already logged in)
  if (!requireAuth && isAuthenticated) {
    console.log('Redirecting to dashboard - user already authenticated');
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
