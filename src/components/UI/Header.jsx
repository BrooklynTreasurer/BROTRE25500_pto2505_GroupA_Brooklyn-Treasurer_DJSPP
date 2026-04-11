import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Resolves the initial color theme from local storage or system preference.
 * @returns {"light" | "dark"}
 */
function getInitialTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Header section with app title and theme toggle button.
 * @returns {JSX.Element}
 */
export default function Header() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header className="app-header">
      <h1>🎙️Podcast App</h1>
      <nav className="app-header__nav" aria-label="Primary">
        <Link to="/favourites" className="favorite-button">
          Favourites ❤️
        </Link>
        <Link to="/" className="home-button__nav">
          Home 🏠
        </Link>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
        </button>
      </nav>
    </header>
  );
}
