import React, { useEffect, useState } from 'react';
import api from '../../api';
import { BASE_URL } from '../../api';
import Toast from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';

const CartItem = ({ setNumCartItems, onCartChange, cartLoading }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const cart_code = localStorage.getItem('cart_code');

  // Debug: Log toast state changes
  useEffect(() => {
    console.log('Toast state changed:', toast);
  }, [toast]);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [cart_code]);

  const fetchCart = () => {
    setLoading(true);
    api.get(`get_cart/?cart_code=${cart_code}`)
      .then(res => {
        setItems(res.data.items || []);
        // Set initial quantities for each item
        const initialQuantities = {};
        (res.data.items || []).forEach(item => {
          initialQuantities[item._id] = item.quantity;
        });
        setQuantities(initialQuantities);
        setLoading(false);
        // Update cart count in NavBar
        if (setNumCartItems) {
          setNumCartItems((res.data.items || []).reduce((sum, item) => sum + item.quantity, 0));
        }
      })
      .catch(err => {
        setError('Failed to load cart items');
        setLoading(false);
      });
  };

  const handleInputChange = (itemId, value) => {
    if (value < 1) return;
    setQuantities(q => ({ ...q, [itemId]: value }));
  };

  const handleUpdate = (itemId) => {
    setUpdatingId(itemId);
    api.patch('update_quantity/', { item_id: itemId, quantity: quantities[itemId] })
      .then(() => {
        setToast({ 
          show: true, 
          message: 'Cart item updated successfully!', 
          type: 'success' 
        });
        fetchCart();
        setUpdatingId(null);
        // Trigger cart summary refresh
        if (onCartChange) {
          onCartChange();
        }
      })
      .catch(() => {
        setToast({ 
          show: true, 
          message: 'Failed to update quantity', 
          type: 'error' 
        });
        setUpdatingId(null);
      });
  };

  const handleRemove = (itemId) => {
    console.log('handleRemove called with itemId:', itemId);
    setUpdatingId(itemId);
    api.delete(`remove_cart_item/`, { data: { item_id: itemId } })
      .then((response) => {
        console.log('Delete successful:', response.data);
        setToast({ 
          show: true, 
          message: 'Cart item removed successfully!', 
          type: 'success' 
        });
        console.log('Toast state set to show');
        // Refresh cart data
        fetchCart();
        setUpdatingId(null);
        // Trigger cart summary refresh
        if (onCartChange) {
          onCartChange();
        }
      })
      .catch((error) => {
        console.log('Delete failed:', error);
        setToast({ 
          show: true, 
          message: 'Failed to remove item', 
          type: 'error' 
        });
        setUpdatingId(null);
      });
  };

  if (loading) return (
    <LoadingSpinner 
      text="Loading cart items..." 
      color="primary" 
      size="lg"
      showText={true}
    />
  );
  
  if (error) return (
    <div className="text-center py-4">
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    </div>
  );
  
  if (!items.length) return (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className="fas fa-shopping-cart fa-4x text-muted"></i>
      </div>
      <h4 className="text-muted mb-3">Your cart is empty</h4>
      <p className="text-muted mb-4">Add some items to get started!</p>
      <button 
        className="btn btn-primary"
        onClick={() => window.history.back()}
      >
        <i className="fas fa-arrow-left me-2"></i>
        Continue Shopping
      </button>
    </div>
  );

  return (
    <>
      <div className="col-md-12">
        {items.map(item => (
          <div
            key={item._id}
            className="cart-item d-flex align-items-center mb-3 p-3 shadow-sm"
            style={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div className="position-relative">
              <img
                src={item.product && item.product.image ? `${BASE_URL}${item.product.image}` : 'https://placehold.co/100x100'}
                alt="Product Image"
                className="img-fluid"
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  border: '2px solid #dee2e6'
                }}
              />
              {updatingId === item._id && (
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    borderRadius: '8px'
                  }}
                >
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="ms-3 flex-grow-1">
              <h5 className="mb-1 fw-bold">{item.product ? item.product.name : 'Unknown Product'}</h5>
              <p className="mb-0 text-muted">
                <span className="fw-semibold">Price: </span>
                <span className="text-primary fw-bold">Tk {item.product ? item.product.price : 'N/A'}</span>
              </p>
              <small className="text-muted">
                <i className="fas fa-box me-1"></i>
                In Stock
              </small>
            </div>
            
            <div className="d-flex align-items-center">
              <div className="input-group me-3" style={{ width: '120px' }}>
                <span className="input-group-text bg-light">
                  <i className="fas fa-hashtag"></i>
                </span>
                <input
                  type="number"
                  className="form-control"
                  value={quantities[item._id] || 1}
                  min={1}
                  onChange={e => handleInputChange(item._id, parseInt(e.target.value, 10))}
                  disabled={updatingId === item._id}
                  style={{ fontSize: '14px' }}
                />
              </div>
              
              <button
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => handleUpdate(item._id)}
                disabled={updatingId === item._id || quantities[item._id] === item.quantity}
                style={{ minWidth: '80px' }}
              >
                {updatingId === item._id ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-1" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small>Wait</small>
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt me-1"></i>
                    Update
                  </>
                )}
              </button>
              
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleRemove(item._id)}
                disabled={updatingId === item._id}
                style={{ minWidth: '80px' }}
              >
                {updatingId === item._id ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-1" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small>Wait</small>
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt me-1"></i>
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
      />
    </>
  );
};

export default CartItem;