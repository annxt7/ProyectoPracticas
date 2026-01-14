import React, { useState, useEffect } from "react";
import { Search, X, TrendingUp, Hash } from "lucide-center"; // Asegúrate de tener lucide-react
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { Link } from "react-router-dom";
import ItemCover from "../components/ItemCover";
import api from "../services/api"; 
import { useAuth } from "../context/AuthContext";
import { Search as SearchIcon, TrendingUp as TrendingIcon } from "lucide-react";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");
  const [usersWithoutMyself, setUsersWithoutMyself] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const { user } = useAuth();

  // 1. Cargar IDs de personas que ya sigo
  useEffect(() => {
    if (!user?.id) return;

    const fetchMyFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        setFollowingIds(res.data.map(u => u.id));
      } catch (e) {
        console.error("Error cargando mis seguidos", e);
      }
    };

    fetchMyFollowing();
  }, [user?.id]);

  // 2. Lógica de Follow/Unfollow
  const handleFollowToggle = async (targetId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${targetId}`);
        setFollowingIds(prev => prev.filter(id => id !== targetId));
      } else {
        await api.post(`/users/follow/${targetId}`);
        setFollowingIds(prev => [...prev, targetId]);
      }
    } catch (error) {
      console.error("Error follow toggle:", error);
    }
  };

  // 3. Búsqueda con Filtrado de Contenido Propio
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("tribe_token")?.replace(/['"]+/g, "");

        const res = await api.get("/search", {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        // FILTRO: No mostrar mi propio perfil
        const filteredUsers = (data.users || []).filter(
          (u) => String(u.id) !== String(user.id)
        );

        // FILTRO: No mostrar mis propias colecciones
        // Comprobamos user_id o author_id según lo devuelva tu backend
        const filteredCollections = (data.collections || []).filter(
          (col) => String(col.user_id || col.userId) !== String(user.id)
        );

        setUsersWithoutMyself(filteredUsers);
        setCollections(filteredCollections);
      } catch (err) {
        console.error("Error cargando búsqueda:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [query, user?.id]);

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* HEADER BUSCADOR */}
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
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
            {["cuentas", "colecciones"].map((tab) => (
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

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-10">
        {/* ASIDE IZQUIERDO: TENDENCIAS */}
        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-4 flex items-center gap-2">
              <TrendingIcon size={12} /> Tendencias
            </h4>
            <nav className="flex flex-col gap-2">
              {["Música", "Series", "Películas", "Juegos", "Libros"].map((tag) => (
                <button key={tag} className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 hover:text-primary transition-all group">
                  <Hash size={14} className="opacity-20 group-hover:opacity-100" />
                  {tag}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main>
          {loading && (
            <div className="text-center py-4 opacity-50 text-xs italic">Buscando...</div>
          )}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {usersWithoutMyself.length > 0 ? (
                usersWithoutMyself.map((u) => {
                  const isFollowing = followingIds.includes(u.id);
                  return (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                      <Link to={`/profile/${u.id}`} className="flex items-center gap-3 min-w-0">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full ring-2 ring-white/5 bg-white/10">
                            <img 
                                src={u.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff`} 
                                className="w-12 h-12 rounded-full object-cover" 
                                alt={u.name}
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-white truncate">{u.name}</h3>
                          <p className="text-[10px] opacity-40 leading-none">{u.handle || `@${u.name.toLowerCase()}`}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleFollowToggle(u.id, isFollowing)}
                        className={`btn btn-xs rounded-full px-4 ${isFollowing ? "btn-neutral" : "btn-primary"}`}
                      >
                        {isFollowing ? "Siguiendo" : "Seguir"}
                      </button>
                    </div>
                  );
                })
              ) : (
                !loading && <div className="col-span-full text-center py-20 opacity-20 italic">No hay cuentas que coincidan</div>
              )}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {collections.length > 0 ? (
                collections.map((col) => (
                  <Link key={col.id} to={`/collection/${col.id}`} className="block group">
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all shadow-xl">
                      <div className="aspect-video overflow-hidden bg-white/5 relative">
                        <ItemCover src={col.cover} title={col.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-white text-lg truncate group-hover:text-primary transition-colors">
                          {col.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                           <span className="text-xs font-medium text-primary/80">@{col.author || 'usuario'}</span>
                           <span className="text-[10px] opacity-30 uppercase font-bold tracking-widest">{col.type || 'Colección'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                !loading && <div className="col-span-full text-center py-20 opacity-20 italic">No se encontraron colecciones ajenas</div>
              )}
            </div>
          )}
        </main>
      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;