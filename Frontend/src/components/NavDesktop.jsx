import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, User, LogOut, Sun, Moon } from "lucide-react";

// Contextos
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Componentes
import NavLinkDesktop from "./NavLinkDesktop";

// Assets
import LogoClaro from "../assets/LogoClaro.webp";
import LogoOscuro from "../assets/LogoOscuro.webp";

const NavDesktop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="hidden md:flex sticky top-0 bg-base-100/80 backdrop-blur-md border-b border-base-content/10 z-50 px-6 py-3 justify-between items-center transition-colors duration-300">
      
      {/* LOGO DINÁMICO */}
      <img
        src={isDarkMode ? LogoOscuro : LogoClaro}
        alt="Tribe Logo"
        className="h-12 w-auto object-contain"
      />

      <div className="flex gap-8 items-center">
        <NavLinkDesktop
          icon={<Home size={24} />}
          page="/feed"
          label="Inicio"
          active={isActive("/feed")}
        />
        <NavLinkDesktop
          icon={<Search size={24} />}
          page="/explorer"
          label="Explorar"
          active={isActive("/explorer")}
        />
        <NavLinkDesktop
          icon={<Heart size={24} />}
          page="/activity"
          label="Actividad"
          active={isActive("/activity")}
        />
        <NavLinkDesktop
          icon={<User size={24} />}
          page="/profile/me"
          label="Perfil"
          active={location.pathname.startsWith("/profile")}
        />

        {/* BOTÓN CAMBIO DE TEMA */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle text-base-content hover:bg-base-200 transition-colors"
          aria-label="Cambiar tema"
        >
          {isDarkMode ? (
            <Sun size={22} className="text-yellow-400" />
          ) : (
            <Moon size={22} className="text-slate-600" />
          )}
        </button>

        {/* BOTÓN CERRAR SESIÓN */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 transition-all opacity-60 hover:opacity-100 hover:text-error"
          title="Cerrar Sesión"
        >
          <LogOut size={22} />
          <span className="text-sm font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default NavDesktop;