import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check localStorage first (remember me)
        let storedToken = localStorage.getItem('authToken');
        let storedUser = localStorage.getItem('user');

        // If not in localStorage, check sessionStorage
        if (!storedToken) {
          storedToken = sessionStorage.getItem('authToken');
          storedUser = sessionStorage.getItem('user');
        }

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token validity (optional)
          verifyToken(storedToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Verify token validity
  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await api.get('/auth/verify-token/');
      if (!response.data.valid) {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password,
        rememberMe
      });

      // Backend returns: { success: true, token: "...", user: {...} }
      if (response.data.success && response.data.token) {
        const { token: newToken, user: userData } = response.data;

        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);

        // Store in appropriate storage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', newToken);
        storage.setItem('user', JSON.stringify(userData));

        // Set API default header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        return { success: true, user: userData };
      } else {
        // If response doesn't have success=true or token, treat as failed
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Clear storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');

    // Remove API default header
    delete api.defaults.headers.common['Authorization'];
  };

  // Update user profile
  const updateUser = async (updatedData) => {
    try {
      const response = await api.put('/auth/profile/', updatedData);
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);

        // Update storage
        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(updatedUser));

        return { success: true, user: updatedUser };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  // Check if user has specific role/permission
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Refresh token (if implementing refresh token mechanism)
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh-token/');
      if (response.data.success) {
        const newToken = response.data.token;
        setToken(newToken);

        // Update storage
        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('authToken', newToken);

        // Update API header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        return newToken;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  const value = {
    // State
    user,
    token,
    loading,
    isAuthenticated,

    // Methods
    login,
    register,
    logout,
    updateUser,
    changePassword,
    hasPermission,
    refreshToken,
    verifyToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
