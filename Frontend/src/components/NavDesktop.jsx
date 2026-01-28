import React from "react";
import Logo from "../assets/LogoClaro.webp";
import LogoOscuro from "../assets/LogoOscuro.webp"; 
import NavLinkDesktop from "./NavLinkDesktop"; 
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, User, LogOut, Palette } from "lucide-react"; 
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; 

const NavDesktop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme} = useTheme(); 


  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
   const isDark = ["dark", "natura-dark", "midnight-rose", "mocha-night", "galactic-purple", "mundi-deep","royal-wine"].includes(theme);

  return (
    <nav className="hidden md:flex sticky top-0 bg-base-100/80 backdrop-blur-md border-b border-base-content/10 z-40 px-6 py-3 justify-between items-center transition-colors duration-300">
      
      <img
        src={isDark ? Logo : LogoOscuro }
        alt="Tribe Logo"
        className="h-14 w-auto object-contain transition-all"
      />

      <div className="flex gap-6 items-center">
        <NavLinkDesktop icon={<Home size={28} />} page={"/feed"} label="Inicio" active={isActive("/feed")} />
        <NavLinkDesktop icon={<Search size={24} />} page={"/explorer"} label="Explorar" active={isActive("/explorer")} />
        <NavLinkDesktop icon={<Heart size={24} />} page={"/activity"} label="Actividad" active={isActive("/activity")} />
        <NavLinkDesktop icon={<User size={24} />} page={"/profile/me"} label="Perfil" active={location.pathname.startsWith("/profile")} />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 opacity-50 hover:opacity-100 hover:text-error transition-all"
        >
          <LogOut size={24} />
          <span className="text-sm">Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default NavDesktop;