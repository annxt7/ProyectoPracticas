import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "black";
    }
    // Si no hay preferencia guardada, revisamos si el usuario usa modo oscuro en su PC
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 2. Cada vez que isDarkMode cambie, actualizamos el HTML y el localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    const theme = isDarkMode ? "black" : "lofi";

    // Aplicamos el atributo que DaisyUI y Tailwind v4 escuchan
    root.setAttribute("data-theme", theme);
    

    localStorage.setItem("theme", theme);

    // Opcional: También podemos añadir/quitar la clase 'dark' para Tailwind estándar
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
};