import React from "react";
import Logo from "../assets/LogoClaro.png";
import NavLinkDesktop from "./NavLinkDesktop";
import { useLocation } from "react-router";
import { Home, Search, Heart, User } from "lucide-react";

const NavDesktop=()=>{
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

return(
    <>
<nav className="hidden md:flex sticky top-0 bg-base-100/80 backdrop-blur-md border-b border-white z-40 px-6 py-3 justify-between items-center">          <img
            src={Logo}
            alt="Tribe Logo"
            className="h-14 w-auto object-contain"
          />

          <div className="flex gap-8">
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
          </div>
        </nav>

    </>)
}
export default NavDesktop;