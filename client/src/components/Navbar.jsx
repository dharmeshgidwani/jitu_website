import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token")); // Initialize based on token

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token")); // Update login state when token changes
    };

    // Listen for storage changes (login/logout/signup)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage")); // Notify other components
  };

  if (location.pathname.includes("/admin")) return null;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img src="/jitu-logo.JPG" alt="Logo" className="nav-logo-img" />
            <span className="nav-title">Plab 2 MOCKS by Dr. G</span>
          </Link>

          {/* Navigation Links */}
          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>

            {/* Conditional Rendering for Login/Logout */}
            {isLoggedIn ? (
              <li><button className="nav-logout" onClick={handleLogout}>Logout</button></li>
            ) : (
              <li><Link to="/login" className="nav-login" onClick={() => setMenuOpen(false)}>Login</Link></li>
            )}
          </ul>

          {/* Mobile Menu Icon */}
          <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </nav>

      {/* Empty div to prevent content shift */}
      <div className="navbar-space"></div>
    </>
  );
};

export default Navbar;
