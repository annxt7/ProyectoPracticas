import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Home,
  Search,
  User,
  Plus,
} from "lucide-react";
import Logo from "../assets/LogoClaro.png";
// Asumiendo que estos componentes están en la ruta correcta según tu proyecto
import NavLinkDesktop from "../components/NavDesktop.jsx";
import NavLinkMobile from "../components/NavMobile.jsx";
import MiniUserCard from "../components/MiniUserCard.jsx";

const Feed = () => {
  // Datos simulados del Feed
  const activities = [
    {
      id: 1,
      user: "sofia_art",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      action: "añadió a la colección",
      target: "Vinilos 80s",
      image:
        "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=600",
      title: "Pink Floyd - The Wall",
      likes: 24,
      comments: 3,
      time: "2h",
    },
    {
      id: 2,
      user: "marc_design",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100",
      action: "creó una nueva colección",
      target: "Cámaras Analógicas",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600",
      title: "Canon AE-1 Program",
      likes: 156,
      comments: 12,
      time: "5h",
    },
    {
      id: 3,
      user: "luna_reads",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
      action: "guardó un elemento",
      target: "Lecturas 2024",
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
      title: "1984 - George Orwell",
      likes: 42,
      comments: 8,
      time: "1d",
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content">
      <nav className="hidden md:flex sticky top-0 bg-base-100/80 backdrop-blur-md border-b border-base-200 z-40 px-6 py-3 justify-between items-center">
        <img
          src={Logo}
          alt="Tribe Logo"
          className="h-10 w-auto object-contain"
        />
        <div className="flex gap-8">
          <NavLinkDesktop icon={<Home size={28} />} page={"/feed"} label="Inicio" active />
          <NavLinkDesktop
            icon={<Search size={24} />}
            page={"/explorer"}
            label="Explorar"
          />
          <NavLinkDesktop
            icon={<Heart size={24} />}
            page={"/feed"}
            label="Actividad"
            a
          />{" "}
          {/* Active aquí */}
          <NavLinkDesktop
            icon={<User size={24} />}
            page={"/profile/me"}
            label="Perfil"
          />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 px-4">
        {/* COLUMNA IZQUIERDA (FEED) - Ocupa 2 columnas en desktop */}
        <div className="md:col-span-2 space-y-6">
          {/* Header móvil (solo visible en móvil) */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-serif">Tu Feed</h1>
          </div>

          {/* Lista de Cards */}
          {activities.map((item) => (
            <div
              key={item.id}
              className="card border-b bg-base-100 border-base-300 md:border md:rounded-2xl md:shadow-sm overflow-hidden"
            >
              {/* Header de la Card */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring ring-base-200 ring-offset-1">
                      <img src={item.avatar} alt={item.user} />
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold leading-none">
                      {item.user}{" "}
                      <span className="font-normal opacity-70">
                        {item.action}
                      </span>
                    </p>
                    <p className="text-xs font-bold mt-0.5 opacity-80">
                      {item.target}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-50">{item.time}</span>
                  <button className="btn btn-ghost btn-circle btn-xs">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Imagen Principal (Hero) */}
              <div className="relative aspect-4/3 bg-base-200 w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-700"
                />
                {/* Etiqueta flotante del item */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                  {item.title}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                  <button className="flex items-center gap-1 group">
                    <Heart
                      size={24}
                      className="group-hover:text-red-500 transition-colors"
                    />
                  </button>
                </div>
              </div>

              {/* Footer de Acciones */}
              <div className="p-4 ">
                <div className="text-sm font-semibold opacity-50">
                  {item.likes} me gusta
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Otros perfiles*/}
        <div className="hidden md:block col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-base-200/50 rounded-2xl p-5">
              <h3 className="font-bold font-serif text-lg mb-4 text-primary">
                Tribers Sugeridos
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <MiniUserCard key={i} i={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 px-6 py-3 md:hidden z-50">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          <NavLinkMobile icon={<Home size={24} />} active page={"feed"}/> {/* Active aquí */}
          <NavLinkMobile icon={<Search size={24} />} page={"/explorer"} />
          <NavLinkMobile icon={<Heart size={24} />} page={"/feed"} />
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
    </div>
  );
};

export default Feed;
