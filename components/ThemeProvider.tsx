"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;

    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else {
      setTheme("dark");
    }
  }, []);

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;

    // Remove old theme class only
    root.classList.remove("light", "dark");

    // Add current theme
    root.classList.add(theme);

    // Save preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark" ? "light" : "dark"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}