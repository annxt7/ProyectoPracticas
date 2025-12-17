import NavLinkMobile from "./NavLinkMobile";
import { Home, Search, Heart } from "lucide-react";
import { useLocation } from "react-router-dom";

const NavMobile = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 px-6 py-3 md:hidden z-50">
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
          <div className="cursor-pointer border-2 border-transparent rounded-full p-0.5">
            <div className="w-6 h-6 rounded-full bg-neutral overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                alt="me"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default NavMobile;
