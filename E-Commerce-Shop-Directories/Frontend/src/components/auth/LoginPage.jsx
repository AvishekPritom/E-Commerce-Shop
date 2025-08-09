import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { user, login, logout } = useAuth(); // Add user and logout from context

  // Handle logout for already authenticated users
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setToast({
        show: true,
        message: 'Successfully logged out!',
        type: 'success'
      });
      
      // Clear form data
      setFormData({
        email: '',
        password: '',
        rememberMe: false
      });
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Logout error:', error);
      setToast({
        show: true,
        message: 'Logout completed',
        type: 'success'
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, show logout interface
  if (user) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7 col-sm-9">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-success text-white text-center py-4">
                <h3 className="mb-0">
                  <i className="fas fa-user-check me-2"></i>
                  Already Logged In
                </h3>
                <p className="mb-0 mt-2">Welcome back, {user.first_name || user.name || user.email}!</p>
              </div>
              
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="fas fa-user-circle fa-5x text-success mb-3"></i>
                  <h5 className="text-muted">You are currently signed in</h5>
                  <p className="text-muted">
                    Choose an action below or logout to sign in with a different account.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="d-grid gap-3">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                  >
                    <i className="fas fa-user me-2"></i>
                    Go to Profile
                  </button>
                  
                  <button 
                    className="btn btn-info btn-lg"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Go to Dashboard
                  </button>
                  
                  <button 
                    className="btn btn-success btn-lg"
                    onClick={() => navigate('/')}
                    disabled={loading}
                  >
                    <i className="fas fa-shopping-bag me-2"></i>
                    Continue Shopping
                  </button>
                  
                  <hr className="my-3" />
                  
                  <button 
                    className="btn btn-danger btn-lg"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <LoadingSpinner 
                          size="sm" 
                          color="white" 
                          showText={false}
                        />
                        <span className="ms-2">Logging Out...</span>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout & Sign In with Different Account
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="card-footer text-center py-3 bg-light">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Securely logged in as {user.email}
                </small>
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({
        show: true,
        message: 'Please fix the errors below',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);
      
      // If login succeeds, result will have success: true
      if (result && result.success) {
        setToast({
          show: true,
          message: 'Login successful! Redirecting...',
          type: 'success'
        });

        // Redirect to profile or dashboard
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid login data provided.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7 col-sm-9">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h3 className="mb-0">
                <i className="fas fa-sign-in-alt me-2"></i>
                Welcome Back
              </h3>
              <p className="mb-0 mt-2">Sign in to your account</p>
            </div>
            
            <div className="card-body p-5">
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-bold">
                    <i className="fas fa-envelope me-2"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-bold">
                    <i className="fas fa-lock me-2"></i>
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="invalid-feedback d-block">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="row mb-4">
                  <div className="col-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <Link to="/forgot-password" className="text-decoration-none">
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <LoadingSpinner 
                        size="sm" 
                        color="white" 
                        showText={false}
                      />
                      <span className="ms-2">Signing In...</span>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In
                    </>
                  )}
                </button>

                {/* Social Login Options */}
                <div className="text-center mb-3">
                  <small className="text-muted">Or sign in with</small>
                </div>
                
                <div className="row">
                  <div className="col-6">
                    <button 
                      type="button" 
                      className="btn btn-outline-danger w-100"
                      disabled={loading}
                    >
                      <i className="fab fa-google me-2"></i>
                      Google
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary w-100"
                      disabled={loading}
                    >
                      <i className="fab fa-facebook-f me-2"></i>
                      Facebook
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="card-footer text-center py-3 bg-light">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="text-decoration-none fw-bold">
                Create Account
              </Link>
            </div>
          </div>

          {/* Security Information */}
          <div className="text-center mt-3">
            <small className="text-muted">
              <i className="fas fa-shield-alt me-1"></i>
              Your information is secure and encrypted
            </small>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={closeToast}
      />
    </div>
  );
};

export default LoginPage;
