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
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const { user } = useAuth();

  /* ======================
      MIS SEGUIDOS 
  ====================== */
  useEffect(() => {
    if (!user?.id) return;

    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        // Normalizamos los IDs a Números para evitar errores de comparación
        const ids = res.data.map(u => Number(u.following_id || u.followed_id || u.id));
        setFollowingIds(ids);
      } catch (err) {
        console.error("Error cargando seguidos:", err);
      }
    };

    fetchFollowing();
  }, [user?.id]);

  /* ======================
      FOLLOW / UNFOLLOW
  ====================== */
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
    } catch (err) {
      console.error("Error follow toggle:", err);
    }
  };

  /* ======================
      BUSCADOR (Mapeo Defensivo)
  ====================== */
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = window.location.hostname === "localhost"
            ? "http://localhost:3000"
            : "https://axel.informaticamajada.es";

        const token = localStorage.getItem("tribe_token")?.replace(/['"]+/g, "");

        const res = await fetch(
          `${baseUrl}/api/search?query=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Error API");
        const data = await res.json();
        const myId = Number(user.id);

        // 1. Usuarios: Normalizamos ID y filtramos al usuario actual
        const filteredUsers = (data.users || []).map(u => ({
          ...u,
          id: Number(u.user_id || u.id),
          name: u.name || u.nombre || "Usuario",
          username: u.username || u.user || "usuario"
        })).filter(u => u.id !== myId);

        // 2. Colecciones: Filtramos las que pertenecen al usuario actual
        const filteredCollections = (data.collections || []).map(c => ({
          ...c,
          id: Number(c.collection_id || c.id),
          creatorId: Number(c.creator_id || c.user_id),
          title: c.collection_name || c.title,
          author: c.creator_username || c.author || c.username
        })).filter(c => c.creatorId !== myId);

        setUsers(filteredUsers);
        setCollections(filteredCollections);
      } catch (err) {
        console.error("Error búsqueda:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user?.id]);

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-base-100 text-base-content font-sans">
      <NavDesktop />

      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full rounded-2xl py-3 pl-12 pr-10 bg-white/5 border border-white/10 outline-none focus:border-primary/50 transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex justify-center gap-8 border-b border-white/5">
            {["cuentas", "colecciones"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-bold capitalize transition-all ${activeTab === tab ? "text-primary border-b-2 border-primary" : "opacity-40 hover:opacity-100"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && <div className="text-center text-xs opacity-50 italic animate-pulse">Buscando...</div>}

        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {users.map(u => {
              const isFollowing = followingIds.includes(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.img || u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff`}
                      className="w-12 h-12 rounded-full object-cover bg-base-300"
                      alt={u.name}
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold truncate text-sm">{u.name}</h3>
                      <p className="text-[10px] opacity-40 uppercase font-bold tracking-tight">@{u.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(u.id, isFollowing)}
                    className={`btn btn-xs rounded-lg px-4 font-bold transition-all ${isFollowing ? "btn-neutral opacity-60" : "btn-primary shadow-lg shadow-primary/20"}`}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "colecciones" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`} className="group">
                <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] transition-all group-hover:border-primary/30 shadow-xl">
                  <div className="aspect-video bg-white/5 overflow-hidden">
                    <ItemCover src={col.cover} title={col.title} className="group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold truncate text-xs">{col.title}</h3>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">@{col.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && query && users.length === 0 && collections.length === 0 && (
          <div className="text-center py-20 opacity-20 italic">No se encontraron resultados para "{query}"</div>
        )}
      </div>

      <NavMobile />
    </div>
  );
};

export default Explorer;