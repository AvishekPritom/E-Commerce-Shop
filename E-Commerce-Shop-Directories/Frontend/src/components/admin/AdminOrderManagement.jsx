import React, { useState, useEffect } from 'react';
import api from '../../api';
import Toast from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'info' },
    { value: 'processing', label: 'Processing', color: 'primary' },
    { value: 'shipped', label: 'Shipped', color: 'secondary' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'danger' }
  ];

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/admin/all/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setToast({
        show: true,
        message: 'Failed to load orders',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/admin/statistics/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status/`, {
        status: newStatus
      });
      
      setToast({
        show: true,
        message: `Order status updated to ${newStatus}`,
        type: 'success'
      });
      
      fetchOrders();
      fetchStats();
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setToast({
        show: true,
        message: 'Failed to update order status',
        type: 'error'
      });
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusBadge = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status) || 
                     { color: 'secondary', label: status };
    return (
      <span className={`badge bg-${statusObj.color}`}>
        {statusObj.label}
      </span>
    );
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.order_status === statusFilter);

  const formatCurrency = (amount) => `৳${parseFloat(amount).toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container my-5">
        <LoadingSpinner size="large" text="Loading orders..." fullPage />
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.total_orders || 0}</h4>
                  <p className="mb-0">Total Orders</p>
                </div>
                <i className="fas fa-shopping-cart fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{formatCurrency(stats.total_revenue || 0)}</h4>
                  <p className="mb-0">Total Revenue</p>
                </div>
                <i className="fas fa-dollar-sign fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.pending_orders || 0}</h4>
                  <p className="mb-0">Pending Orders</p>
                </div>
                <i className="fas fa-clock fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.delivered_orders || 0}</h4>
                  <p className="mb-0">Delivered</p>
                </div>
                <i className="fas fa-check-circle fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Management */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-list-alt me-2"></i>
                  Order Management
                </h5>
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="all">All Orders</option>
                    {orderStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => { fetchOrders(); fetchStats(); }}
                  >
                    <i className="fas fa-refresh me-1"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <code>{order.order_id}</code>
                        </td>
                        <td>
                          <div>
                            <strong>{order.customer_info.name}</strong>
                            <br />
                            <small className="text-muted">{order.customer_info.email}</small>
                          </div>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(order.total_amount)}</strong>
                        </td>
                        <td>{getStatusBadge(order.order_status)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => viewOrderDetails(order)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <div className="dropdown">
                              <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                title="Update Status"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <ul className="dropdown-menu">
                                {orderStatuses.map(status => (
                                  <li key={status.value}>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => updateOrderStatus(order._id, status.value)}
                                      disabled={order.order_status === status.value}
                                    >
                                      <span className={`badge bg-${status.color} me-2`}>
                                        {status.label}
                                      </span>
                                      {order.order_status === status.value && '(Current)'}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-5">
                  <i className="fas fa-inbox mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                  <h5 className="text-muted">No orders found</h5>
                  <p className="text-muted">
                    {statusFilter === 'all' 
                      ? 'No orders have been placed yet.' 
                      : `No orders with status "${statusFilter}" found.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Details - {selectedOrder.order_id}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowOrderModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Order Info */}
                  <div className="col-md-6 mb-3">
                    <h6>Order Information</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Order ID:</strong></td>
                          <td><code>{selectedOrder.order_id}</code></td>
                        </tr>
                        <tr>
                          <td><strong>Date:</strong></td>
                          <td>{formatDate(selectedOrder.created_at)}</td>
                        </tr>
                        <tr>
                          <td><strong>Status:</strong></td>
                          <td>{getStatusBadge(selectedOrder.order_status)}</td>
                        </tr>
                        <tr>
                          <td><strong>Payment:</strong></td>
                          <td>
                            <span className="badge bg-secondary">
                              {selectedOrder.payment_method}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Total:</strong></td>
                          <td><strong>{formatCurrency(selectedOrder.total_amount)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Info */}
                  <div className="col-md-6 mb-3">
                    <h6>Customer Information</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Name:</strong></td>
                          <td>{selectedOrder.customer_info.name}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{selectedOrder.customer_info.email}</td>
                        </tr>
                        <tr>
                          <td><strong>Phone:</strong></td>
                          <td>{selectedOrder.customer_info.phone}</td>
                        </tr>
                        <tr>
                          <td><strong>Address:</strong></td>
                          <td>{selectedOrder.customer_info.address}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Items */}
                <div className="row">
                  <div className="col-12">
                    <h6>Order Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead className="table-light">
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>{formatCurrency(item.price)}</td>
                              <td>{item.quantity}</td>
                              <td>{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                          <tr className="table-light">
                            <td colSpan="3"><strong>Total Amount:</strong></td>
                            <td><strong>{formatCurrency(selectedOrder.total_amount)}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowOrderModal(false)}
                >
                  Close
                </button>
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    Update Status
                  </button>
                  <ul className="dropdown-menu">
                    {orderStatuses.map(status => (
                      <li key={status.value}>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, status.value);
                            setShowOrderModal(false);
                          }}
                          disabled={selectedOrder.order_status === status.value}
                        >
                          <span className={`badge bg-${status.color} me-2`}>
                            {status.label}
                          </span>
                          {selectedOrder.order_status === status.value && '(Current)'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default AdminOrderManagement;
