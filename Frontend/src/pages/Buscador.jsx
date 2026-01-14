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

  const fetchMyFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/users/following/${user.id}`);
      const ids = res.data.map(u => Number(u.user_id || u.id || u.following_id));
      setFollowingIds(ids);
    } catch (e) { console.error("Error seguidos:", e); }
  }, [user?.id]);

  useEffect(() => { fetchMyFollowing(); }, [fetchMyFollowing]);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        
        // --- DEBUG: Mira esto en la consola F12 ---
        console.log("TU ID EN CONTEXTO:", user.id);
        console.log("DATOS QUE VIENEN DEL BUSCADOR:", res.data);

        const myId = Number(user.id);
        const myName = (user.username || user.name || "").toLowerCase().trim();

        // 1. FILTRAR USUARIOS
        const filteredUsers = (res.data.users || []).filter(u => {
          const uId = Number(u.user_id || u.id);
          const uName = (u.username || u.name || "").toLowerCase().trim();
          // No soy yo si el ID es distinto Y el nombre es distinto
          return uId !== myId && uName !== myName;
        });

        // 2. FILTRAR COLECCIONES
        const filteredCollections = (res.data.collections || []).filter(col => {
          const creatorId = Number(col.user_id || col.userId || col.creator_id);
          const creatorName = (col.creator_username || col.username || col.author || "").toLowerCase().trim();
          
          // CRUCIAL: Filtramos por ID y por Nombre (Doble seguridad)
          const isMine = creatorId === myId || (creatorName === myName && myName !== "");
          return !isMine;
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
  }, [query, user]);

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
    } catch (error) { console.error("Error follow:", error); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-white"
          />
          <div className="flex justify-center gap-8 mt-4 border-b border-white/5">
            {["cuentas", "colecciones"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold capitalize ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-white/40"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4">
        {activeTab === "cuentas" && (
          <div className="grid gap-4">
            {usersWithoutMyself.map((u) => {
              const uId = Number(u.user_id || u.id);
              const isFollowing = followingIds.includes(uId);
              const name = u.username || u.name || "Usuario";
              return (
                <div key={uId} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <Link to={`/profile/${uId}`} className="flex items-center gap-3">
                    <img src={u.avatar_url || u.avatar || u.img || `https://ui-avatars.com/api/?name=${name}`} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <p className="font-bold text-white text-sm">{name}</p>
                      <p className="text-[10px] opacity-40">@{name.toLowerCase()}</p>
                    </div>
                  </Link>
                  <button onClick={() => handleFollowToggle(uId, isFollowing)} className={`btn btn-xs ${isFollowing ? "btn-neutral" : "btn-primary"}`}>
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "colecciones" && (
          <div className="grid grid-cols-2 gap-4">
            {collections.map((col) => {
              const colId = col.collection_id || col.id;
              return (
                <Link key={colId} to={`/collection/${colId}`} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden p-2">
                  <ItemCover src={col.cover_url || col.cover} className="aspect-video rounded-xl mb-2" />
                  <p className="font-bold text-white text-xs truncate">{col.collection_name || col.title}</p>
                  <p className="text-[10px] text-primary/60">@{ (col.creator_username || col.author || "usuario").toLowerCase() }</p>
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