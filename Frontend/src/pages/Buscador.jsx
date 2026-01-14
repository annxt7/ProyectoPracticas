import React, { useState, useEffect } from "react";
import { Search, X, TrendingUp, Hash, Search as SearchIcon, TrendingUp as TrendingIcon } from "lucide-react"; 
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

  useEffect(() => {
    if (!user?.id) return;
    const fetchMyFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        setFollowingIds(res.data.map(u => u.id));
      } catch (e) {
        console.error("Error seguidos:", e);
      }
    };
    fetchMyFollowing();
  }, [user?.id]);

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

  // --- LÓGICA DE BÚSQUEDA CORREGIDA ---
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const data = res.data;

        const myId = String(user.id);
        const myName = String(user.name || "").toLowerCase().trim();

        // 1. Filtrar Usuarios
        const filteredUsers = (data.users || []).filter(
          (u) => String(u.id) !== myId
        );

        // 2. Filtrar Colecciones (Súper estricto)
        const filteredCollections = (data.collections || []).filter((col) => {
          const colCreatorId = String(col.user_id || col.userId || col.creator_id || "");
          const colAuthorName = String(col.author || "").toLowerCase().trim();
          
          // REGLA: Si el ID coincide O el nombre coincide, queda FUERA (false)
          const isMine = (colCreatorId === myId) || (colAuthorName === myName && myName !== "");
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
  }, [query, user?.id, user?.name]);

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* --- BLOQUE DE DEBUG (ELIMINALO CUANDO FUNCIONE) --- */}
      <div className="bg-warning text-warning-content text-[10px] p-2 text-center font-mono">
        DEBUG: Mi ID: {user?.id} | Mi Nombre: {user?.name} | Colecciones mostradas: {collections.length}
      </div>

      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="input w-full bg-white/5 border-white/10 rounded-2xl pl-12 h-12"
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

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-10">
        <aside className="hidden lg:block opacity-30 italic text-xs">Tendencias próximamente...</aside>

        <main>
          {loading && <div className="text-center py-4">Buscando...</div>}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {usersWithoutMyself.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
                    <img src={u.img || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-full" alt="" />
                    <span className="font-bold">{u.name}</span>
                  </Link>
                  <button onClick={() => handleFollowToggle(u.id, followingIds.includes(u.id))} className="btn btn-xs">
                    {followingIds.includes(u.id) ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {collections.length > 0 ? (
                collections.map((col) => (
                  <Link key={col.id} to={`/collection/${col.id}`} className="block group">
                    <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/5">
                      <div className="aspect-video">
                        <ItemCover src={col.cover} title={col.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white truncate">{col.title}</h3>
                        <p className="text-xs text-primary">@{col.author}</p>
                        {/* Esto te ayudará a ver por qué no se filtra */}
                        <p className="text-[8px] opacity-20">ID Creador: {col.user_id || col.userId || 'null'}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                !loading && <div className="text-center py-20 opacity-20">No hay otras colecciones</div>
              )}
            </div>
          )}
        </main>
      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;