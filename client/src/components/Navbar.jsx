import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/Navbar.css"; // Import your CSS

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Convert token existence to boolean
  }, [location.pathname]); // Update when the route changes

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/"; // Redirect to home
  };

  // Hide Navbar on Admin Dashboard
  if (location.pathname.includes("/admin")) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">Plab 2 MOCKS by Dr. G</Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>

          {/* Conditionally Render Login/Logout Button */}
          {isLoggedIn ? (
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login" className="nav-login">Login</Link>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
