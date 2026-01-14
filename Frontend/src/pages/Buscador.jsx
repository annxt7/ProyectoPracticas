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

  // 1. Cargar lista de seguidos (Normalización a números)
  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      // Buscamos el ID en cualquier propiedad posible que devuelva tu endpoint de seguidos
      const ids = res.data.map(u => Number(u.user_id || u.id || u.following_id));
      setFollowingIds(ids);
    } catch (e) { console.error("Error al cargar seguidos:", e); }
  }, [user?.id]);

  useEffect(() => {
    fetchMyFollowing();
  }, [fetchMyFollowing]);

  // 2. Búsqueda y Filtrado Estricto
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const rawUsers = res.data.users || [];
        const rawCollections = res.data.collections || [];
        
        const myId = Number(user.id);

        // NORMALIZAR Y FILTRAR USUARIOS
        const filteredUsers = rawUsers
          .map(u => ({
            ...u,
            finalId: Number(u.user_id || u.id),
            finalName: u.username || u.name || "Usuario",
            finalAvatar: u.avatar_url || u.avatar || u.img
          }))
          .filter(u => u.finalId !== myId);

        // NORMALIZAR Y FILTRAR COLECCIONES
        const filteredCollections = rawCollections
          .map(c => ({
            ...c,
            finalId: Number(c.collection_id || c.id),
            finalCreatorId: Number(c.user_id || c.userId || c.creator_id),
            finalTitle: c.collection_name || c.title,
            finalCover: c.cover_url || c.cover,
            finalAuthor: c.creator_username || c.username || c.author || "usuario"
          }))
          .filter(c => c.finalCreatorId !== myId); // EXCLUSIÓN DE MIS COLECCIONES

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
  }, [query, user?.id]);

  // 3. Manejo del Follow (Usando la ID normalizada)
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
      console.error("Error en follow:", error);
    }
  };

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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-white h-12 focus:outline-none"
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
           <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold"><TrendingUp size={14} className="inline mr-2"/> Tendencias</h4>
        </aside>

        <main className="w-full max-w-3xl mx-auto">
          {loading && <div className="flex justify-center py-10"><span className="loading loading-dots text-primary"></span></div>}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersWithoutMyself.map((u) => {
                const isFollowing = followingIds.includes(u.finalId);
                return (
                  <div key={u.finalId} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <Link to={`/profile/${u.finalId}`} className="flex items-center gap-3 min-w-0">
                      <img 
                        src={u.finalAvatar || `https://ui-avatars.com/api/?name=${u.finalName}&background=random`} 
                        className="w-10 h-10 rounded-full object-cover border border-white/10" 
                        alt="" 
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-[13px] text-white truncate">{u.finalName}</h3>
                        <p className="text-[10px] opacity-40">@{u.finalName.toLowerCase()}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => handleFollowToggle(u.finalId, isFollowing)}
                      className={`btn btn-xs px-4 rounded-lg font-bold transition-all ${isFollowing ? "btn-neutral opacity-60" : "btn-primary"}`}
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
              {collections.map((col) => (
                <Link key={col.finalId} to={`/collection/${col.finalId}`} className="block group">
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all">
                    <div className="aspect-video overflow-hidden">
                      <ItemCover src={col.finalCover} title={col.finalTitle} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-md truncate">{col.finalTitle}</h3>
                      <p className="text-[10px] text-primary/60 mt-1">@{col.finalAuthor.toLowerCase()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;