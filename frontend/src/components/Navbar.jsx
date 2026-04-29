/**
 * Navbar.jsx
 * Top navigation bar with logo, links, auth state, and theme toggle.
 */

import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { AuthContext } from "../App";
import "./Navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => pathname === path ? "navbar__link--active" : "";

  return (
    <header className="navbar" role="banner">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="Khushi AI Home">
          <span className="navbar__logo-icon">🎵</span>
          <span className="navbar__logo-text">
            <span className="gradient-text">Khushi</span> AI
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="navbar__nav" aria-label="Main navigation">
          <Link to="/about" className={`navbar__link ${isActive("/about")}`}>
            About Us
          </Link>
          <Link to="/" className={`navbar__link ${isActive("/")}`}>
            Discover
          </Link>
          <Link to="/saved" className={`navbar__link ${isActive("/saved")}`}>
            Saved
          </Link>
          <Link to="/contact" className={`navbar__link ${isActive("/contact")}`}>
            Contact
          </Link>
        </nav>

        {/* Auth & Theme */}
        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user">
              <span className="navbar__user-greeting">Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn-ghost btn-sm navbar__logout" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar__auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
