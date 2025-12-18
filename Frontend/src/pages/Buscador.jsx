import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  UserPlus,
  Check,
  ChevronRight,
  Home,
  Heart,
  User,
} from "lucide-react";
import NavMobile from "../components/NavMobile";  
import NavDesktop from "../components/NavDesktop";
const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas"); // 'cuentas' | 'colecciones'

  // --- DATOS SIMULADOS ---

  // Resultados de USUARIOS (Formato Lista)
  const users = [
    {
      id: 1,
      name: "Ana Analog",
      handle: "@ana_films",
      bio: "Cineasta & 35mm",
      isFollowing: false,
      img: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: 2,
      name: "Retro Dave",
      handle: "@dave_collects",
      bio: "Vinilos y Consolas",
      isFollowing: true,
      img: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: 3,
      name: "Sofia Books",
      handle: "@sofia_reads",
      bio: "Bibliófila empedernida",
      isFollowing: false,
      img: "https://i.pravatar.cc/150?u=3",
    },
    {
      id: 4,
      name: "Minimalist",
      handle: "@mini_arch",
      bio: "Less is more",
      isFollowing: false,
      img: "https://i.pravatar.cc/150?u=4",
    },
    {
      id: 5,
      name: "Techno Vibes",
      handle: "@tech_music",
      bio: "Solo vinilos electrónicos",
      isFollowing: false,
      img: "https://i.pravatar.cc/150?u=5",
    },
  ];

  // Resultados de COLECCIONES (Formato Card con Info)
  const collections = [
    {
      id: 1,
      title: "Star Wars Vintage",
      items: 42,
      author: "@luke_sky",
      cover: "https://picsum.photos/400?random=1",
    },
    {
      id: 2,
      title: "Cámaras Leica",
      items: 12,
      author: "@ana_films",
      cover: "https://picsum.photos/400?random=2",
    },
    {
      id: 3,
      title: "Libros de Terror",
      items: 156,
      author: "@stephen_fan",
      cover: "https://picsum.photos/400?random=3",
    },
    {
      id: 4,
      title: "Carteles Bauhaus",
      items: 23,
      author: "@design_daily",
      cover: "https://picsum.photos/400?random=4",
    },
    {
      id: 5,
      title: "Sneakers 90s",
      items: 89,
      author: "@jordan_head",
      cover: "https://picsum.photos/400?random=5",
    },
  ];

  // Función simple para filtrar (simulada)
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.handle.includes(query.toLowerCase())
  );
  const filteredCollections = collections.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-10 font-sans text-base-content">
      <NavDesktop />
      <div className="sticky top-0 md:top-20 z-40 pt-4 pb-0 shadow-sm border-b border-base-200">
        <div className="max-w-2xl mx-auto px-4 md:px-0">
          {/* Input de Búsqueda */}
          <div className="relative mb-4 border-base-100 shadow-amber-100/50">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              size={20}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar personas o colecciones..."
              className="input input-lg w-full bg-base-200/50 border-b border-white rounded-2xl pl-11 pr-10 focus:ring-2 ring-primary/50 focus:outline-none placeholder:text-base-content/40"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-circle btn-xs btn-ghost"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Tabs de Selección */}
          <div className="flex w-full border-b border-base-200">
            <button
              onClick={() => setActiveTab("cuentas")}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "cuentas"
                  ? "border-base-content text-base-content"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              Cuentas
            </button>
            <button
              onClick={() => setActiveTab("colecciones")}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "colecciones"
                  ? "border-base-content text-base-content"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              Colecciones
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-0 pt-4">
        {activeTab === "cuentas" && (
          <div className="flex flex-col gap-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-base-200/50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-14 h-14 rounded-full border border-base-300">
                        <img src={user.img} alt={user.name} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-none">
                        {user.name}
                      </h3>
                      <p className="text-sm opacity-60 mt-1">{user.handle}</p>
                      <p className="text-xs opacity-50 mt-1 truncate max-w-[200px]">
                        {user.bio}
                      </p>
                    </div>
                  </div>

                  {/* Botón Seguir */}
                  {user.isFollowing ? (
                    <button className="btn btn-sm btn-ghost border border-base-300 px-4 text-xs font-bold bg-base-200">
                      Siguiendo
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-primary px-4 text-xs font-bold gap-2">
                      <UserPlus size={16} /> Seguir
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-50">
                No se encontraron usuarios
              </div>
            )}
          </div>
        )}

        {activeTab === "colecciones" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCollections.length > 0 ? (
              filteredCollections.map((col) => (
                <div
                  key={col.id}
                  className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
                >
                  <div className="flex gap-3 p-3">
                    {/* Mini Cover */}
                    <div className="w-20 h-20 rounded-lg bg-base-200 overflow-hidden flex-shrink-0">
                      <img
                        src={col.cover}
                        alt="cover"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    {/* Info */}
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h3 className="font-bold font-serif text-lg truncate leading-tight">
                        {col.title}
                      </h3>
                      <p className="text-xs opacity-50 mt-1">
                        {col.items} elementos
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 overflow-hidden">
                          <img
                            src={`https://i.pravatar.cc/100?u=${col.id}`}
                            alt="creator"
                          />
                        </div>
                        <span className="text-xs font-medium opacity-70">
                          {col.author}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-base-content/20">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 opacity-50">
                No se encontraron colecciones
              </div>
            )}
          </div>
        )}
      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;
