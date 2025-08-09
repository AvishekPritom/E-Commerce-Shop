import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminOrderManagement from './AdminOrderManagement';
import AdminProductManagement from './AdminProductManagement';
import api from '../../api';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get active tab from URL hash or default to overview
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'orders', 'products', 'customers'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [orderStats, productStats] = await Promise.all([
        api.get('/orders/admin/statistics/'),
        api.get('/products/')
      ]);
      
      setStats({
        orders: orderStats.data,
        products: {
          total: productStats.data.length,
          in_stock: productStats.data.filter(p => p.in_stock !== false).length,
          out_of_stock: productStats.data.filter(p => p.in_stock === false).length
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.history.pushState(null, null, `#${tab}`);
  };

  const formatCurrency = (amount) => `৳${parseFloat(amount || 0).toFixed(2)}`;

  const OverviewTab = () => (
    <div className="row">
      {/* Quick Stats */}
      <div className="col-12 mb-4">
        <h4 className="mb-3">Dashboard Overview</h4>
        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h3 className="mb-0">{stats.orders?.total_orders || 0}</h3>
                    <p className="mb-0">Total Orders</p>
                  </div>
                  <i className="fas fa-shopping-cart fa-2x opacity-75"></i>
                </div>
                <div className="mt-2">
                  <small>
                    <i className="fas fa-clock me-1"></i>
                    {stats.orders?.pending_orders || 0} pending
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h3 className="mb-0">{formatCurrency(stats.orders?.total_revenue)}</h3>
                    <p className="mb-0">Total Revenue</p>
                  </div>
                  <i className="fas fa-dollar-sign fa-2x opacity-75"></i>
                </div>
                <div className="mt-2">
                  <small>
                    <i className="fas fa-check-circle me-1"></i>
                    {stats.orders?.delivered_orders || 0} delivered
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h3 className="mb-0">{stats.products?.total || 0}</h3>
                    <p className="mb-0">Total Products</p>
                  </div>
                  <i className="fas fa-boxes fa-2x opacity-75"></i>
                </div>
                <div className="mt-2">
                  <small>
                    <i className="fas fa-check me-1"></i>
                    {stats.products?.in_stock || 0} in stock
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h3 className="mb-0">{stats.products?.out_of_stock || 0}</h3>
                    <p className="mb-0">Out of Stock</p>
                  </div>
                  <i className="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                </div>
                <div className="mt-2">
                  <small>
                    <i className="fas fa-sync me-1"></i>
                    Needs attention
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-tasks me-2"></i>
              Quick Actions
            </h5>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <button 
                className="btn btn-outline-primary"
                onClick={() => handleTabChange('products')}
              >
                <i className="fas fa-plus me-2"></i>
                Add New Product
              </button>
              <button 
                className="btn btn-outline-info"
                onClick={() => handleTabChange('orders')}
              >
                <i className="fas fa-list me-2"></i>
                View Pending Orders
              </button>
              <button 
                className="btn btn-outline-warning"
                onClick={fetchDashboardStats}
              >
                <i className="fas fa-sync me-2"></i>
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="col-md-6 mb-4">
        <div className="card h-100">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-clock me-2"></i>
              Recent Activity
            </h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Activity tracking will be implemented in future updates.
            </div>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-shopping-cart text-primary me-2"></i>
                <span className="text-muted">Order management system activated</span>
              </li>
              <li className="mb-2">
                <i className="fas fa-boxes text-info me-2"></i>
                <span className="text-muted">Product management system ready</span>
              </li>
              <li className="mb-2">
                <i className="fas fa-chart-line text-success me-2"></i>
                <span className="text-muted">Dashboard analytics enabled</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const CustomersTab = () => (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Customer Management
              </h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Customer management features will be implemented in future updates.
                Currently, customer information is managed through the order system.
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <i className="fas fa-user-plus fa-3x text-primary mb-3"></i>
                      <h6>User Registration</h6>
                      <p className="text-muted small">Allow customers to create accounts</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <i className="fas fa-envelope fa-3x text-info mb-3"></i>
                      <h6>Email Marketing</h6>
                      <p className="text-muted small">Send newsletters and promotions</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <i className="fas fa-chart-pie fa-3x text-warning mb-3"></i>
                      <h6>Customer Analytics</h6>
                      <p className="text-muted small">Track customer behavior and preferences</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      {/* Admin Header */}
      <div className="bg-white shadow-sm">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center py-3">
                <div>
                  <h2 className="mb-0">
                    <i className="fas fa-tachometer-alt me-2 text-primary"></i>
                    Admin Dashboard
                  </h2>
                  <p className="text-muted mb-0">Manage your e-commerce store</p>
                </div>
                <div>
                  <Link to="/" className="btn btn-outline-primary">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar Navigation */}
          <div className="col-md-3 col-lg-2 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Navigation</h6>
              </div>
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => handleTabChange('overview')}
                >
                  <i className="fas fa-chart-pie me-2"></i>
                  Overview
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => handleTabChange('orders')}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Orders
                  {stats.orders?.pending_orders > 0 && (
                    <span className="badge bg-warning text-dark ms-2">
                      {stats.orders.pending_orders}
                    </span>
                  )}
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => handleTabChange('products')}
                >
                  <i className="fas fa-boxes me-2"></i>
                  Products
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'customers' ? 'active' : ''}`}
                  onClick={() => handleTabChange('customers')}
                >
                  <i className="fas fa-users me-2"></i>
                  Customers
                  <span className="badge bg-secondary ms-2">Soon</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading dashboard...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'orders' && <AdminOrderManagement />}
                {activeTab === 'products' && <AdminProductManagement />}
                {activeTab === 'customers' && <CustomersTab />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
