import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  type = 'border', 
  text = 'Loading...', 
  showText = true,
  color = 'primary',
  fullPage = false,
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary', 
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info',
    light: 'text-light',
    dark: 'text-dark',
    white: 'text-white'
  };

  const spinnerClass = type === 'grow' ? 'spinner-grow' : 'spinner-border';
  
  const spinner = (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <div 
        className={`${spinnerClass} ${sizeClasses[size]} ${colorClasses[color]}`} 
        role="status"
        aria-hidden="true"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {showText && (
        <div className={`mt-3 ${colorClasses[color]}`} style={{ fontSize: '14px' }}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div 
        className="d-flex align-items-center justify-content-center position-fixed w-100 h-100"
        style={{ 
          top: 0, 
          left: 0, 
          zIndex: overlay ? 9999 : 1000,
          backgroundColor: overlay ? 'rgba(255, 255, 255, 0.8)' : 'transparent'
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
