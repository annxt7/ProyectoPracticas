import React from "react";
import Logo from "../assets/LogoClaro.webp";
import NavLinkDesktop from "./NavLinkDesktop";
import { useLocation, useNavigate } from "react-router-dom"; // Importamos useNavigate
import { Home, Search, Heart, User, LogOut } from "lucide-react"; // Añadimos LogOut
import { useAuth } from "../context/AuthContext"; // Importamos el contexto

const NavDesktop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // Sacamos la función logout

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirigimos al login al salir
  };

  return (
    <>
      <nav className="hidden md:flex sticky top-0 bg-base-100/80 backdrop-blur-md border-b border-white/40 z-40 px-6 py-3 justify-between items-center">
        <img
          src={Logo}
          alt="Tribe Logo"
          className="h-14 w-auto object-contain"
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

          {/* BOTÓN DE LOGOUT */}
          {/* Usamos los mismos estilos que NavLinkDesktop pero en un button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 transition opacity-50 hover:opacity-100 hover:text-error"
            title="Cerrar Sesión"
          >
            <LogOut size={24} />
            <span className="text-sm">Salir</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default NavDesktop;