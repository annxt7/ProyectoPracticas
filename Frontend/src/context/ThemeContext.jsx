import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("tribe-theme") || "light";
  });

  useEffect(() => {
    // Aplicamos el tema al HTML
    document.documentElement.setAttribute("data-theme", theme);
    // Guardamos la preferencia
    localStorage.setItem("tribe-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);