import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Search as SearchIcon } from "lucide-react"; 
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { Link } from "react-router-dom";
import ItemCover from "../components/ItemCover";
import api from "../services/api"; 
import { useAuth } from "../context/AuthContext";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const { user } = useAuth();

  // 1. Cargar quiénes seguimos (Usando following_id como dice tu SQL)
  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      // Ajuste según tu tabla Follows: la columna es following_id
      const ids = res.data.map(f => Number(f.following_id || f.user_id || f.id));
      setFollowingIds(ids);
    } catch (e) { console.error("Error al cargar seguidos:", e); }
  }, [user?.id]);

  useEffect(() => { fetchMyFollowing(); }, [fetchMyFollowing]);

  // 2. Búsqueda y Filtrado (Usando user_id de tu tabla Collections)
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const myId = Number(user.id);

        // --- FILTRAR USUARIOS ---
        const cleanUsers = (res.data.users || [])
          .filter(u => Number(u.user_id || u.id) !== myId);

        // --- FILTRAR COLECCIONES (Crucial: user_id es el dueño) ---
        const cleanCollections = (res.data.collections || [])
          .filter(c => {
            const creatorId = Number(c.user_id || c.creator_id || c.userId);
            return creatorId !== myId;
          });

        setUsers(cleanUsers);
        setCollections(cleanCollections);
      } catch (err) { 
        console.error("Error en búsqueda:", err); 
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
    <div className="min-h-screen pb-24 md:pb-10 bg-base-100 text-white">
      <NavDesktop />
      
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/90 backdrop-blur-md p-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex justify-center gap-10 mt-4 font-bold text-sm">
            <button onClick={() => setActiveTab("cuentas")} className={activeTab === "cuentas" ? "text-primary border-b-2 border-primary pb-2" : "opacity-40"}>Cuentas</button>
            <button onClick={() => setActiveTab("colecciones")} className={activeTab === "colecciones" ? "text-primary border-b-2 border-primary pb-2" : "opacity-40"}>Colecciones</button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 mt-4">
        {loading && <div className="text-center py-10 opacity-40 italic">Buscando...</div>}

        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => {
              const uId = Number(u.user_id || u.id);
              const isFollowing = followingIds.includes(uId);
              return (
                <div key={uId} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <Link to={`/profile/${uId}`} className="flex items-center gap-3">
                    <img 
                      src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username || 'U'}`} 
                      className="w-12 h-12 rounded-full object-cover bg-white/10" 
                      alt="" 
                    />
                    <div>
                      <p className="font-bold text-sm">{u.username || "Usuario"}</p>
                      <p className="text-[10px] opacity-40">@{ (u.username || "user").toLowerCase() }</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleFollowToggle(uId, isFollowing)}
                    className={`btn btn-xs px-4 rounded-lg font-bold transition-all ${isFollowing ? "btn-neutral opacity-50" : "btn-primary"}`}
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
            {collections.map(col => {
              const colId = col.collection_id || col.id;
              return (
                <Link key={colId} to={`/collection/${colId}`} className="group">
                  <div className="bg-white/[0.03] rounded-3xl overflow-hidden border border-white/5 group-hover:border-primary/50 transition-all">
                    <div className="aspect-video">
                      <ItemCover src={col.cover_url || col.cover} title={col.collection_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold truncate">{col.collection_name || col.title}</h3>
                      <p className="text-[10px] text-primary mt-1">@{ (col.username || col.creator_username || "autor").toLowerCase() }</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <NavMobile />
    </div>
  );
};

export default Explorer;