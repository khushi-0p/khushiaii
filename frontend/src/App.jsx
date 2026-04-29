import { useState, useEffect, createContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Saved from "./pages/Saved";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { getTheme, saveTheme } from "./utils/localStorage";

// Create contexts to share state across components
export const ThemeContext = createContext();
export const AuthContext = createContext();

// Protected Route Component
function ProtectedRoute({ children }) {
  const user = localStorage.getItem("aiplayer_user");
  const location = useLocation();

  if (!user) {
    // Redirect to login if trying to access a protected route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Mock load user session
    const storedUser = localStorage.getItem("aiplayer_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    saveTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("aiplayer_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aiplayer_user");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
