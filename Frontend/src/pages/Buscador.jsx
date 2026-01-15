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

  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      // Intentamos capturar el ID de cualquier forma posible
      const ids = res.data.map(f => Number(f.following_id || f.followed_id || f.user_id || f.id));
      setFollowingIds(ids);
    } catch (e) { console.error("Error seguidos:", e); }
  }, [user?.id]);

  useEffect(() => { fetchMyFollowing(); }, [fetchMyFollowing]);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        
        // --- LOG DE CONTROL: Mira esto en la consola F12 si sigue fallando ---
        console.log("Respuesta del servidor:", res.data);

        const myId = Number(user.id);

        // MAPEO DE USUARIOS: Buscamos todas las variantes de nombres de columnas
        const cleanUsers = (res.data.users || []).map(u => ({
          id: Number(u.user_id || u.id || u.id_usuario),
          name: u.username || u.nombre || u.name || "Usuario",
          avatar: u.avatar_url || u.avatar || u.img || ""
        })).filter(u => u.id !== myId);

        // MAPEO DE COLECCIONES: Buscamos todas las variantes
        const cleanCollections = (res.data.collections || []).map(c => ({
          id: Number(c.collection_id || c.id || c.id_coleccion),
          creatorId: Number(c.user_id || c.creator_id || c.userId || c.id_usuario),
          title: c.collection_name || c.title || c.nombre || "Sin título",
          cover: c.cover_url || c.cover || c.imagen,
          author: c.creator_username || c.username || c.nombre_usuario || "usuario"
        })).filter(c => c.creatorId !== myId);

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
    const id = Number(targetId);
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${id}`);
        setFollowingIds(prev => prev.filter(fid => fid !== id));
      } else {
        await api.post(`/users/follow/${id}`);
        setFollowingIds(prev => [...prev, id]);
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-[#0f111a] text-white">
      <NavDesktop />
      
      <div className="sticky top-0 md:top-16 z-40 bg-[#0f111a]/90 backdrop-blur-md p-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 focus:outline-none"
            />
          </div>
          <div className="flex justify-center gap-10 mt-4">
            <button onClick={() => setActiveTab("cuentas")} className={`pb-2 text-sm font-bold ${activeTab === "cuentas" ? "text-primary border-b-2 border-primary" : "opacity-40"}`}>Cuentas</button>
            <button onClick={() => setActiveTab("colecciones")} className={`pb-2 text-sm font-bold ${activeTab === "colecciones" ? "text-primary border-b-2 border-primary" : "opacity-40"}`}>Colecciones</button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 mt-4">
        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => {
              const isFollowing = followingIds.includes(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/10">
                      {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-primary">{u.name[0]}</span>}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{u.name}</p>
                      <p className="text-[10px] opacity-40">@{u.name.toLowerCase().replace(/\s/g, '')}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleFollowToggle(u.id, isFollowing)}
                    className={`btn btn-xs px-4 rounded-lg ${isFollowing ? "btn-neutral" : "btn-primary"}`}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "colecciones" && (
          <div className="grid grid-cols-2 gap-4">
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                <ItemCover src={col.cover} title={col.title} className="aspect-video object-cover" />
                <div className="p-3">
                  <h3 className="font-bold text-xs truncate">{col.title}</h3>
                  <p className="text-[9px] text-primary">por {col.author}</p>
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