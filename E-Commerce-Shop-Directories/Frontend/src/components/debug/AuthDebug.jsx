import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthDebug = () => {
  const { user, token, loading, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    try {
      // Test with dummy data for debugging
      const testUser = {
        id: 'test123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      };
      const testToken = 'test-token-123';
      
      // Manually set authentication state for testing
      localStorage.setItem('authToken', testToken);
      localStorage.setItem('user', JSON.stringify(testUser));
      
      // Reload the page to trigger auth initialization
      window.location.reload();
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">🔍 Authentication Debug Info</h5>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="text-center">
                    <strong>Loading:</strong>
                    <br />
                    <span className={`badge ${loading ? 'bg-warning' : 'bg-success'}`}>
                      {loading ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <strong>Authenticated:</strong>
                    <br />
                    <span className={`badge ${isAuthenticated ? 'bg-success' : 'bg-danger'}`}>
                      {isAuthenticated ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <strong>User Exists:</strong>
                    <br />
                    <span className={`badge ${user ? 'bg-success' : 'bg-danger'}`}>
                      {user ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <strong>Token Exists:</strong>
                    <br />
                    <span className={`badge ${token ? 'bg-success' : 'bg-danger'}`}>
                      {token ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              {user && (
                <div className="mb-4">
                  <strong>User Data:</strong>
                  <div className="bg-light p-3 mt-2 rounded">
                    <pre style={{fontSize: '12px', margin: 0}}>
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <strong>LocalStorage Data:</strong>
                <ul className="list-unstyled mt-2">
                  <li>
                    <span className="me-2">Token:</span>
                    <span className={`badge ${localStorage.getItem('authToken') ? 'bg-success' : 'bg-danger'}`}>
                      {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}
                    </span>
                  </li>
                  <li>
                    <span className="me-2">User:</span>
                    <span className={`badge ${localStorage.getItem('user') ? 'bg-success' : 'bg-danger'}`}>
                      {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <strong>SessionStorage Data:</strong>
                <ul className="list-unstyled mt-2">
                  <li>
                    <span className="me-2">Token:</span>
                    <span className={`badge ${sessionStorage.getItem('authToken') ? 'bg-success' : 'bg-danger'}`}>
                      {sessionStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}
                    </span>
                  </li>
                  <li>
                    <span className="me-2">User:</span>
                    <span className={`badge ${sessionStorage.getItem('user') ? 'bg-success' : 'bg-danger'}`}>
                      {sessionStorage.getItem('user') ? '✅ Present' : '❌ Missing'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button 
                  className="btn btn-warning me-2" 
                  onClick={handleTestLogin}
                >
                  🧪 Test Login (Debug)
                </button>
                
                <button 
                  className="btn btn-primary me-2" 
                  onClick={handleGoToProfile}
                  disabled={!user}
                >
                  👤 Go to Profile
                </button>
                
                <button 
                  className="btn btn-danger" 
                  onClick={logout}
                  disabled={!user}
                >
                  🚪 Logout
                </button>
              </div>

              <div className="mt-4">
                <div className="alert alert-info">
                  <strong>Debug Instructions:</strong>
                  <ol className="mb-0 mt-2">
                    <li>Click "Test Login" to simulate authentication</li>
                    <li>Check if all states show "Yes" and "Present"</li>
                    <li>Try "Go to Profile" to test protected route access</li>
                    <li>Use "Logout" to clear authentication state</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
