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

  /* 1. CARGAR SEGUIDOS: Normalización absoluta de IDs */
  useEffect(() => {
    if (!user?.id) return;

    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        // Mapeamos buscando cualquier variante de ID que devuelva tu SQL
        const ids = res.data.map(u => Number(u.following_id || u.followed_id || u.user_id || u.id));
        setFollowingIds(ids);
      } catch (err) {
        console.error("Error cargando seguidos:", err);
      }
    };

    fetchFollowing();
  }, [user?.id]);

  /* 2. FOLLOW / UNFOLLOW: Uso de IDs numéricos */
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

  /* 3. BUSCADOR: Mapeo agresivo de nombres de columna */
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

        // --- MAPEO DE USUARIOS ---
        const filteredUsers = (data.users || []).map(u => ({
          // Buscamos el ID en todas las columnas posibles
          id: Number(u.user_id || u.id || u.id_usuario),
          // Buscamos el nombre para evitar el @undefined
          name: u.username || u.name || u.nombre || "Usuario",
          username: u.username || u.user || u.nombre_usuario || "usuario",
          img: u.avatar_url || u.img || u.avatar || u.imagen
        })).filter(u => u.id !== myId);

        // --- MAPEO DE COLECCIONES ---
        const filteredCollections = (data.collections || []).map(c => ({
          id: Number(c.collection_id || c.id || c.id_coleccion),
          // creator_id es el que usas en CollectionPage
          creatorId: Number(c.creator_id || c.user_id || c.userId || c.id_usuario),
          title: c.collection_name || c.title || c.nombre || "Sin título",
          cover: c.cover_url || c.cover || c.collection_image,
          author: c.creator_username || c.username || c.author || "usuario"
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
    <div className="min-h-screen pb-24 md:pb-10 bg-[#0a0a0a] text-white">
      <NavDesktop />

      {/* CABECERA BUSCADOR */}
      <div className="sticky top-0 md:top-16 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full rounded-2xl py-3 pl-12 pr-10 bg-white/5 border border-white/10 outline-none focus:border-primary/50 transition-all text-sm"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex justify-center gap-12 border-b border-white/5">
            {["cuentas", "colecciones"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab ? "text-primary border-b-2 border-primary" : "opacity-40 hover:opacity-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading && <div className="text-center text-xs opacity-50 animate-pulse italic">Sincronizando biblioteca...</div>}

        {/* LISTA DE CUENTAS */}
        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => {
              const isFollowing = followingIds.includes(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-base-300 border border-white/10">
                      <img
                        src={u.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff`}
                        className="w-full h-full object-cover"
                        alt={u.name}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold truncate text-sm">{u.name}</h3>
                      <p className="text-[10px] opacity-40 font-mono">@{u.username.toLowerCase()}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleFollowToggle(u.id, isFollowing)}
                    className={`btn btn-xs px-5 rounded-lg font-bold transition-all ${
                      isFollowing ? "btn-neutral opacity-50" : "btn-primary shadow-lg shadow-primary/10"
                    }`}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* GRID DE COLECCIONES */}
        {activeTab === "colecciones" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`} className="group">
                <div className="flex flex-col gap-3">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-primary/40 transition-all shadow-xl">
                    <ItemCover src={col.cover} title={col.title} className="group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="px-1">
                    <h3 className="font-bold truncate text-xs group-hover:text-primary transition-colors">{col.title}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-tighter">@{col.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NavMobile />
    </div>
  );
};

export default Explorer;