import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { BASE_URL } from '../../api';
import Toast from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Add authentication context
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const cart_code = localStorage.getItem('cart_code');

  useEffect(() => {
    if (!cart_code) {
      navigate('/cart');
      return;
    }
    fetchCartData();
  }, [cart_code, navigate]);

  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        fullName: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postal_code || ''
      }));
    }
  }, [user]);

  const fetchCartData = async () => {
    setLoading(true);
    try {
      // Fetch cart items
      const cartResponse = await api.get(`get_cart/?cart_code=${cart_code}`);
      setCartItems(cartResponse.data.items || []);

      // Fetch cart summary
      const summaryResponse = await api.get(`get_cart_stat/?cart_code=${cart_code}`);
      setCartSummary(summaryResponse.data);

      // If cart is empty, redirect to cart page
      if (!cartResponse.data.items || cartResponse.data.items.length === 0) {
        setToast({
          show: true,
          message: 'Your cart is empty. Please add items before checkout.',
          type: 'warning'
        });
        setTimeout(() => navigate('/cart'), 2000);
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
      setToast({
        show: true,
        message: 'Failed to load cart data. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city'];
    for (let field of required) {
      if (!customerInfo[field].trim()) {
        setToast({
          show: true,
          message: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          type: 'error'
        });
        return false;
      }
    }

    if (!selectedPayment) {
      setToast({
        show: true,
        message: 'Please select a payment method',
        type: 'error'
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      setToast({
        show: true,
        message: 'Please enter a valid email address',
        type: 'error'
      });
      return false;
    }

    // Phone validation (basic)
    if (customerInfo.phone.length < 10) {
      setToast({
        show: true,
        message: 'Please enter a valid phone number',
        type: 'error'
      });
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setProcessingPayment(true);
    
    const orderData = {
      cart_code,
      customer_info: customerInfo,
      payment_method: selectedPayment,
      total_amount: cartSummary.total_price,
      items: cartItems.map(item => ({
        product_id: item.product._id || item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      notes: customerInfo.notes
    };

    try {
      // Create the order
      const response = await api.post('/orders/create/', orderData, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Clear cart after successful order
        localStorage.removeItem('cart_code');
        
        // Show success message
        setToast({
          show: true,
          message: `Order ${response.data.order_id} created successfully! Redirecting...`,
          type: 'success'
        });

        // Redirect to order confirmation page
        setTimeout(() => {
          navigate(`/order-confirmation/${response.data.order_id}`, {
            state: { 
              orderDetails: response.data.order,
              trackingNumber: response.data.tracking_number 
            }
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Order creation error:', error);
      setToast({
        show: true,
        message: error.response?.data?.error || 'Failed to create order. Please try again.',
        type: 'error'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const renderUserInfo = () => {
    if (!user) return null;

    return (
      <div className="col-12 mb-4">
        <div className="card shadow-sm">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="fas fa-user-check me-2"></i>
              Logged in as: {user.name || user.email}
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-2">
                  <i className="fas fa-envelope me-2 text-primary"></i>
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="mb-2">
                  <i className="fas fa-user me-2 text-primary"></i>
                  <strong>Name:</strong> {user.name || 'Not provided'}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <i className="fas fa-clock me-2 text-primary"></i>
                  <strong>Member since:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
                <div className="text-end">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate('/profile')}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="alert alert-info mt-3 mb-0">
              <i className="fas fa-info-circle me-2"></i>
              Your profile information has been automatically filled in the form below. You can modify it if needed.
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container my-5">
        <LoadingSpinner 
          fullPage={false}
          text="Loading checkout..." 
          color="primary" 
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="fas fa-credit-card me-2"></i>
            Checkout
          </h2>
        </div>
      </div>

      <div className="row">
        {/* Add logged-in user info section */}
        {renderUserInfo()}
        
        {/* Cart Items Review Section */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Items to Purchase ({cartSummary?.total_items || 0} items)
              </h5>
            </div>
            <div className="card-body">
              {cartItems.length > 0 ? (
                <div className="row">
                  {cartItems.map((item, index) => (
                    <div key={index} className="col-12 mb-3">
                      <div className="card border">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-md-2 col-sm-3 text-center">
                              <img
                                src={item.product?.image ? `${BASE_URL}${item.product.image}` : 'https://placehold.co/100x100'}
                                alt={item.product?.name || 'Product'}
                                className="img-fluid rounded"
                                style={{ maxHeight: '100px', objectFit: 'cover' }}
                              />
                            </div>
                            <div className="col-md-4 col-sm-5">
                              <h6 className="mb-2 fw-bold">{item.product?.name || 'Unknown Product'}</h6>
                              <p className="text-muted mb-2 small">
                                {item.product?.description || 'No description available'}
                              </p>
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  <i className="fas fa-hashtag me-1"></i>
                                  {item.product?.sku || 'N/A'}
                                </span>
                                <span className="badge bg-info">
                                  <i className="fas fa-tag me-1"></i>
                                  {item.product?.category || 'General'}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-2 col-sm-2 text-center">
                              <div className="quantity-display">
                                <span className="badge bg-primary p-2">
                                  <i className="fas fa-cube me-1"></i>
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-2 col-sm-1 text-center">
                              <div className="price-per-item">
                                <span className="text-muted small">Unit Price</span>
                                <div className="fw-bold">৳{item.product?.price || 0}</div>
                              </div>
                            </div>
                            <div className="col-md-2 col-sm-1 text-end">
                              <div className="total-price">
                                <span className="text-muted small">Total</span>
                                <div className="fw-bold text-success fs-5">
                                  ৳{((item.product?.price || 0) * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-shopping-cart mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                  <h5 className="text-muted">No items in cart</h5>
                  <p className="text-muted">Add some items to your cart before proceeding to checkout.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Information - now pre-filled if user is logged in */}
        <div className="col-lg-8 col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Customer Information {user && <span className="badge bg-light text-dark ms-2">Auto-filled</span>}
              </h5>
            </div>
            <div className="card-body">
              {!user && (
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  You are not logged in. Please fill in your information manually, or 
                  <button 
                    className="btn btn-link p-0 ms-1"
                    onClick={() => navigate('/login')}
                  >
                    login here
                  </button> 
                  to auto-fill your details.
                </div>
              )}
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="fullName" className="form-label">
                    Full Name * 
                    {user && <i className="fas fa-check-circle text-success ms-1" title="Auto-filled from profile"></i>}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={customerInfo.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address * 
                    {user && <i className="fas fa-check-circle text-success ms-1" title="Auto-filled from profile"></i>}
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone Number * 
                    {user && <i className="fas fa-check-circle text-success ms-1" title="Auto-filled from profile"></i>}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="city" className="form-label">
                    City * 
                    {user && <i className="fas fa-check-circle text-success ms-1" title="Auto-filled from profile"></i>}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-8 mb-3">
                  <label htmlFor="address" className="form-label">
                    Address * 
                    {user && <i className="fas fa-check-circle text-success ms-1" title="Auto-filled from profile"></i>}
                  </label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    rows="3"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    required
                  ></textarea>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="postalCode" className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    id="postalCode"
                    name="postalCode"
                    value={customerInfo.postalCode}
                    onChange={handleInputChange}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Order Notes (Optional)</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows="2"
                  value={customerInfo.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for your order"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-credit-card me-2"></i>
                Payment Methods
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className={`payment-option-card p-3 border rounded ${selectedPayment === 'nagad' ? 'border-danger bg-light' : 'border-secondary'}`} style={{ cursor: 'pointer' }}>
                    <input
                      type="radio"
                      id="nagad"
                      name="payment"
                      value="nagad"
                      checked={selectedPayment === 'nagad'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="form-check-input me-3"
                    />
                    <label htmlFor="nagad" className="form-check-label d-flex align-items-center" style={{ cursor: 'pointer' }}>
                      <div className="payment-method-details">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-mobile-alt me-2" style={{ color: '#EC8A2E', fontSize: '24px' }}></i>
                          <span className="fw-bold fs-5" style={{ color: '#EC8A2E' }}>Nagad</span>
                        </div>
                        <small className="text-muted">
                          <i className="fas fa-shield-alt me-1"></i>
                          Secure mobile financial service
                        </small>
                        <br />
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          Instant payment processing
                        </small>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className={`payment-option-card p-3 border rounded ${selectedPayment === 'bkash' ? 'border-danger bg-light' : 'border-secondary'}`} style={{ cursor: 'pointer' }}>
                    <input
                      type="radio"
                      id="bkash"
                      name="payment"
                      value="bkash"
                      checked={selectedPayment === 'bkash'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="form-check-input me-3"
                    />
                    <label htmlFor="bkash" className="form-check-label d-flex align-items-center" style={{ cursor: 'pointer' }}>
                      <div className="payment-method-details">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-mobile-alt me-2" style={{ color: '#e2136e', fontSize: '24px' }}></i>
                          <span className="fw-bold fs-5" style={{ color: '#e2136e' }}>bKash</span>
                        </div>
                        <small className="text-muted">
                          <i className="fas fa-shield-alt me-1"></i>
                          Secure mobile financial service
                        </small>
                        <br />
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          Instant payment processing
                        </small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <i className="fas fa-info-circle me-2 text-primary"></i>
                  <div>
                    <strong>Payment Instructions:</strong>
                    <br />
                    <small className="text-muted">
                      You will be redirected to the selected payment gateway to complete your transaction securely.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4 col-md-12">
          <div className="card shadow-sm cart-summary-card sticky-top" style={{ top: '20px', zIndex: '1' }}>
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-receipt me-2"></i>
                Order Summary
              </h5>
            </div>
            <div className="card-body">
              {/* Quick Items Preview */}
              <div className="order-items-preview mb-3">
                <h6 className="text-muted mb-3">Items ({cartSummary?.total_items || 0}):</h6>
                {cartItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                    <img
                      src={item.product?.image ? `${BASE_URL}${item.product.image}` : 'https://placehold.co/40x40'}
                      alt={item.product?.name || 'Product'}
                      className="img-fluid me-2"
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px' }}
                    />
                    <div className="flex-grow-1">
                      <small className="fw-bold d-block">{item.product?.name || 'Unknown Product'}</small>
                      <small className="text-muted">Qty: {item.quantity} × ৳{item.product?.price || 0}</small>
                    </div>
                    <div className="text-end">
                      <small className="fw-bold">৳{((item.product?.price || 0) * item.quantity).toFixed(2)}</small>
                    </div>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <div className="text-center">
                    <small className="text-muted">... and {cartItems.length - 3} more items</small>
                  </div>
                )}
              </div>

              {/* Order Calculation */}
              {cartSummary && (
                <>
                  <div className="order-calculation">
                    <div className="d-flex justify-content-between py-2">
                      <span>Subtotal ({cartSummary.total_items} items):</span>
                      <span>৳{cartSummary.total_price}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span>Shipping:</span>
                      <span className="text-success">
                        <i className="fas fa-gift me-1"></i>
                        Free
                      </span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span>Tax & Fees:</span>
                      <span>৳0.00</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span>Discount:</span>
                      <span className="text-success">-৳0.00</span>
                    </div>
                  </div>
                  
                  <hr className="my-3" />
                  
                  <div className="d-flex justify-content-between py-3 bg-light rounded px-3">
                    <span className="fw-bold fs-5">Total Amount:</span>
                    <strong className="text-success fs-4">৳{cartSummary.total_price}</strong>
                  </div>
                </>
              )}

              {/* Selected Payment Method Display */}
              {selectedPayment && (
                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted d-block">Payment Method:</small>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-mobile-alt me-2" style={{ 
                      color: selectedPayment === 'nagad' ? '#EC8A2E' : '#e2136e' 
                    }}></i>
                    <span className="fw-bold" style={{ 
                      color: selectedPayment === 'nagad' ? '#EC8A2E' : '#e2136e' 
                    }}>
                      {selectedPayment === 'nagad' ? 'Nagad' : 'bKash'}
                    </span>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <button
                className="btn btn-success w-100 py-3 mt-3"
                onClick={handlePlaceOrder}
                disabled={processingPayment || cartItems.length === 0}
                style={{
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {processingPayment ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <i className="fas fa-lock me-2"></i>
                    Secure Checkout - ৳{cartSummary?.total_price || '0.00'}
                  </>
                )}
              </button>

              {/* Security & Return Policy */}
              <div className="text-center mt-3">
                <div className="row">
                  <div className="col-12 mb-2">
                    <small className="text-muted">
                      <i className="fas fa-shield-alt me-1 text-success"></i>
                      SSL Secured & Encrypted
                    </small>
                  </div>
                  <div className="col-6">
                    <button 
                      className="btn btn-outline-secondary btn-sm w-100"
                      onClick={() => navigate('/cart')}
                      disabled={processingPayment}
                    >
                      <i className="fas fa-arrow-left me-1"></i>
                      Back to Cart
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className="btn btn-outline-info btn-sm w-100"
                      onClick={() => navigate('/')}
                      disabled={processingPayment}
                    >
                      <i className="fas fa-shopping-bag me-1"></i>
                      Continue Shopping
                    </button>
                  </div>
                </div>
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

export default CheckoutPage;
