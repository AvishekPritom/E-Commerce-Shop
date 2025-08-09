import { Link } from "react-router-dom";

const NavBarLink = () => {
  return (
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
      <li className="nav-item">
        <Link to="/" className="nav-link active fw-semibold">
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/about" className="nav-link fw-semibold">
          About
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/contact" className="nav-link fw-semibold">
          Contact
        </Link>
      </li>
    </ul>
  );
};

export { NavBarLink };
