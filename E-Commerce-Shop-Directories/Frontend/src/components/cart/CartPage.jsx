import React, { useState, useEffect } from 'react';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import LoadingSpinner from '../ui/LoadingSpinner';
import api from '../../api';

const CartPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cartLoading, setCartLoading] = useState(true); // Start with loading true
  const [showSpinner, setShowSpinner] = useState(false); // Control spinner visibility with delay
  const [initialLoad, setInitialLoad] = useState(true); // Track initial page load
  const [numCartItems, setNumCartItems] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  
  const cart_code = localStorage.getItem('cart_code');

  useEffect(() => {
    if (cart_code) {
      fetchCartData();
    }
  }, [cart_code, refreshTrigger]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  const fetchCartData = async () => {
    if (!initialLoad) {
      setCartLoading(true);
      
      // Set a delay before showing the spinner to prevent flashing
      const timeout = setTimeout(() => {
        setShowSpinner(true);
      }, 3000); // 3000ms delay

      setLoadingTimeout(timeout);
    }
    
    try {
      const response = await api.get(`get_cart_stat/?cart_code=${cart_code}`);
      setCartTotal(response.data.total || 0);
      setNumCartItems(response.data.items_count || 0);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    } finally {
      // Clear timeout and hide spinner
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
      setShowSpinner(false);
      setCartLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  };

  const handleCartChange = async () => {
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    setCartLoading(true);
    
    // Set a delay before showing the spinner
    const timeout = setTimeout(() => {
      setShowSpinner(true);
    }, 3000); // 3000ms delay

    setLoadingTimeout(timeout);
    setRefreshTrigger(prev => prev + 1);
    // The loading will be set to false in fetchCartData
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="fas fa-shopping-cart me-2"></i>
            Shopping Cart
            {showSpinner && !initialLoad && (
              <span className="ms-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </span>
            )}
          </h2>
        </div>
      </div>
      
      {initialLoad ? (
        <div className="row">
          <div className="col-12">
            <LoadingSpinner 
              size="lg" 
              text="Loading your cart..." 
              color="primary"
              fullPage={false}
            />
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Cart Items Section */}
          <div className="col-lg-8 col-md-12 mb-4">
            <div className="position-relative">
              {showSpinner && !initialLoad && (
                <div 
                  className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    zIndex: 10,
                    minHeight: '200px'
                  }}
                >
                  <LoadingSpinner 
                    size="md" 
                    text="Updating cart..." 
                    color="primary"
                  />
                </div>
              )}
              <CartItem 
                setNumCartItems={setNumCartItems}
                onCartChange={handleCartChange}
                cartLoading={cartLoading}
              />
            </div>
          </div>
          
          {/* Cart Summary Section */}
          <div className="col-lg-4 col-md-12">
            <div className="row">
              <div className="col-12 mb-4">
                <div className="position-relative">
                  {showSpinner && !initialLoad && (
                    <div 
                      className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        zIndex: 10,
                        minHeight: '150px'
                      }}
                    >
                      <LoadingSpinner 
                        size="sm" 
                        text="Updating..." 
                        color="primary"
                        showText={false}
                      />
                    </div>
                  )}
                  <CartSummary 
                    refreshTrigger={refreshTrigger}
                    onCartChange={handleCartChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;