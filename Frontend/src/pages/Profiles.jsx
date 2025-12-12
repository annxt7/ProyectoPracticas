import React, { useState } from "react";
import {
  Settings,
  Plus,
  UserPlus,
  Grid,
  Bookmark,
  Home,
  Search,
  User,
  Heart,
  Share2,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../assets/LogoClaro.png";
import NavLinkDesktop from "../components/NavDesktop.jsx";
import NavLinkMobile from "../components/NavMobile.jsx";

const Profile = ({ isOwnProfile = true }) => {
  const [activeTab, setActiveTab] = useState("collections");

  // Datos simulados para el diseño
  const stats = [
    { label: "Colecciones", value: "12" },
    { label: "Seguidores", value: "1.4k" },
    { label: "Siguiendo", value: "342" },
  ];

  return (
    <div className="min-h-screen bg-base-100 pb-24 md:pb-10 font-sans text-base-content">
      {/* =======================
          NAVBAR DE ESCRITORIO
      ======================== */}
      <nav className="hidden md:flex sticky top-0 bg-base-100/80 backdrop-blur-md border-b border-base-200 z-40 px-6 py-3 justify-between items-center">
        <img
          src={Logo}
          alt="Tribe Logo"
          className="h-15 w-auto object-contain"
        />
        <div className="flex gap-8">
          <NavLinkDesktop icon={<Home size={28} />} page={"/feed"} label="Inicio" />
          <NavLinkDesktop
            icon={<Search size={24} />}
            page={"/explorer"}
            label="Explorar"
          />
          <NavLinkDesktop
            icon={<Heart size={24} />}
            page={"/feed"}
            label="Actividad"
          />
          <NavLinkDesktop
            icon={<User size={24} />}
            page={"/profile/:username"}
            label="Perfil"
            active
          />
        </div>
      </nav>
      <main className=" max-w-full w-1000 mx-auto">
        {/* =======================
            HEADER DEL PERFIL
        ======================== */}
        <div className="relative">
          <div className="h-40 md:h-82 w-full bg-linear-to-r from-gray-200 to-gray-300 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
              alt="cover"
              className="w-full h-full object-cover opacity-50"
            />
          </div>

          {/* Info del Usuario */}
          <div className="px-6 relative">
            {/* Avatar */}
            <div className="flex justify-between items-end -mt-12 mb-4">
              <div className="avatar ring-4 ring-base-100 rounded-full bg-base-100">
                <div className="w-24 md:w-32 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
                    alt="profile"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2 mb-2">
                {isOwnProfile ? (
                  <>
                    <button className="btn btn-md py-1 btn-ghost border border-base-300 rounded-full px-6">
                      Editar Perfil
                    </button>
                    <button className="btn btn-md btn-circle btn-ghost border border-base-300">
                      <Settings size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm rounded-full px-6 gap-2">
                      <UserPlus size={16} /> Seguir
                    </button>
                    <button className="btn btn-sm btn-circle btn-ghost border border-base-300">
                      <Share2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Texto Bio */}
            <div className="space-y-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-serif">
                  Usuario_07
                </h1>
                <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> Madrid, ES
                </p>
              </div>

              <p className="max-w-md text-base leading-relaxed opacity-80">
                Cineasta visual y recolectora de vinilos de los 70s. Intentando
                organizar mi caos visual en pequeñas dosis. ☕️ & 🎬
              </p>

              {/* Stats Row */}
              <div className="flex gap-6 py-2 border-y border-base-200/50 md:border-none md:py-0">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row md:gap-2 items-center md:items-baseline"
                  >
                    <span className="font-bold text-lg">{stat.value}</span>
                    <span className="text-xs md:text-sm opacity-60 uppercase tracking-wide">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =======================
            TABS DE CONTENIDO
        ======================== */}
        <div className="border-t border-base-200 mt-2">
          <div className="flex justify-center gap-12">
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 py-4 border-t-2 text-sm font-medium tracking-wide transition-colors ${
                activeTab === "collections"
                  ? "border-primary text-base-content"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              <Grid size={18} /> MIS COLECCIONES
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-4 border-t-2 text-sm font-medium tracking-wide transition-colors ${
                activeTab === "saved"
                  ? "border-primary text-base-content"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              <Bookmark size={18} /> GUARDADO
            </button>
          </div>
        </div>

        {/* =======================
            GRID DE COLECCIONES
        ======================== */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-1 md:gap-5 p-1 md:px-6">
          {/* Botón Crear (Solo visible en Desktop o como primer item) */}
          {isOwnProfile && (
            <div className="aspect-square bg-base-100 border-2 border-dashed border-base-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-base-200/50 hover:border-primary/50 transition group">
              <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition">
                <Plus size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100">
                Nueva
              </span>
            </div>
          )}

          {[1, 2, 3, 4, 5, 6].map((item) => (
            <>
              <div class="card card-sm bg-base-200 max-w-60 shadow">
                <figure class="hover-gallery" key={item}>
                  <img
                    src={`https://picsum.photos/400?random=${item + 10}`}
                    alt="Collection"
                  />
                  <img
                    src={`https://picsum.photos/400?random=${item + 11}`}
                    alt="Collection"
                  />
                  <img
                    src={`https://picsum.photos/400?random=${item + 12}`}
                    alt="Collection"
                  />
                  <img
                    src={`https://picsum.photos/400?random=${item + 13}`}
                    alt="Collection"
                  />
                  <img
                    src={`https://picsum.photos/400?random=${item + 14}`}
                    alt="Collection"
                  />
                  <img
                    src={`https://picsum.photos/400?random=${item + 15}`}
                    alt="Collection"
                  />
                </figure>
                <div class="card-body">
                    <p className="text-white font-serif font-bold truncate">
                      Retro Vibes
                    </p>
                    <p className="text-white/70 text-xs">24 items</p>
                </div>
              </div>
            </>
            // <div
            //   key={item}
            //   className="aspect-square bg-base-200 rounded-lg overflow-hidden relative group cursor-pointer"
            // >
            //   <img
            //     src={`https://picsum.photos/400?random=${item + 10}`}
            //     alt="Collection"
            //     className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            //   />
            //   {/* Overlay al Hover */}
            //   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            //     <p className="text-white font-serif font-bold truncate">
            //       Retro Vibes
            //     </p>
            //     <p className="text-white/70 text-xs">24 items</p>
            //   </div>
            // </div>
          ))}
        </div>
      </main>

      {/* =======================
          MOBILE BOTTOM NAV
      ======================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 px-6 py-3 md:hidden z-50">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          <NavLinkMobile icon={<Home size={24} />}page={"/feed"} />
          <NavLinkMobile icon={<Search size={24} />} page={"/explorer"} />
          <NavLinkMobile icon={<Heart size={24} />} />

          {/* Avatar Pequeño para perfil activo */}
          <div className="cursor-pointer border-2 border-black rounded-full p-0.5">
            <div className="w-6 h-6 rounded-full bg-neutral overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                alt="me"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
