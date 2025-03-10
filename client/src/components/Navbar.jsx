import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css"; // Import CSS

const Navbar = () => {
  const location = useLocation();

  // Hide navbar on Admin Dashboard
  if (location.pathname.includes("/admin")) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">Plab 2 MOCKS by Dr. G</Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/login" className="nav-login">Login</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;


