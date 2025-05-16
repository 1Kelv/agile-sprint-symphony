
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference or system preference
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        
        console.log("Initial theme calculation:", { savedTheme, prefersDark });
        return savedTheme || (prefersDark ? "dark" : "light");
      } catch (error) {
        console.error("Error reading theme from localStorage:", error);
        return "light"; // Fallback
      }
    }
    return "light";
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      
      console.log("Applying theme:", theme);
      
      // Remove the previous theme class
      root.classList.remove("light", "dark");
      
      // Add the current theme class
      root.classList.add(theme);
      
      // Save theme preference
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log("Toggling theme from", theme);
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      console.log("New theme will be:", newTheme);
      return newTheme;
    });
  };

  const value = {
    theme,
    toggleTheme,
  };

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
