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

  // 1. Obtener quiénes seguimos (Normalizado)
  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      const ids = res.data.map(u => Number(u.user_id || u.id || u.following_id || u.id_user));
      setFollowingIds(ids);
    } catch (e) { console.error("Error seguidos:", e); }
  }, [user?.id]);

  useEffect(() => { fetchMyFollowing(); }, [fetchMyFollowing]);

  // 2. BUSCADOR CON NORMALIZACIÓN
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const myId = Number(user.id);

        // --- NORMALIZAR USUARIOS ---
        const cleanUsers = (res.data.users || [])
          .map(u => ({
            id: Number(u.user_id || u.id || u.id_user || u.id_usuario),
            name: u.username || u.name || u.nombre || "Usuario",
            avatar: u.avatar_url || u.avatar || u.img || u.foto || ""
          }))
          .filter(u => u.id !== myId); // No apareces tú

        // --- NORMALIZAR COLECCIONES ---
        const cleanCollections = (res.data.collections || [])
          .map(c => ({
            id: Number(c.collection_id || c.id || c.id_coleccion),
            creatorId: Number(c.user_id || c.userId || c.creator_id || c.id_usuario || c.id_user),
            title: c.collection_name || c.title || c.nombre || "Sin título",
            cover: c.cover_url || c.cover || c.imagen || c.img,
            author: c.creator_username || c.username || c.author || c.nombre_usuario || "usuario"
          }))
          .filter(c => c.creatorId !== myId); // No aparecen las tuyas

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
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${targetId}`);
        setFollowingIds(prev => prev.filter(id => id !== targetId));
      } else {
        await api.post(`/users/follow/${targetId}`);
        setFollowingIds(prev => [...prev, targetId]);
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-base-100 text-white">
      <NavDesktop />
      
      {/* Buscador */}
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/90 backdrop-blur-md p-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex justify-center gap-10 mt-4 font-bold text-sm">
            <button onClick={() => setActiveTab("cuentas")} className={activeTab === "cuentas" ? "text-primary border-b-2 border-primary pb-2" : "opacity-40"}>Cuentas</button>
            <button onClick={() => setActiveTab("colecciones")} className={activeTab === "colecciones" ? "text-primary border-b-2 border-primary pb-2" : "opacity-40"}>Colecciones</button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 mt-4">
        {loading && <div className="text-center opacity-20">Cargando...</div>}

        {/* Render Cuentas */}
        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="w-12 h-12 rounded-full object-cover bg-white/10" alt="" />
                  <div>
                    <p className="font-bold text-sm">{u.name}</p>
                    <p className="text-[10px] opacity-40">@{u.name.toLowerCase().replace(/\s/g, '')}</p>
                  </div>
                </Link>
                <button 
                  onClick={() => handleFollowToggle(u.id, followingIds.includes(u.id))}
                  className={`btn btn-xs px-4 rounded-lg ${followingIds.includes(u.id) ? "btn-neutral opacity-50" : "btn-primary"}`}
                >
                  {followingIds.includes(u.id) ? "Siguiendo" : "Seguir"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Render Colecciones */}
        {activeTab === "colecciones" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`} className="group">
                <div className="bg-white/[0.03] rounded-3xl overflow-hidden border border-white/5 group-hover:border-primary/50 transition-all">
                  <div className="aspect-video">
                    <ItemCover src={col.cover} title={col.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold truncate">{col.title}</h3>
                    <p className="text-[10px] text-primary mt-1">@{col.author}</p>
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