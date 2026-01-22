import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Inicializamos el estado (Prioridad: LocalStorage > Sistema > Modo Claro)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "black";
    }
    // Si no hay nada guardado, miramos la preferencia del sistema operativo
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 2. Efecto para aplicar el tema al DOM real
  useEffect(() => {
    const root = window.document.documentElement; // Accede a la etiqueta <html>
    const theme = isDarkMode ? "black" : "lofi";

    // DaisyUI y Tailwind v4 leen este atributo
    root.setAttribute("data-theme", theme);
    
    // Guardamos la preferencia para futuras visitas
    localStorage.setItem("theme", theme);

    // Mantenemos la clase .dark por si usas variantes de Tailwind estándar (dark:...)
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // DEBUG: Descomenta la línea de abajo para ver si el cambio llega al DOM
    // console.log("Tema actual aplicado:", theme);
  }, [isDarkMode]);

  // 3. Función para alternar el tema
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para consumir el tema en cualquier componente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
};