import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { BASE_URL } from '../../api';
import LoadingSpinner from '../ui/LoadingSpinner';
import Toast from '../ui/Toast';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Get order details from navigation state or fetch from API
  const orderFromState = location.state?.orderDetails;
  const trackingNumber = location.state?.trackingNumber;

  useEffect(() => {
    if (orderFromState) {
      setOrder(orderFromState);
      setLoading(false);
    } else if (orderId) {
      fetchOrderDetails();
    } else {
      navigate('/');
    }
  }, [orderId, orderFromState, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/`);
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setToast({
          show: true,
          message: 'Order not found',
          type: 'error'
        });
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setToast({
        show: true,
        message: 'Failed to load order details',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'fa-clock',
      'processing': 'fa-cog fa-spin',
      'shipped': 'fa-shipping-fast',
      'delivered': 'fa-check-circle',
      'cancelled': 'fa-times-circle'
    };
    return icons[status] || 'fa-info-circle';
  };

  if (loading) {
    return (
      <div className="container my-5">
        <LoadingSpinner size="large" text="Loading order details..." fullPage />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
          <h3 className="text-muted">Order Not Found</h3>
          <p className="text-muted">The order you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home me-2"></i>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Success Header */}
      <div className="row">
        <div className="col-12">
          <div className="card border-success mb-4">
            <div className="card-header bg-success text-white text-center">
              <div className="py-3">
                <i className="fas fa-check-circle fa-3x mb-3"></i>
                <h2 className="mb-2">Order Confirmed!</h2>
                <p className="mb-0 lead">Thank you for your purchase. Your order has been successfully placed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Order Summary */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-receipt me-2"></i>
                Order Details
              </h5>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6>Order Information</h6>
                  <p className="mb-1"><strong>Order ID:</strong> {order.order_id}</p>
                  <p className="mb-1"><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                  <p className="mb-1"><strong>Payment Method:</strong> {order.payment_method}</p>
                  <p className="mb-1">
                    <strong>Status:</strong> 
                    <span className={`badge bg-${getStatusColor(order.order_status)} ms-2`}>
                      <i className={`fas ${getStatusIcon(order.order_status)} me-1`}></i>
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <h6>Delivery Information</h6>
                  <p className="mb-1"><strong>Tracking Number:</strong> {order.tracking_number || trackingNumber}</p>
                  <p className="mb-1"><strong>Customer:</strong> {order.customer_info.name}</p>
                  <p className="mb-1"><strong>Email:</strong> {order.customer_info.email}</p>
                  <p className="mb-1"><strong>Phone:</strong> {order.customer_info.phone}</p>
                </div>
              </div>

              <h6>Shipping Address</h6>
              <div className="bg-light p-3 rounded mb-4">
                <p className="mb-1">{order.customer_info.name}</p>
                <p className="mb-1">{order.customer_info.address}</p>
                <p className="mb-1">{order.customer_info.city}, {order.customer_info.postal_code}</p>
                <p className="mb-0">{order.customer_info.phone}</p>
              </div>

              <h6>Order Items</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.image && (
                              <img
                                src={`${BASE_URL}${item.image}`}
                                alt={item.name}
                                className="me-2"
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            )}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>৳{item.price}</td>
                        <td>৳{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colspan="3">Total Amount:</th>
                      <th>৳{order.total_amount}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {order.customer_info.notes && (
                <div>
                  <h6>Order Notes</h6>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0">{order.customer_info.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-tools me-2"></i>
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/my-orders" className="btn btn-primary">
                  <i className="fas fa-list me-2"></i>
                  View All Orders
                </Link>
                
                <Link to="/" className="btn btn-outline-primary">
                  <i className="fas fa-shopping-bag me-2"></i>
                  Continue Shopping
                </Link>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => window.print()}
                >
                  <i className="fas fa-print me-2"></i>
                  Print Order
                </button>
              </div>

              <hr />

              <div className="mt-3">
                <h6>Need Help?</h6>
                <p className="small text-muted mb-2">
                  If you have any questions about your order, please contact our customer support.
                </p>
                <button className="btn btn-outline-info btn-sm">
                  <i className="fas fa-headset me-2"></i>
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Order Tracking */}
          <div className="card shadow-sm mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-truck me-2"></i>
                Order Tracking
              </h6>
            </div>
            <div className="card-body">
              <div className="tracking-info">
                <div className="d-flex align-items-center mb-3">
                  <div className={`badge bg-${getStatusColor(order.order_status)} me-3`}>
                    <i className={`fas ${getStatusIcon(order.order_status)}`}></i>
                  </div>
                  <div>
                    <h6 className="mb-0">{order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}</h6>
                    <small className="text-muted">
                      Updated: {new Date(order.updated_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                
                <p className="small text-muted">
                  Track your order using tracking number: <strong>{order.tracking_number || trackingNumber}</strong>
                </p>
                
                <button className="btn btn-outline-primary btn-sm w-100">
                  <i className="fas fa-search me-2"></i>
                  Track Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default OrderConfirmationPage;
