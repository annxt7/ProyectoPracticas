import React, { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon } from "lucide-react"; 
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

  // 1. OBTENER SEGUIDOS (Normalización de IDs)
  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      // Tu SQL usa following_id, pero el JSON puede variar. Mapeamos todas las opciones.
      const ids = res.data.map(f => Number(f.following_id || f.followed_id || f.user_id || f.id));
      setFollowingIds(ids);
    } catch (e) { console.error("Error al cargar seguidos:", e); }
  }, [user?.id]);

  useEffect(() => { fetchMyFollowing(); }, [fetchMyFollowing]);

  // 2. BÚSQUEDA Y FILTRADO (Mapeo de nombres flexible)
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const myId = Number(user.id);

        // --- NORMALIZAR USUARIOS ---
        const cleanUsers = (res.data.users || []).map(u => ({
          id: Number(u.user_id || u.id || u.id_usuario),
          username: u.username || u.name || u.nombre || "Usuario",
          avatar: u.avatar_url || u.avatar || u.img
        })).filter(u => u.id !== myId);

        // --- NORMALIZAR COLECCIONES ---
        const cleanCollections = (res.data.collections || []).map(c => ({
          id: Number(c.collection_id || c.id || c.id_coleccion),
          creatorId: Number(c.user_id || c.creator_id || c.userId || c.id_usuario),
          title: c.collection_name || c.title || c.nombre || "Sin título",
          cover: c.cover_url || c.cover || c.imagen,
          author: c.creator_username || c.username || c.nombre_usuario || "USUARIO"
        })).filter(c => c.creatorId !== myId); // <--- Filtro para no ver tus colecciones

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

  // 3. ACCIÓN DE SEGUIR (Usando IDs numéricos)
  const handleFollowToggle = async (targetId, isFollowing) => {
    const id = Number(targetId);
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${id}`);
        setFollowingIds(prev => prev.filter(fid => fid !== id));
      } else {
        await api.post(`/users/follow/${id}`);
        setFollowingIds(prev => [...prev, id]);
      }
    } catch (error) { console.error("Error toggle follow:", error); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-[#0f111a] text-white">
      <NavDesktop />
      
      {/* HEADER DE BÚSQUEDA */}
      <div className="sticky top-0 md:top-16 z-40 bg-[#0f111a]/95 backdrop-blur-md p-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <input
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 focus:outline-none focus:border-primary/50 text-sm"
            />
          </div>
          <div className="flex justify-center gap-10 mt-4 border-b border-white/5 text-xs font-bold uppercase tracking-widest">
            <button 
              onClick={() => setActiveTab("cuentas")} 
              className={`pb-3 transition-all ${activeTab === "cuentas" ? "text-primary border-b-2 border-primary" : "opacity-40"}`}
            >
              Cuentas
            </button>
            <button 
              onClick={() => setActiveTab("colecciones")} 
              className={`pb-3 transition-all ${activeTab === "colecciones" ? "text-primary border-b-2 border-primary" : "opacity-40"}`}
            >
              Colecciones
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 mt-4">
        {loading && <div className="text-center py-10 opacity-20 animate-pulse">Buscando...</div>}

        {/* RENDER DE CUENTAS */}
        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => {
              const isFollowing = followingIds.includes(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/10">
                      {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-primary">{u.username[0]}</span>}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{u.username}</p>
                      <p className="text-[10px] opacity-40">@{String(u.username).toLowerCase().replace(/\s/g, '')}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleFollowToggle(u.id, isFollowing)}
                    className={`btn btn-xs px-4 rounded-lg font-bold transition-all ${isFollowing ? "btn-neutral opacity-50" : "btn-primary"}`}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* RENDER DE COLECCIONES */}
        {activeTab === "colecciones" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`} className="group flex flex-col gap-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5 shadow-lg">
                  <ItemCover src={col.cover} title={col.title} className="w-full h-full object-cover" />
                </div>
                <div className="px-1">
                  <h3 className="font-bold text-[13px] truncate leading-tight">{col.title}</h3>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-tight">@{col.author}</p>
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