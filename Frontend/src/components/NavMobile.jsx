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
    <nav className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-content/10 px-6 py-3 md:hidden z-50 transition-colors duration-300">
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

        {/* Avatar de Perfil */}
        <Link 
          to="/profile/me"
          className={`border-2 rounded-full p-0.5 transition-all ${isActive('/profile/me') ? 'border-primary' : 'border-transparent'}`}
        >
          <div className="w-7 h-7 rounded-full bg-base-300 overflow-hidden">
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky"}
              alt="me"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-2 text-base-content/60 hover:text-error transition"
        >
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  );
};

export default NavMobile;