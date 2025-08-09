import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import Toast from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    dateOfBirth: ''
  });

  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchOrderHistory();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfileData(response.data.user);
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to load profile data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await api.get('/orders/history/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrderHistory(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch order history:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/auth/profile/', profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setToast({
        show: true,
        message: 'Profile updated successfully!',
        type: 'success'
      });
      setEditing(false);
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setToast({
      show: true,
      message: 'Logged out successfully!',
      type: 'success'
    });
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  if (loading && !editing) {
    return (
      <div className="container my-5">
        <LoadingSpinner size="large" text="Loading profile..." fullPage />
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-user-circle me-2"></i>
              My Profile
            </h2>
            <button 
              className="btn btn-danger"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Profile Information */}
        <div className="col-lg-8 col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-id-card me-2"></i>
                Personal Information
              </h5>
              <button 
                className="btn btn-light btn-sm"
                onClick={() => setEditing(!editing)}
              >
                <i className={`fas ${editing ? 'fa-times' : 'fa-edit'} me-1`}></i>
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleUpdateProfile}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    name="address"
                    rows="3"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!editing}
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="postalCode"
                      value={profileData.postalCode}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </div>
                </div>

                {editing && (
                  <div className="text-end">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Account Stats & Quick Actions */}
        <div className="col-lg-4 col-md-12">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Account Stats
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6 mb-3">
                  <div className="border-end">
                    <h4 className="text-primary mb-1">{orderHistory.length}</h4>
                    <small className="text-muted">Total Orders</small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <h4 className="text-success mb-1">৳0.00</h4>
                  <small className="text-muted">Total Spent</small>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/cart')}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  View Cart
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={() => navigate('/')}
                >
                  <i className="fas fa-shopping-bag me-2"></i>
                  Continue Shopping
                </button>
                <button 
                  className="btn btn-outline-info"
                  onClick={() => navigate('/orders')}
                >
                  <i className="fas fa-history me-2"></i>
                  Order History
                </button>
                <hr />
                <button 
                  className="btn btn-outline-danger"
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

      {/* Recent Orders */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>
                Recent Orders
              </h5>
            </div>
            <div className="card-body">
              {orderHistory.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No orders yet</h5>
                  <p className="text-muted">Start shopping to see your orders here!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                  >
                    <i className="fas fa-shopping-bag me-2"></i>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{new Date(order.date).toLocaleDateString()}</td>
                          <td>{order.items}</td>
                          <td>৳{order.total}</td>
                          <td>
                            <span className={`badge ${
                              order.status === 'completed' ? 'bg-success' :
                              order.status === 'pending' ? 'bg-warning' :
                              'bg-danger'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

export default UserProfile;
