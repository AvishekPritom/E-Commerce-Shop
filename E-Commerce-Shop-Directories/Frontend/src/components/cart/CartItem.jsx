import React, { useEffect, useState } from 'react';
import api from '../../api';
import { BASE_URL } from '../../api';

const CartItem = ({ setNumCartItems }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [quantities, setQuantities] = useState({});
  const cart_code = localStorage.getItem('cart_code');

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
    setUpdateError('');
    api.patch('update_quantity/', { item_id: itemId, quantity: quantities[itemId] })
      .then(() => {
        setSuccessMsg('Quantity updated!');
        fetchCart();
        setUpdatingId(null);
        setTimeout(() => setSuccessMsg(''), 2000);
      })
      .catch(() => {
        setUpdateError('Failed to update quantity');
        setUpdatingId(null);
      });
  };

  const handleRemove = (itemId) => {
    setUpdatingId(itemId);
    setUpdateError('');
    api.delete(`remove_cart_item/`, { data: { item_id: itemId } })
      .then(() => {
        setSuccessMsg('Item removed from cart!');
        fetchCart();
        setUpdatingId(null);
        setTimeout(() => setSuccessMsg(''), 2000);
      })
      .catch(() => {
        setUpdateError('Failed to remove item');
        setUpdatingId(null);
      });
  };

  if (loading) return <div>Loading cart items...</div>;
  if (error) return <div>{error}</div>;
  if (!items.length) return <div>Your cart is empty.</div>;

  return (
    <div className="col-md-12">
      {items.map(item => (
        <div
          key={item._id}
          className="cart-item d-flex align-items-center mb-3 p-3"
          style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
        >
          <img
            src={item.product && item.product.image ? `${BASE_URL}${item.product.image}` : 'https://placehold.co/100x100'}
            alt="Product Image"
            className="img-fluid"
            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }}
          />
          <div className="ms-3 flex-grow-1">
            <h5 className="mb-1">{item.product ? item.product.name : 'Unknown Product'}</h5>
            <p className="mb-0 text-muted">Tk {item.product ? item.product.price : 'N/A'}</p>
          </div>
          <div className="d-flex align-items-center">
            <input
              type="number"
              className="form-control me-3"
              value={quantities[item._id] || 1}
              min={1}
              onChange={e => handleInputChange(item._id, parseInt(e.target.value, 10))}
              disabled={updatingId === item._id}
              style={{ width: '70px' }}
            />
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={() => handleUpdate(item._id)}
              disabled={updatingId === item._id || quantities[item._id] === item.quantity}
            >
              {updatingId === item._id ? 'Updating...' : 'Update'}
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleRemove(item._id)}
              disabled={updatingId === item._id}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      {successMsg && <div className="text-success mt-2">{successMsg}</div>}
      {updateError && <div className="text-danger mt-2">{updateError}</div>}
    </div>
  );
};

export default CartItem;