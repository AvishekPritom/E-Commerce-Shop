import { FaFacebookSquare } from "react-icons/fa";
import { FaTwitterSquare } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="py-3"
      style={{
        backgroundColor: "#0650DC",
        color: "white",
      }}
    >
      <div className="container text-center">
        <div className="mb-2">
          <a href="#" className="text-white text-decoration-none mx-2">
            Home
          </a>
          <a href="#" className="text-white text-decoration-none mx-2">
            About
          </a>
          <a href="#" className="text-white text-decoration-none mx-2">
            Shop
          </a>
          <a href="#" className="text-white text-decoration-none mx-2">
            Contact
          </a>
        </div>

        <div className="mb-2">
          <a href="#" className="text-white mx-2">
            <FaFacebookSquare />
          </a>
          <a href="#" className="text-white mx-2">
            <FaTwitterSquare />
          </a>
          <a href="#" className="text-white mx-2">
            <FaInstagramSquare />
          </a>
        </div>

        <p className="small mb-0">&copy; 2025 Shoppit</p>
      </div>
    </footer>
  );
};

export { Footer };
