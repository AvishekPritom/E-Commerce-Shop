import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const CartSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cart_code = localStorage.getItem('cart_code');

  useEffect(() => {
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
  }, [cart_code]);

  if (loading) return <div>Loading cart summary...</div>;
  if (error) return <div>{error}</div>;
  if (!summary) return null;

  return (
    <div className="col-md-4 align-self-start">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Cart Summary</h5>
          <hr />
          <div className="d-flex justify-content-between">
            <span>Total Items:</span>
            <span>{summary.total_items}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Total Price:</span>
            <strong>Tk {summary.total_price}</strong>
          </div>
          <Link to="/checkout">
            <button
              className="btn btn-primary w-100 mt-3"
              style={{ backgroundColor: '#6050DC', borderColor: '#6050DC' }}
            >
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;