import React from "react";
import Logo from "../assets/LogoClaro.png";
import NavLinkDesktop from "./NavLinkDesktop";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Importante para la lógica del logo

const NavDesktop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="hidden md:flex sticky top-0 bg-base-100/80 backdrop-blur-md border-b border-base-content/10 z-40 px-6 py-3 justify-between items-center transition-colors duration-300">
      {/* Si el tema es light, invertimos el logo para que se vea negro. 
          Si tu logo ya es oscuro de por sí, quita el 'filter invert' 
      */}
      <img
        src={Logo}
        alt="Tribe Logo"
        className={`h-14 w-auto object-contain transition-all duration-500 ${
          theme === 'light' || theme === 'cupcake' ? 'invert brightness-0' : ''
        }`}
      />

      <div className="flex gap-8 items-center">
        <NavLinkDesktop
          icon={<Home size={28} />}
          page={"/feed"}
          label="Inicio"
          active={isActive("/feed")}
        />
        <NavLinkDesktop
          icon={<Search size={24} />}
          page={"/explorer"}
          label="Explorar"
          active={isActive("/explorer")}
        />
        <NavLinkDesktop
          icon={<Heart size={24} />}
          page={"/activity"}
          label="Actividad"
          active={isActive("/activity")}
        />
        <NavLinkDesktop
          icon={<User size={24} />}
          page={"/profile/me"}
          label="Perfil"
          active={location.pathname.startsWith("/profile")}
        />

        <div className="h-6 w-[1px] bg-base-content/10 mx-2"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 transition-all opacity-50 hover:opacity-100 hover:text-error text-base-content"
          title="Cerrar Sesión"
        >
          <LogOut size={22} />
          <span className="text-xs font-bold uppercase tracking-wider">Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default NavDesktop;