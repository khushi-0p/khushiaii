import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../App";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from signup, we might have a success message
  const successMessage = location.state?.message;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Always let the testing account in
    if (email === "test@example.com" && password === "password") {
      login({ email, name: "Test User" });
      navigate("/");
      return;
    }

    // Verify against mock database
    const existingUsers = JSON.parse(localStorage.getItem("aiplayer_users") || "[]");
    const foundUser = existingUsers.find(u => u.email === email && u.password === password);

    if (foundUser) {
      // Login successful!
      login({ email: foundUser.email, name: foundUser.name });
      
      // Send them to where they were trying to go, or home
      const destination = location.state?.from?.pathname || "/";
      navigate(destination);
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <main className="auth-page animate-fadeIn">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to curate your perfect vibes.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {successMessage && !error && (
            <div className="auth-error" style={{ backgroundColor: "rgba(29, 185, 84, 0.1)", borderColor: "var(--success)", color: "var(--success)" }}>
              {successMessage}
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>
        </div>
      </div>
    </main>
  );
}
