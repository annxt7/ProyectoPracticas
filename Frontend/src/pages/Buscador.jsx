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

  // 1. CARGAR SEGUIDOS (Usando following_id de tu SQL)
  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      // Mapeamos siguiendo tu estructura de tabla Follows
      const ids = res.data.map(f => Number(f.following_id));
      setFollowingIds(ids);
    } catch (e) { console.error("Error seguidos:", e); }
  }, [user?.id]);

  useEffect(() => { fetchMyFollowing(); }, [fetchMyFollowing]);

  // 2. BUSCADOR CON FILTRADO BASADO EN COLLECTIONPAGE
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const myId = String(user.id);

        // --- USUARIOS ---
        const cleanUsers = (res.data.users || []).map(u => ({
          id: u.user_id || u.id,
          username: u.username,
          avatar: u.avatar_url
        })).filter(u => String(u.id) !== myId);

        // --- COLECCIONES (Usando creator_id como en tu archivo) ---
        const cleanCollections = (res.data.collections || []).map(c => ({
          id: c.collection_id || c.id,
          creatorId: c.creator_id || c.user_id, // Aquí estaba el fallo
          title: c.collection_name || c.title,
          cover: c.cover_url,
          creatorName: c.creator_username || c.username
        })).filter(c => String(c.creatorId) !== myId); // FILTRO DEFINITIVO

        setUsers(cleanUsers);
        setCollections(cleanCollections);
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
    const numericId = Number(targetId);
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${numericId}`);
        setFollowingIds(prev => prev.filter(id => id !== numericId));
      } else {
        await api.post(`/users/follow/${numericId}`);
        setFollowingIds(prev => [...prev, numericId]);
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-base-100 text-white font-sans">
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
        {loading && <div className="text-center py-10 opacity-20 italic font-serif">Buscando en la biblioteca...</div>}

        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => {
              const isFollowing = followingIds.includes(Number(u.id));
              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
                    <img 
                      src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                      className="w-12 h-12 rounded-full object-cover bg-base-300" alt="" 
                    />
                    <div>
                      <p className="font-bold text-sm">{u.username}</p>
                      <p className="text-[10px] opacity-40">@{String(u.username).toLowerCase()}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleFollowToggle(u.id, isFollowing)}
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
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`} className="group">
                <div className="bg-white/[0.03] rounded-3xl overflow-hidden border border-white/5 group-hover:border-primary/50 transition-all shadow-xl">
                  <div className="aspect-video">
                    <ItemCover src={col.cover} title={col.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white truncate font-serif text-lg">{col.title}</h3>
                    <p className="text-[10px] text-primary mt-1 font-bold uppercase tracking-widest">por {col.creatorName}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <NavMobile />
    </div>
  );
};

export default Explorer;