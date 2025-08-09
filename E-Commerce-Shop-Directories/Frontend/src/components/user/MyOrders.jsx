import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { BASE_URL } from '../../api';
import Toast from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';

const MyOrders = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, token, navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-orders/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Transform API data to match component expectations
        const transformedOrders = response.data.orders.map(order => ({
          id: order.order_id,
          date: order.created_at,
          status: order.order_status,
          total: order.total_amount,
          items: order.items,
          shipping_address: `${order.customer_info.address}, ${order.customer_info.city}`,
          payment_method: order.payment_method,
          tracking_number: order.tracking_number
        }));
        setOrders(transformedOrders);
      } else {
        setToast({
          show: true,
          message: 'Failed to load orders',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setToast({
          show: true,
          message: 'Failed to load orders. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning', icon: 'clock', text: 'Pending' },
      'processing': { class: 'bg-info', icon: 'cog', text: 'Processing' },
      'shipped': { class: 'bg-primary', icon: 'truck', text: 'Shipped' },
      'delivered': { class: 'bg-success', icon: 'check-circle', text: 'Delivered' },
      'cancelled': { class: 'bg-danger', icon: 'times-circle', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`badge ${config.class} p-2`}>
        <i className={`fas fa-${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      processing: orders.filter(o => o.status === 'processing').length,
      pending: orders.filter(o => o.status === 'pending').length
    };
    return stats;
  };

  const handleViewOrder = (orderId) => {
    // Navigate to order details page (you can create this later)
    setToast({
      show: true,
      message: `Viewing order ${orderId}`,
      type: 'info'
    });
  };

  const handleTrackOrder = (trackingNumber) => {
    if (trackingNumber) {
      setToast({
        show: true,
        message: `Tracking: ${trackingNumber}`,
        type: 'info'
      });
    } else {
      setToast({
        show: true,
        message: 'Tracking not available yet',
        type: 'warning'
      });
    }
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  if (loading) {
    return (
      <div className="container my-5">
        <LoadingSpinner size="large" text="Loading your orders..." fullPage />
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <i className="fas fa-shopping-bag me-2"></i>
              My Orders
            </h2>
            <div>
              <button 
                className="btn btn-outline-primary me-2"
                onClick={() => navigate('/profile')}
              >
                <i className="fas fa-user me-1"></i>
                Profile
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-shopping-cart me-1"></i>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title mb-3">Order Statistics</h6>
              <div className="row text-center">
                <div className="col-md-2 col-sm-4 col-6 mb-3">
                  <div className="stat-item">
                    <h4 className="text-primary mb-1">{stats.total}</h4>
                    <small className="text-muted">Total Orders</small>
                  </div>
                </div>
                <div className="col-md-2 col-sm-4 col-6 mb-3">
                  <div className="stat-item">
                    <h4 className="text-success mb-1">{stats.delivered}</h4>
                    <small className="text-muted">Delivered</small>
                  </div>
                </div>
                <div className="col-md-2 col-sm-4 col-6 mb-3">
                  <div className="stat-item">
                    <h4 className="text-primary mb-1">{stats.shipped}</h4>
                    <small className="text-muted">Shipped</small>
                  </div>
                </div>
                <div className="col-md-2 col-sm-4 col-6 mb-3">
                  <div className="stat-item">
                    <h4 className="text-info mb-1">{stats.processing}</h4>
                    <small className="text-muted">Processing</small>
                  </div>
                </div>
                <div className="col-md-2 col-sm-4 col-6 mb-3">
                  <div className="stat-item">
                    <h4 className="text-warning mb-1">{stats.pending}</h4>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
                <div className="col-md-2 col-sm-4 col-6 mb-3">
                  <div className="stat-item">
                    <h4 className="text-success mb-1">৳{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</h4>
                    <small className="text-muted">Total Spent</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label">Filter by Status:</label>
                  <select 
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label">Search Orders:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by order ID or item name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label d-block">&nbsp;</label>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchTerm('');
                    }}
                  >
                    <i className="fas fa-redo me-1"></i>
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="row">
        <div className="col-12">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="card shadow-sm mb-4">
                <div className="card-header">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="d-flex align-items-center">
                        <h6 className="mb-0 me-3">
                          <i className="fas fa-hashtag me-1"></i>
                          {order.id}
                        </h6>
                        {getStatusBadge(order.status)}
                      </div>
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        Ordered on {new Date(order.date).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="col-md-4 text-md-end">
                      <h5 className="text-success mb-0">৳{order.total.toFixed(2)}</h5>
                      <small className="text-muted">{order.items.length} item(s)</small>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {/* Order Items */}
                  <div className="order-items mb-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                        <img
                          src={item.image ? `${BASE_URL}${item.image}` : 'https://placehold.co/60x60'}
                          alt={item.name}
                          className="img-fluid me-3"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{item.name}</h6>
                          <small className="text-muted">
                            Qty: {item.quantity} × ৳{item.price.toFixed(2)}
                          </small>
                        </div>
                        <div className="text-end">
                          <span className="fw-bold">৳{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted d-block">Shipping Address:</small>
                      <span>{order.shipping_address}</span>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted d-block">Payment Method:</small>
                      <span>
                        <i className="fas fa-mobile-alt me-1"></i>
                        {order.payment_method}
                      </span>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted d-block">Tracking:</small>
                      <span>
                        {order.tracking_number ? (
                          <button 
                            className="btn btn-link p-0"
                            onClick={() => handleTrackOrder(order.tracking_number)}
                          >
                            {order.tracking_number}
                          </button>
                        ) : (
                          <span className="text-muted">Not available</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {order.tracking_number && (
                        <button 
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => handleTrackOrder(order.tracking_number)}
                        >
                          <i className="fas fa-truck me-1"></i>
                          Track Order
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        View Details
                      </button>
                    </div>
                    <div>
                      {order.status === 'delivered' && (
                        <button className="btn btn-outline-success btn-sm me-2">
                          <i className="fas fa-star me-1"></i>
                          Rate & Review
                        </button>
                      )}
                      <button className="btn btn-primary btn-sm">
                        <i className="fas fa-redo me-1"></i>
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="fas fa-shopping-bag mb-3" style={{ fontSize: '64px', color: '#6c757d' }}></i>
                <h4 className="text-muted mb-3">No Orders Found</h4>
                <p className="text-muted mb-4">
                  {orders.length === 0 
                    ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                    : "No orders match your current filters. Try adjusting your search criteria."
                  }
                </p>
                <div>
                  {orders.length === 0 ? (
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate('/')}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>
                      Start Shopping
                    </button>
                  ) : (
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setStatusFilter('all');
                        setSearchTerm('');
                      }}
                    >
                      <i className="fas fa-redo me-1"></i>
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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

export default MyOrders;
