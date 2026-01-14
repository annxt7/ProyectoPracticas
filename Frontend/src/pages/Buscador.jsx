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

  // 1. Cargar lista de seguidos para los botones de Follow
  useEffect(() => {
    if (!user?.id) return;
    const fetchMyFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        setFollowingIds(res.data.map(u => u.id));
      } catch (e) {
        console.error("Error cargando seguidos:", e);
      }
    };
    fetchMyFollowing();
  }, [user?.id]);

  // 2. Lógica para seguir/dejar de seguir
  const handleFollowToggle = async (targetId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${targetId}`);
        setFollowingIds(prev => prev.filter(id => id !== targetId));
      } else {
        await api.post(`/users/follow/${targetId}`);
        setFollowingIds(prev => [...prev, targetId]);
      }
    } catch (error) {
      console.error("Error en follow toggle:", error);
    }
  };

  // 3. Búsqueda con Filtro de Seguridad por ID y por Nombre
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const data = res.data;

        const myId = String(user.id || "");
        // Intentamos obtener el nombre de varias fuentes por si una está vacía
        const myName = String(user.name || user.username || user.handle || "").toLowerCase().trim();

        // Filtrar Usuarios (que no sea yo)
        const filteredUsers = (data.users || []).filter(
          (u) => String(u.id) !== myId
        );

        // Filtrar Colecciones (que no sean las mías)
        const filteredCollections = (data.collections || []).filter((col) => {
          const colCreatorId = String(col.user_id || col.userId || "");
          const colAuthorName = String(col.author || "").toLowerCase().trim();
          
          // REGLA: Si el ID coincide O el nombre del autor coincide con el mío, se oculta
          const isMyContent = (colCreatorId !== "" && colCreatorId === myId) || 
                              (myName !== "" && colAuthorName === myName);
          
          return !isMyContent;
        });

        setUsersWithoutMyself(filteredUsers);
        setCollections(filteredCollections);
      } catch (err) {
        console.error("Error en la búsqueda:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user]);

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* BARRA DE INFORMACIÓN (Solo para verificar datos) */}
      <div className="bg-primary/10 text-primary text-[10px] p-1 text-center font-mono border-b border-white/5">
        SESIÓN ACTIVA: ID {user?.id || '?' } | NOMBRE: "{user?.name || user?.username || 'no detectado'}"
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 focus:ring-2 ring-primary/50 focus:outline-none text-white transition-all"
            />
          </div>

          <div className="flex justify-center gap-8 border-b border-white/5">
            {["cuentas", "colecciones"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize transition-all relative ${
                  activeTab === tab ? "text-primary" : "text-white/40 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <main className="max-w-4xl mx-auto">
          {loading && <div className="text-center py-4 opacity-50 text-xs italic">Buscando...</div>}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersWithoutMyself.length > 0 ? (
                usersWithoutMyself.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
                      <img 
                        src={u.img || `https://ui-avatars.com/api/?name=${u.name}`} 
                        className="w-10 h-10 rounded-full object-cover" 
                        alt={u.name} 
                      />
                      <span className="font-bold text-sm text-white">{u.name}</span>
                    </Link>
                    <button 
                      onClick={() => handleFollowToggle(u.id, followingIds.includes(u.id))}
                      className={`btn btn-xs rounded-full px-4 ${followingIds.includes(u.id) ? "btn-neutral" : "btn-primary"}`}
                    >
                      {followingIds.includes(u.id) ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>
                ))
              ) : (
                !loading && <div className="text-center py-10 opacity-20 italic">No se encontraron cuentas</div>
              )}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {collections.length > 0 ? (
                collections.map((col) => (
                  <Link key={col.id} to={`/collection/${col.id}`} className="block group">
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all shadow-xl">
                      <div className="aspect-video overflow-hidden">
                        <ItemCover src={col.cover} title={col.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-white text-lg truncate">{col.title}</h3>
                        <p className="text-xs text-primary/80 mt-1">@{col.author}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                !loading && <div className="text-center py-10 opacity-20 italic">No se encontraron colecciones de otros</div>
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