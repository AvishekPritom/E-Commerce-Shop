import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import Toast from '../ui/Toast';
import PlaceHolder from '../ui/PlaceHolder';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await api.post('/auth/validate-reset-token/', { token });
      if (response.data.valid) {
        setValidToken(true);
      } else {
        setValidToken(false);
      }
    } catch (error) {
      setValidToken(false);
    } finally {
      setValidating(false);
    }
  };

  const handleInputChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword.length < 6) {
      setToast({
        show: true,
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setToast({
        show: true,
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/auth/reset-password/', {
        token,
        new_password: passwords.newPassword
      });

      if (response.data.success) {
        setToast({
          show: true,
          message: 'Password reset successfully! Redirecting to login...',
          type: 'success'
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to reset password. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Validating reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '64px' }}></i>
                </div>
                <h3 className="card-title mb-4 text-danger">Invalid Reset Link</h3>
                <p className="text-muted mb-4">
                  This password reset link is invalid or has expired.
                </p>
                <div className="d-grid gap-2">
                  <Link to="/forgot-password" className="btn btn-primary">
                    <i className="fas fa-key me-2"></i>
                    Request New Reset Link
                  </Link>
                  <Link to="/login" className="btn btn-outline-secondary">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                <i className="fas fa-lock text-primary mb-3" style={{ fontSize: '48px' }}></i>
                <h3 className="card-title">Reset Your Password</h3>
                <p className="text-muted">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="newPassword"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                    minLength="6"
                  />
                  <div className="form-text">Password must be at least 6 characters long</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
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
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Reset Password
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    <i className="fas fa-arrow-left me-1"></i>
                    Back to Login
                  </Link>
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

export default ResetPassword;
