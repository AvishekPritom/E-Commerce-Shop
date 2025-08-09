import React from 'react';

const PaymentOptions = ({ numCartItems, cartTotal = 0 }) => {

  return (
    <div className="card shadow-sm payment-card">
      <div className="card-header payment-options-header text-white">
        <h5 className="mb-0">
          <i className="fas fa-credit-card me-2"></i>
          Payment Options
        </h5>
      </div>
      <div className="card-body">
        <div className="text-center p-4">
          <i className="fas fa-shopping-cart mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
          <h5 className="text-muted">Payment options coming soon</h5>
          <p className="text-muted">We're working on integrating secure payment methods for you.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;