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
    <>
      
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 px-6 py-3 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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

          <Link 
            to="/profile/me"
            className={`cursor-pointer border-2 rounded-full p-0.5 transition ${isActive('/profile/me') ? 'border-primary' : 'border-transparent'}`}
          >
            <div className="w-6 h-6 rounded-full bg-neutral overflow-hidden">
              <img
                src={user?.avatar || "https://i.pinimg.com/736x/b8/b3/12/b8b312949b0c78751f6aa82849120bc9.jpg"}
                alt="me"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          <button 
            onClick={handleLogout}
            className="p-2 text-base-content/50 hover:text-error transition"
            title="Cerrar Sesión"
          >
             <LogOut size={24} />
          </button>

        </div>
      </div>
    </>
  );
};

export default NavMobile;