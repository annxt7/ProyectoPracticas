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

  // 1. Cargar lista de seguidos
  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      // Mapeamos buscando cualquier variante de ID que devuelva tu DB
      const ids = res.data.map(u => Number(u.user_id || u.id || u.following_id));
      setFollowingIds(ids);
    } catch (e) { console.error("Error seguidos:", e); }
  }, [user?.id]);

  useEffect(() => {
    fetchMyFollowing();
  }, [fetchMyFollowing]);

  // 2. Búsqueda y FILTRADO REAL
  useEffect(() => {
    // Si no hay usuario en el context, no podemos filtrar "mis cosas"
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const { users = [], collections = [] } = res.data;
        
        const myId = Number(user.id);

        // FILTRO USUARIOS: Mapeo agresivo de IDs para no aparecer yo
        const filteredUsers = users.filter(u => {
          const uId = Number(u.user_id || u.id || u.id_user);
          return uId !== myId;
        });

        // FILTRO COLECCIONES: Mapeo agresivo para quitar las mías
        const filteredCollections = collections.filter(col => {
          const creatorId = Number(col.user_id || col.userId || col.creator_id || col.id_user);
          return creatorId !== myId;
        });

        setUsersWithoutMyself(filteredUsers);
        setCollections(filteredCollections);
      } catch (err) { 
        console.error("Error search:", err); 
      } finally { 
        setLoading(false); 
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user?.id]);

  const handleFollowToggle = async (targetId, isFollowing) => {
    const numericTargetId = Number(targetId);
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${numericTargetId}`);
        setFollowingIds(prev => prev.filter(id => id !== numericTargetId));
      } else {
        await api.post(`/users/follow/${numericTargetId}`);
        setFollowingIds(prev => [...prev, numericTargetId]);
      }
    } catch (error) { console.error("Error follow:", error); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* Header Buscador */}
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-white h-12 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex justify-center gap-8 border-b border-white/5">
            {["cuentas", "colecciones"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize relative ${activeTab === tab ? "text-primary" : "text-white/40"}`}
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
           <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold flex items-center gap-2">
            <TrendingUp size={14} /> Tendencias
          </h4>
        </aside>

        <main className="w-full max-w-3xl mx-auto">
          {loading && <div className="flex justify-center py-10"><span className="loading loading-dots text-primary"></span></div>}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersWithoutMyself.map((u) => {
                const uId = Number(u.user_id || u.id);
                const isFollowing = followingIds.includes(uId);
                
                // MAPEO DE IMAGEN: Buscamos en todas las propiedades posibles
                const avatar = u.avatar_url || u.avatar || u.img || u.profile_image;
                const displayName = u.username || u.name || "Usuario";

                return (
                  <div key={uId} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <Link to={`/profile/${uId}`} className="flex items-center gap-3 min-w-0">
                      <img 
                        src={avatar || `https://ui-avatars.com/api/?name=${displayName}&background=random`} 
                        className="w-10 h-10 rounded-full object-cover border border-white/10" 
                        alt={displayName} 
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${displayName}&background=random` }}
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-[13px] text-white truncate">{displayName}</h3>
                        <p className="text-[10px] opacity-40">@{displayName.toLowerCase()}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => handleFollowToggle(uId, isFollowing)}
                      className={`btn btn-xs px-4 rounded-lg font-bold ${isFollowing ? "btn-neutral opacity-50" : "btn-primary"}`}
                    >
                      {isFollowing ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {collections.map((col) => {
                const colId = col.collection_id || col.id;
                const author = col.username || col.creator_username || col.author || "usuario";
                const cover = col.cover_url || col.cover || col.image;

                return (
                  <Link key={colId} to={`/collection/${colId}`} className="block group">
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all">
                      <div className="aspect-video overflow-hidden">
                        <ItemCover src={cover} title={col.collection_name || col.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white text-md truncate">{col.collection_name || col.title}</h3>
                        <p className="text-[10px] text-primary/60 mt-1">@{author.toLowerCase()}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;