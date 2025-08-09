import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', show, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) {
    return null;
  }

  const getToastClasses = () => {
    const baseClasses = 'alert alert-dismissible';
    const typeClasses = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info'
    };
    return `${baseClasses} ${typeClasses[type] || typeClasses.success}`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  return (
    <div
      className={getToastClasses()}
      role="alert"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px',
        maxWidth: '400px',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="d-flex align-items-center">
        <span className="me-2" style={{ fontSize: '16px' }}>{getIcon()}</span>
        <div className="flex-grow-1">
          <strong>{type.charAt(0).toUpperCase() + type.slice(1)}: </strong>
          {message}
        </div>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
};

export default Toast;
