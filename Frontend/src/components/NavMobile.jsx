import React from "react";
import NavLinkMobile from "./NavLinkMobile";
import { Home, Search, Heart, LogOut } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavMobile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100/90 backdrop-blur-lg border-t border-base-content/5 px-6 py-3 md:hidden z-50 transition-colors duration-300">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        <NavLinkMobile
          icon={<Home size={24} />}
          active={isActive("/feed")}
          page={"/feed"}
        />
        <NavLinkMobile
          icon={<Search size={24} />}
          active={isActive("/explorer")}
          page={"/explorer"}
        />
        <NavLinkMobile
          icon={<Heart size={24} />}
          active={isActive("/activity")}
          page={"/activity"}
        />

        {/* FOTO DE PERFIL CON BORDER ADAPTATIVO */}
        <Link 
          to="/profile/me"
          className={`cursor-pointer border-2 rounded-full p-0.5 transition-all duration-300 ${
            isActive('/profile/me') 
              ? 'border-primary scale-110 shadow-lg shadow-primary/20' 
              : 'border-base-content/10'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-base-300 overflow-hidden">
            <img
              src={user?.avatar || user?.img || "https://ui-avatars.com/api/?name=Tribe&background=random"}
              alt="me"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* BOTÓN DE LOGOUT MEJORADO */}
        <button 
          onClick={handleLogout}
          className="p-2 text-base-content opacity-40 hover:opacity-100 hover:text-error transition-all"
          title="Cerrar Sesión"
        >
           <LogOut size={24} />
        </button>
      </div>
    </div>
  );
};

export default NavMobile;