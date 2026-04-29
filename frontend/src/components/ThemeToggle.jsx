/**
 * ThemeToggle.jsx
 * Dark / Light mode toggle button.
 * Reads and writes via the ThemeContext.
 */

import { useContext } from "react";
import { ThemeContext } from "../App";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {isDark ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}
