import React, { useState } from "react";
import {
  Search,
  X,
  UserPlus,
  ChevronRight,
  TrendingUp,
  Hash,
  Sparkles
} from "lucide-react";
import NavMobile from "../components/NavMobile";  
import NavDesktop from "../components/NavDesktop";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");

  // --- DATOS SIMULADOS (Mantengo tus arrays originales) ---
  const users = [
    { id: 1, name: "Ana Analog", handle: "@ana_films", bio: "Cineasta & 35mm", isFollowing: false, img: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "Retro Dave", handle: "@dave_collects", bio: "Vinilos y Consolas", isFollowing: true, img: "https://i.pravatar.cc/150?u=2" },
    { id: 3, name: "Sofia Books", handle: "@sofia_reads", bio: "Bibliófila empedernida", isFollowing: false, img: "https://i.pravatar.cc/150?u=3" },
    { id: 4, name: "Minimalist", handle: "@mini_arch", bio: "Less is more", isFollowing: false, img: "https://i.pravatar.cc/150?u=4" },
    { id: 5, name: "Techno Vibes", handle: "@tech_music", bio: "Solo vinilos electrónicos", isFollowing: false, img: "https://i.pravatar.cc/150?u=5" },
    { id: 6, name: "Bruja Lola", handle: "@bruja_lola", bio: "Magia potagia", isFollowing: false, img: "https://www.impulsivos.es/images/productos/100489.jpg" },
  ];

  const collections = [
    { id: 1, title: "Star Wars Vintage", items: 42, author: "@luke_sky", cover: "https://picsum.photos/400?random=1" },
    { id: 2, title: "Cámaras Leica", items: 12, author: "@ana_films", cover: "https://picsum.photos/400?random=2" },
    { id: 3, title: "Libros de Terror", items: 156, author: "@stephen_fan", cover: "https://picsum.photos/400?random=3" },
    { id: 4, title: "Carteles Bauhaus", items: 23, author: "@design_daily", cover: "https://picsum.photos/400?random=4" },
    { id: 5, title: "Sneakers 90s", items: 89, author: "@jordan_head", cover: "https://picsum.photos/400?random=5" },
    { id: 6, title: "Vinilos 80s", items: 123, author: "@vinilos_80s", cover: "https://picsum.photos/400?random=6" },
  ];

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.handle.includes(query.toLowerCase()));
  const filteredCollections = collections.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* HEADER DE BÚSQUEDA (Centrado y Sticky) */}
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 focus:ring-2 ring-primary/50 focus:outline-none text-white transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex justify-center gap-8 border-b border-white/5">
            {['cuentas', 'colecciones'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize transition-all relative ${
                  activeTab === tab ? "text-primary" : "text-white/40 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LAYOUT DE TRES COLUMNAS */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-10">
        
        {/* IZQUIERDA: CATEGORÍAS / TRENDS */}
        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={12} /> Tendencias
              </h4>
              <nav className="flex flex-col gap-2">
                {['Música', 'Series', 'Películas', 'Juegos', 'Libros'].map(tag => (
                  <button key={tag} className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 hover:text-primary transition-all group">
                    <Hash size={14} className="opacity-20 group-hover:opacity-100" /> {tag}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* CENTRO: RESULTADOS (Grid de 2 columnas para Cuentas) */}
        <main>
          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full ring-2 ring-white/5">
                          <img src={user.img} alt={user.name} />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-white truncate">{user.name}</h3>
                        <p className="text-[10px] opacity-40 leading-none">{user.handle}</p>
                        <p className="text-xs opacity-60 mt-2 truncate max-w-[140px] italic">"{user.bio}"</p>
                      </div>
                    </div>
                    <button className={`btn btn-xs rounded-full px-4 ${user.isFollowing ? 'btn-ghost border-white/10' : 'btn-primary'}`}>
                      {user.isFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 opacity-20 italic">No se encontraron resultados</div>
              )}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCollections.map((col) => (
                <div key={col.id} className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="aspect-video overflow-hidden">
                    <img src={col.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-lg">{col.title}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] opacity-40 uppercase tracking-widest">{col.items} objetos</span>
                      <span className="text-xs font-medium text-primary">{col.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* DERECHA: SUGERENCIAS */}
        <aside className="hidden lg:block">
          <div className="sticky top-48">
            <div className="p-6 rounded-[2rem] bg-gradient-to-b from-primary/10 to-transparent border border-primary/10">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2 text-primary">
                <Sparkles size={12} /> Recomendado
              </h4>
              <p className="text-xs opacity-60 mb-6 leading-relaxed">Basado en tus colecciones de vinilos y cine.</p>
              <div className="space-y-4">
                {/* Aquí podrías mapear mini-colecciones o perfiles pro */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Colección: Jazz 50s</p>
                    <p className="text-[10px] opacity-40">Por @blue_note</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;