import NavLinkMobile from "./NavLinkMobile";
import { Home, Search, Heart } from "lucide-react";
import { useLocation } from "react-router-dom";

const NavMobile = () => {
  const location = useLocation();
  
  // Función para verificar si la ruta está activa
  const isActive = (path) => location.pathname === path;


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 px-6 py-3 md:hidden z-50">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        <NavLinkMobile
          icon={<Home size={24} />}
          active={isActive("/feed")}
          page="/feed"
        />
        <NavLinkMobile
          icon={<Search size={24} />}
          active={isActive("/explorer")}
          page="/explorer"
        />
        <NavLinkMobile
          icon={<Heart size={24} />}
          active={isActive("/activity")}
          page="/activity"
        />

        {/* Corregido: Se pasa el avatar como la prop 'icon' */}
        <NavLinkMobile
          icon={
            <div className={`rounded-full p-0.5 border-2 ${isActive(`/profile/me`) ? 'border-primary' : 'border-transparent'}`}>
              <div className="w-6 h-6 rounded-full bg-neutral overflow-hidden">
                <img
                  src="https://i.pinimg.com/736x/b8/b3/12/b8b312949b0c78751f6aa82849120bc9.jpg"
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          }
          active={isActive(`/profile/me`)}
          page={`/profile/me`}
        />
      </div>
    </div>
  );
};

export default NavMobile;