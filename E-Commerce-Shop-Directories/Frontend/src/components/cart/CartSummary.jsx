import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import LoadingSpinner from '../ui/LoadingSpinner';

const CartSummary = ({ refreshTrigger }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cart_code = localStorage.getItem('cart_code');

  const fetchCartSummary = () => {
    setLoading(true);
    api.get(`get_cart_stat/?cart_code=${cart_code}`)
      .then(res => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load cart summary');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCartSummary();
  }, [cart_code, refreshTrigger]);

  if (loading) {
    return (
      <div className="card shadow-sm cart-summary-card">
        <div className="card-header cart-summary-header text-white">
          <h5 className="mb-0">
            <i className="fas fa-shopping-cart me-2"></i>
            Cart Summary
          </h5>
        </div>
        <div className="card-body text-center">
          <LoadingSpinner 
            text="Loading summary..." 
            color="primary" 
            size="sm"
            showText={true}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm cart-summary-card">
        <div className="card-header cart-summary-header text-white">
          <h5 className="mb-0">
            <i className="fas fa-shopping-cart me-2"></i>
            Cart Summary
          </h5>
        </div>
        <div className="card-body">
          <div className="alert alert-danger mb-0" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm cart-summary-card">
      <div className="card-header cart-summary-header text-white">
        <h5 className="mb-0">
          <i className="fas fa-shopping-cart me-2"></i>
          Cart Summary
        </h5>
      </div>
      <div className="card-body">
        {summary.total_items === 0 ? (
          <div className="cart-empty-state">
            <i className="fas fa-shopping-cart fa-3x mb-3"></i>
            <p className="text-muted">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Total Items:</span>
              <span className="fw-bold">{summary.total_items}</span>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Subtotal:</span>
              <span>৳{summary.total_price}</span>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span>Shipping:</span>
              <span className="text-success">Free</span>
            </div>
            <div className="d-flex justify-content-between py-3 border-bottom">
              <span className="fw-bold">Total:</span>
              <strong className="text-primary fs-5">৳{summary.total_price}</strong>
            </div>
            
            {/* Checkout Button */}
            <div className="mt-3">
              <Link 
                to="/checkout" 
                className="btn btn-success w-100 py-2"
                style={{ fontSize: '16px', fontWeight: '600' }}
              >
                <i className="fas fa-credit-card me-2"></i>
                Proceed to Checkout
              </Link>
            </div>
            
            <div className="mt-2">
              <Link 
                to="/" 
                className="btn btn-outline-primary w-100"
              >
                <i className="fas fa-shopping-bag me-2"></i>
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSummary;