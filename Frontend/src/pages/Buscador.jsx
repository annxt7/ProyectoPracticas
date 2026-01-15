import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false); // Ahora sí lo usaremos en el render
  const [followingIds, setFollowingIds] = useState([]);

  const { user } = useAuth();

  // 1. CARGAR SEGUIDOS: Normalización absoluta
  useEffect(() => {
    if (!user?.id) return;
    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        // Forzamos Number para que el .includes() funcione siempre
        const ids = res.data.map(f => Number(f.following_id || f.id || f.user_id));
        setFollowingIds(ids);
      } catch (err) { console.error("Error seguidos:", err); }
    };
    fetchFollowing();
  }, [user?.id]);

  // 2. BUSCADOR: Limpieza de nombres y filtrado
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = window.location.hostname === "localhost" 
          ? "http://localhost:3000" 
          : "https://axel.informaticamajada.es";
        
        const token = localStorage.getItem("tribe_token")?.replace(/['"]+/g, "");
        const res = await fetch(`${baseUrl}/api/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const myId = Number(user.id);

        // MAPEO USUARIOS (Quitamos @ extra)
        const cleanUsers = (data.users || []).map(u => {
          const rawUsername = u.username || u.name || "usuario";
          return {
            id: Number(u.id || u.user_id),
            name: u.name || rawUsername.replace(/^@/, ''), 
            username: rawUsername.replace(/^@/, '').toLowerCase(),
            img: u.img || u.avatar_url
          };
        }).filter(u => u.id !== myId);

        // MAPEO COLECCIONES 
        const cleanCollections = (data.collections || []).map(c => {
          const rawAuthor = c.author || c.username || "usuario";
          return {
            id: Number(c.id || c.collection_id),
            creatorId: Number(c.creator_id || c.user_id),
            title: c.title || c.collection_name,
            cover: c.cover || c.cover_url,
            author: rawAuthor.replace(/^@/, '') 
          };
        }).filter(c => c.creatorId !== myId);

        setUsers(cleanUsers);
        setCollections(cleanCollections);
      } catch (err) { console.error("Search error:", err); }
      finally { setLoading(false); }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user?.id]);

  // 3. SEGUIR / DEJAR DE SEGUIR
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
    } catch (err) { console.error("Follow toggle error:", err); }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#0a0a0a] text-white font-sans">
      <NavDesktop />
      
      {/* HEADER BUSCADOR */}
      <div className="sticky top-0 md:top-16 z-40 bg-[#0a0a0a]/90 backdrop-blur-md p-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 outline-none focus:border-primary/50"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex justify-center gap-10">
            {["cuentas", "colecciones"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} 
                className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "text-primary border-b-2 border-primary" : "opacity-40"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 mt-6">
        {loading && <div className="text-center py-10 opacity-30 animate-pulse text-xs">Buscando...</div>}

        {/* LISTA USUARIOS */}
        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => {
              const isFollowing = followingIds.includes(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/0.03 rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3 min-w-0">
                    <img src={u.img || `https://ui-avatars.com/api/?name=${u.name}&background=random`} className="w-12 h-12 rounded-full object-cover" alt="" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{u.name}</p>
                      <p className="text-[10px] opacity-40 uppercase">@{u.username}</p>
                    </div>
                  </Link>
                  <button onClick={() => handleFollowToggle(u.id, isFollowing)}
                    className={`btn btn-xs px-4 rounded-lg font-bold ${isFollowing ? "btn-neutral opacity-50" : "btn-primary shadow-lg shadow-primary/20"}`}>
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* LISTA COLECCIONES */}
        {activeTab === "colecciones" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`} className="group">
                <div className="aspect-video rounded-2xl overflow-hidden mb-2 shadow-xl border border-white/5">
                  <ItemCover src={col.cover} title={col.title} />
                </div>
                <h3 className="font-bold text-[13px] truncate px-1 group-hover:text-primary transition-colors">{col.title}</h3>
                <p className="text-[10px] text-primary font-bold px-1 uppercase tracking-tighter">@{col.author}</p>
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