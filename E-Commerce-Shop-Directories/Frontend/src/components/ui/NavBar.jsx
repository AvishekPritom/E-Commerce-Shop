import { FaCartShopping } from "react-icons/fa6";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";
import { NavBarLink } from "./NavBarLink";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";

const NavBar = ({ numCartItems = 0 }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Ensure numCartItems is always a valid number
  const safeNumCartItems = isNaN(numCartItems) ? 0 : numCartItems;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 ${styles.stickyNavbar}`}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold text-uppercase" to="/">
          SHOPPIT
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="ms-auto d-flex align-items-center">
            <NavBarLink />
            
            {/* Always show user button with dropdown, even if not authenticated */}
            <div className="d-flex align-items-center ms-3">
              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="btn btn-outline-primary dropdown-toggle me-2"
                  type="button"
                  onClick={toggleDropdown}
                  aria-expanded={dropdownOpen}
                >
                  <i className="fas fa-user me-1"></i>
                  {isAuthenticated ? (user?.first_name || user?.name || user?.email || 'User') : 'User'}
                </button>
                <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                  {isAuthenticated ? (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/dashboard" onClick={closeDropdown}>
                          <i className="fas fa-tachometer-alt me-2"></i>
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/profile" onClick={closeDropdown}>
                          <i className="fas fa-user-edit me-2"></i>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/my-orders" onClick={closeDropdown}>
                          <i className="fas fa-box me-2"></i>
                          My Orders
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          className="dropdown-item text-danger"
                          onClick={handleLogout}
                        >
                          <i className="fas fa-sign-out-alt me-2"></i>
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/login" onClick={closeDropdown}>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/register" onClick={closeDropdown}>
                          <i className="fas fa-user-plus me-2"></i>
                          Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Cart Button */}
            <Link
              to="/cart"
              className={`btn btn-dark ms-3 rounded-pill position-relative ${styles.responssiveCart}`}
            >
              <FaCartShopping />
              {safeNumCartItems === 0 || <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{
                  fontSize: "0.85rem",
                  padding: "0.5em 0.65em",
                  backgroundColor: "#6050DC",
                }}
              >
                {safeNumCartItems}
              </span>}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { NavBar };
