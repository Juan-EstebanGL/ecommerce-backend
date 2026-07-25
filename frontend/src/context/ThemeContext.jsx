import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(undefined);

const STORAGE_KEY = "ecommerce-theme";

function resolveTheme(raw) {
  if (raw === "light" || raw === "dark") return raw;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function getInitialRaw() {
  return localStorage.getItem(STORAGE_KEY) || "system";
}

export function ThemeProvider({ children }) {
  const [raw, setRaw] = useState(getInitialRaw);
  const [resolved, setResolved] = useState(() => resolveTheme(getInitialRaw()));

  const setTheme = useCallback((newTheme) => {
    setRaw(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    const resolvedTheme = resolveTheme(newTheme);
    setResolved(resolvedTheme);
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolved === "light" ? "dark" : "light");
  }, [resolved, setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const stored = localStorage.getItem(STORAGE_KEY) || "system";
      setRaw(stored);
      const resolvedTheme = resolveTheme(stored);
      setResolved(resolvedTheme);
      document.documentElement.setAttribute("data-theme", resolvedTheme);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const value = { theme: raw, resolvedTheme: resolved, setTheme, toggleTheme, isDark: resolved === "dark" };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
