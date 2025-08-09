import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';
import Toast from '../ui/Toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    cartItems: 0,
    wishlistItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    // Simulate loading user stats
    const loadUserStats = async () => {
      try {
        // In a real app, you'd fetch this from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalOrders: 12,
          totalSpent: 4500.50,
          cartItems: 3,
          wishlistItems: 8
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, []);

  const handleLogout = () => {
    logout();
    setToast({
      show: true,
      message: 'Logged out successfully!',
      type: 'success'
    });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  if (loading) {
    return (
      <div className="container my-5">
        <LoadingSpinner 
          fullPage={false}
          text="Loading dashboard..." 
          color="primary" 
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="mb-1">
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Welcome back, {user?.first_name || user?.name}!
                  </h2>
                  <p className="mb-0">
                    <i className="fas fa-envelope me-2"></i>
                    {user?.email}
                  </p>
                  <small className="text-light">
                    <i className="fas fa-clock me-1"></i>
                    Last login: {new Date().toLocaleDateString()}
                  </small>
                </div>
                <div className="col-md-4 text-end">
                  <button 
                    className="btn btn-light"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <i className="fas fa-shopping-bag fa-3x mb-3"></i>
              <h4>{stats.totalOrders}</h4>
              <p className="mb-0">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card text-center bg-info text-white">
            <div className="card-body">
              <i className="fas fa-dollar-sign fa-3x mb-3"></i>
              <h4>৳{stats.totalSpent.toFixed(2)}</h4>
              <p className="mb-0">Total Spent</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card text-center bg-warning text-white">
            <div className="card-body">
              <i className="fas fa-shopping-cart fa-3x mb-3"></i>
              <h4>{stats.cartItems}</h4>
              <p className="mb-0">Cart Items</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card text-center bg-danger text-white">
            <div className="card-body">
              <i className="fas fa-heart fa-3x mb-3"></i>
              <h4>{stats.wishlistItems}</h4>
              <p className="mb-0">Wishlist Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-3 col-md-6 mb-3">
                  <Link to="/cart" className="btn btn-outline-primary w-100 py-3">
                    <i className="fas fa-shopping-cart fa-2x d-block mb-2"></i>
                    View Cart
                  </Link>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <Link to="/orders" className="btn btn-outline-success w-100 py-3">
                    <i className="fas fa-box fa-2x d-block mb-2"></i>
                    My Orders
                  </Link>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <Link to="/profile" className="btn btn-outline-info w-100 py-3">
                    <i className="fas fa-user-edit fa-2x d-block mb-2"></i>
                    Edit Profile
                  </Link>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <Link to="/" className="btn btn-outline-warning w-100 py-3">
                    <i className="fas fa-shopping-bag fa-2x d-block mb-2"></i>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-lg-8 col-md-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Recent Activity
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="fas fa-shopping-cart text-primary me-2"></i>
                    Added item to cart
                  </div>
                  <small className="text-muted">2 hours ago</small>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="fas fa-box text-success me-2"></i>
                    Order #1234 delivered
                  </div>
                  <small className="text-muted">1 day ago</small>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="fas fa-heart text-danger me-2"></i>
                    Added item to wishlist
                  </div>
                  <small className="text-muted">3 days ago</small>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="fas fa-credit-card text-info me-2"></i>
                    Payment processed for order #1233
                  </div>
                  <small className="text-muted">5 days ago</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Account Info
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Name:</strong><br />
                {user?.first_name} {user?.last_name}
              </div>
              <div className="mb-3">
                <strong>Email:</strong><br />
                {user?.email}
              </div>
              <div className="mb-3">
                <strong>Phone:</strong><br />
                {user?.phone || 'Not provided'}
              </div>
              <div className="mb-3">
                <strong>Member Since:</strong><br />
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </div>
              <div className="d-grid">
                <Link to="/profile" className="btn btn-primary">
                  <i className="fas fa-edit me-2"></i>
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={closeToast}
      />
    </div>
  );
};

export default Dashboard;
