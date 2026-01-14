import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Sparkles, Search as SearchIcon } from "lucide-react"; 
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { Link } from "react-router-dom";
import ItemCover from "../components/ItemCover";
import api from "../services/api"; 
import { useAuth } from "../context/AuthContext";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");
  const [usersWithoutMyself, setUsersWithoutMyself] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const { user } = useAuth();

  // 1. Cargar lista de seguidos (Normalizando a Números)
  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      // Guardamos como números para evitar errores de comparación (String vs Int)
      setFollowingIds(res.data.map(u => Number(u.user_id || u.id)));
    } catch (e) { console.error("Error al cargar seguidos:", e); }
  }, [user?.id]);

  useEffect(() => {
    fetchMyFollowing();
  }, [fetchMyFollowing]);

  // 2. Lógica Follow Toggle Corregida
  const handleFollowToggle = async (targetId, isFollowing) => {
    const numericId = Number(targetId);
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${numericId}`);
        setFollowingIds(prev => prev.filter(id => id !== numericId));
      } else {
        await api.post(`/users/follow/${numericId}`);
        setFollowingIds(prev => [...prev, numericId]);
      }
    } catch (error) { 
      console.error("Error en el toggle de follow:", error); 
      // Si falla, refrescamos de la DB para sincronizar
      fetchMyFollowing();
    }
  };

  // 3. Búsqueda y Filtro de Seguridad
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const data = res.data;
        
        const myId = Number(user.id);

        // Filtrar usuarios: quitarme a mí mismo y asegurar que existan datos
        const filteredUsers = (data.users || []).filter(u => Number(u.id || u.user_id) !== myId);

        // Filtrar colecciones: quitar las mías
        const filteredCollections = (data.collections || []).filter((col) => {
          return Number(col.user_id || col.userId) !== myId;
        });

        setUsersWithoutMyself(filteredUsers);
        setCollections(filteredCollections);
      } catch (err) { 
        console.error("Error en búsqueda:", err); 
      } finally { 
        setLoading(false); 
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user]);

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 focus:ring-2 ring-primary/50 focus:outline-none text-white transition-all h-12"
            />
          </div>

          <div className="flex justify-center gap-8 border-b border-white/5">
            {["cuentas", "colecciones"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize transition-all relative ${
                  activeTab === tab ? "text-primary" : "text-white/40"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-8">
        
        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={14} /> Tendencias
            </h4>
            <div className="space-y-4 opacity-40 text-xs italic font-light">
              Explorando la red...
            </div>
          </div>
        </aside>

        <main className="w-full max-w-3xl mx-auto">
          {loading && (
            <div className="flex justify-center py-10">
              <span className="loading loading-dots loading-md text-primary/40"></span>
            </div>
          )}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersWithoutMyself.map((u) => {
                const isFollowing = followingIds.includes(Number(u.id || u.user_id));
                const username = u.username || u.name || 'usuario';
                const displayName = u.name || u.username || 'Usuario';
                
                return (
                  <div key={u.id || u.user_id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                    <Link to={`/profile/${u.id || u.user_id}`} className="flex items-center gap-3 min-w-0">
                      <img 
                        src={u.avatar_url || u.img || `https://ui-avatars.com/api/?name=${displayName}&background=random`} 
                        className="w-10 h-10 rounded-full object-cover border border-white/5" 
                        alt={displayName} 
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-[13px] text-white truncate">{displayName}</h3>
                        <p className="text-[10px] opacity-40">@{username.toLowerCase()}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => handleFollowToggle(u.id || u.user_id, isFollowing)}
                      className={`btn btn-xs rounded-lg px-4 font-bold transition-all ${
                        isFollowing 
                        ? "bg-white/10 text-white border-transparent hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50" 
                        : "btn-primary"
                      }`}
                    >
                      {isFollowing ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>
                );
              })}
              {!loading && usersWithoutMyself.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-20 italic text-sm">No se encontraron cuentas</div>
              )}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {collections.map((col) => (
                <Link key={col.collection_id || col.id} to={`/collection/${col.collection_id || col.id}`} className="block group">
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all shadow-xl">
                    <div className="aspect-video overflow-hidden">
                      <ItemCover src={col.cover_url || col.cover} title={col.collection_name || col.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-md truncate group-hover:text-primary transition-colors">
                        {col.collection_name || col.title}
                      </h3>
                      <p className="text-[10px] text-primary/60 mt-1">@{col.author || col.creator_username || 'autor'}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {!loading && collections.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-20 italic text-sm">No hay colecciones para mostrar</div>
              )}
            </div>
          )}
        </main>

        <aside className="hidden lg:block">
           <div className="sticky top-48">
              <div className="p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent">
                 <Sparkles className="text-primary/40 mb-3" size={18} />
                 <h5 className="text-[10px] font-bold uppercase tracking-widest opacity-40">Tip</h5>
                 <p className="text-[11px] opacity-30 mt-2 leading-relaxed">
                   Sigue a usuarios con tus mismos gustos para ver sus actualizaciones en tu feed.
                 </p>
              </div>
           </div>
        </aside>

      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;