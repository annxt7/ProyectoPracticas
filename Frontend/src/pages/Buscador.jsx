import React, { useState, useEffect } from "react";
import { Search, X, TrendingUp, Hash, Search as SearchIcon, FireExtinguisher, Sparkles, Trophy } from "lucide-react"; 
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

  // 1. Cargar seguidos
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 focus:ring-2 ring-primary/50 focus:outline-none text-white transition-all"
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

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        
        {/* ASIDE IZQUIERDO: TENDENCIAS Y CATEGORÍAS */}
        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-10">
            
            {/* Sección Tendencias */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> Tendencias de hoy
              </h4>
              <div className="space-y-5">
                {[
                  { tag: "Cyberpunk2077", posts: "2.4k" },
                  { tag: "AnimeWinter", posts: "1.8k" },
                  { tag: "ReactVite", posts: "850" },
                  { tag: "MinimalSetup", posts: "1.2k" }
                ].map((item) => (
                  <div key={item.tag} className="group cursor-pointer">
                    <p className="text-xs opacity-40 group-hover:text-primary transition-colors">#{item.tag}</p>
                    <p className="text-[10px] font-bold opacity-20">{item.posts} colecciones</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección Categorías Rápidas */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6 flex items-center gap-2">
                <Sparkles size={14} /> Explorar por tipo
              </h4>
              <nav className="flex flex-col gap-3">
                {["Música", "Cine", "Gaming", "Arte", "Tech"].map((cat) => (
                  <button key={cat} className="flex items-center gap-3 text-sm opacity-50 hover:opacity-100 hover:translate-x-1 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    {cat}
                  </button>
                ))}
              </nav>
            </div>

            {/* Banner decorativo o Info */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10">
              <Trophy className="text-primary mb-3" size={20} />
              <p className="text-xs font-bold text-white mb-1">Top Creador</p>
              <p className="text-[10px] opacity-50 leading-relaxed">@annxt7 lidera las tendencias esta semana.</p>
            </div>

          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main>
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
                    <Link to={`/profile/${u.id}`} className="flex items-center gap-4 min-w-0">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-2xl">
                          <img src={u.img || `https://ui-avatars.com/api/?name=${u.name}&background=random`} alt="" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-white truncate">{u.name}</h3>
                        <p className="text-[10px] opacity-40">@{u.username || u.name.toLowerCase().replace(/\s/g, '')}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => handleFollowToggle(u.id, followingIds.includes(u.id))}
                      className={`btn btn-xs rounded-xl px-4 ${followingIds.includes(u.id) ? "btn-neutral" : "btn-primary"}`}
                    >
                      {followingIds.includes(u.id) ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>
                ))
              ) : (
                !loading && <div className="text-center py-20 opacity-20 italic text-sm">No se encontraron resultados</div>
              )}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {collections.length > 0 ? (
                collections.map((col) => (
                  <Link key={col.id} to={`/collection/${col.id}`} className="block group">
                    <div className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-2xl">
                      <div className="aspect-[16/10] overflow-hidden">
                        <ItemCover src={col.cover} title={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-white text-xl truncate group-hover:text-primary transition-colors">
                          {col.title}
                        </h3>
                        <div className="flex items-center justify-between mt-3">
                           <span className="text-xs font-medium text-primary/60">@{col.author}</span>
                           <span className="text-[10px] opacity-20 uppercase font-black tracking-widest">{col.type || 'Colección'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                !loading && <div className="text-center py-20 opacity-20 italic text-sm">No se encontraron colecciones</div>
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