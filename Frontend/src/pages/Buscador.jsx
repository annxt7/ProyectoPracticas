import React, { useState, useEffect } from "react";
import { Search, X, TrendingUp, Hash, Search as SearchIcon, Sparkles, Trophy } from "lucide-react"; 
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

  // 1. Cargar lista de seguidos
  useEffect(() => {
    if (!user?.id) return;
    const fetchMyFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        setFollowingIds(res.data.map(u => u.id));
      } catch (e) { console.error(e); }
    };
    fetchMyFollowing();
  }, [user?.id]);

  // 2. Lógica Follow
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

  // 3. Búsqueda y Filtro de Seguridad
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/search", { params: { query } });
        const data = res.data;
        const myId = String(user.id || "");
        const myIdentifiers = [
          String(user.name || "").toLowerCase().trim(),
          String(user.username || "").toLowerCase().trim()
        ].filter(Boolean);

        const filteredUsers = (data.users || []).filter(u => String(u.id) !== myId);

        const filteredCollections = (data.collections || []).filter((col) => {
          const colAuthor = String(col.author || "").toLowerCase().trim().replace(/^@+/, "");
          const colCreatorId = String(col.user_id || col.userId || "");
          const isMyId = colCreatorId !== "" && colCreatorId === myId;
          const isMyName = myIdentifiers.some(id => id.replace(/^@+/, "") === colAuthor);
          return !isMyId && !isMyName;
        });

        setUsersWithoutMyself(filteredUsers);
        setCollections(filteredCollections);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user]);

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* HEADER BUSCADOR */}
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 focus:ring-2 ring-primary/50 focus:outline-none text-white transition-all h-12"
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

      {/* GRID PRINCIPAL */}
      <div className="max-w-[1400px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-8">
        
        {/* COLUMNA IZQUIERDA: TENDENCIAS */}
        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> Tendencias
              </h4>
              <div className="space-y-4">
                {["Cyberpunk", "Anime", "Minimal", "Gaming"].map((tag) => (
                  <div key={tag} className="group cursor-pointer">
                    <p className="text-xs opacity-40 group-hover:text-primary transition-colors">#{tag}</p>
                    <p className="text-[9px] font-bold opacity-20">1.2k colecciones</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* COLUMNA CENTRAL: RESULTADOS */}
        <main className="w-full max-w-3xl mx-auto">
          {loading && (
            <div className="flex justify-center py-10">
              <span className="loading loading-dots loading-md text-primary/40"></span>
            </div>
          )}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersWithoutMyself.length > 0 ? (
                usersWithoutMyself.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                    <Link to={`/profile/${u.id}`} className="flex items-center gap-3 min-w-0">
                      <img src={u.img || `https://ui-avatars.com/api/?name=${u.name}&background=random`} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-[13px] text-white truncate">{u.name}</h3>
                        <p className="text-[10px] opacity-40">@{u.username || 'usuario'}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => handleFollowToggle(u.id, followingIds.includes(u.id))}
                      className={`btn btn-xs rounded-lg px-3 ${followingIds.includes(u.id) ? "btn-neutral" : "btn-primary"}`}
                    >
                      {followingIds.includes(u.id) ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>
                ))
              ) : (
                !loading && <div className="col-span-full text-center py-20 opacity-20 italic text-sm">No hay resultados</div>
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
                        <ItemCover src={col.cover} title={col.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white text-md truncate group-hover:text-primary transition-colors">
                          {col.title}
                        </h3>
                        <p className="text-[10px] text-primary/60 mt-1">@{col.author}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                !loading && <div className="col-span-full text-center py-20 opacity-20 italic text-sm">No hay colecciones</div>
              )}
            </div>
          )}
        </main>

        {/* COLUMNA DERECHA: BALANCE */}
        <aside className="hidden lg:block">
           <div className="sticky top-48">
              <div className="p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent">
                 <Sparkles className="text-primary/40 mb-3" size={18} />
                 <h5 className="text-[10px] font-bold uppercase tracking-widest opacity-40">Tip</h5>
                 <p className="text-[11px] opacity-30 mt-2 leading-relaxed">
                   Explora perfiles para descubrir nuevas gemas.
                 </p>
              </div>
           </div>
        </aside>

      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;