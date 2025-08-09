import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import Toast from '../ui/Toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setToast({
        show: true,
        message: 'Please enter your email address',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/auth/forgot-password/', {
        email: email.trim()
      });

      if (response.data.success) {
        setSent(true);
        setResetUrl(response.data.reset_url || ''); // Get reset URL from response for development
        setToast({
          show: true,
          message: 'Password reset instructions sent to your email',
          type: 'success'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to send reset email. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="fas fa-envelope-circle-check text-success" style={{ fontSize: '64px' }}></i>
                </div>
                <h3 className="card-title mb-4 text-success">Email Sent!</h3>
                <p className="text-muted mb-4">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className="text-muted mb-4">
                  Please check your email and follow the instructions to reset your password.
                </p>
                
                {/* Development: Show reset URL directly */}
                {resetUrl && (
                  <div className="alert alert-warning">
                    <h6><i className="fas fa-developer me-2"></i>Development Mode</h6>
                    <p className="mb-2">Since email isn't configured, use this direct link:</p>
                    <a 
                      href={resetUrl} 
                      className="btn btn-sm btn-warning"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-external-link-alt me-1"></i>
                      Reset Password Link
                    </a>
                  </div>
                )}
                
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <small>
                    Didn't receive the email? Check your spam folder or 
                    <button 
                      className="btn btn-link p-0 ms-1"
                      onClick={() => setSent(false)}
                    >
                      try again
                    </button>
                  </small>
                </div>
                <div className="d-grid gap-2">
                  <Link to="/login" className="btn btn-primary">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Login
                  </Link>
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
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="fas fa-key text-primary mb-3" style={{ fontSize: '48px' }}></i>
                <h3 className="card-title">Forgot Password?</h3>
                <p className="text-muted">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-2"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="d-grid gap-2 mb-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Send Reset Instructions
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="mb-0">
                    Remember your password? 
                    <Link to="/login" className="text-decoration-none ms-1">
                      Sign In
                    </Link>
                  </p>
                  <p className="mb-0 mt-2">
                    Don't have an account? 
                    <Link to="/register" className="text-decoration-none ms-1">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </form>
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

export default ForgotPassword;
