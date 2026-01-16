import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover";
import api from "../services/api"; // Usamos tu instancia de axios
import { useAuth } from "../context/AuthContext";
import { normalizeUser, normalizeCollection } from "../services/normalizers";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const { user: currentUser } = useAuth();

  // Cargar seguidos 
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${currentUser.id}`);
        const ids = res.data.map(u => normalizeUser(u).id);
        setFollowingIds(ids);
      } catch (err) {
        console.error("Error al cargar seguidos:", err);
      }
    };
    fetchFollowing();
  }, [currentUser?.id]);

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?query=${encodeURIComponent(query)}`);
        const data = res.data;
        const cleanUsers = (data.users || []).map(u => normalizeUser(u));
        const cleanCollections = (data.collections || []).map(c => normalizeCollection(c));

        setUsers(cleanUsers);
        setCollections(cleanCollections);
      } catch (err) {
        console.error("Error en el buscador:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query]); 

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
      console.error("Error al seguir/dejar de seguir:", err);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content font-sans">
      <NavDesktop />
      
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/90 backdrop-blur-md p-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 outline-none focus:border-primary/50 transition-all text-sm"
            />
            {query && (
              <X 
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 cursor-pointer hover:opacity-100" 
                size={16} 
                onClick={() => setQuery("")} 
              />
            )}
          </div>

          <div className="flex justify-center gap-12">
            {["cuentas", "colecciones"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab ? "text-primary border-b-2 border-primary" : "opacity-30 hover:opacity-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 mt-4">
        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}

        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => {
              const isFollowing = followingIds.includes(u.id);
              const isMe = u.id === currentUser?.id; // Identificamos si soy yo

              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <Link to={isMe ? "/profile/me" : `/profile/${u.id}`} className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10">
                      <img 
                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random&color=fff`} 
                        className="w-full h-full object-cover"
                        alt={u.username}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate uppercase tracking-tighter text-white/90">
                        @{u.username} {isMe && <span className="text-[10px] text-primary ml-1">(TÚ)</span>}
                      </p>
                    </div>
                  </Link>
                  
                  {/* Solo mostramos botón seguir si NO soy yo */}
                  {!isMe && (
                    <button
                      onClick={() => handleFollowToggle(u.id, isFollowing)}
                      className={`btn btn-xs px-5 rounded-lg font-bold transition-all ${
                        isFollowing ? "btn-neutral opacity-40" : "btn-primary"
                      }`}
                    >
                      {isFollowing ? "Siguiendo" : "Seguir"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "colecciones" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`} className="group">
                <div className="flex flex-col gap-3">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-primary/40 transition-all relative">
                    <ItemCover src={col.cover} title={col.title} className="group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="px-1">
                    <h3 className="font-bold truncate text-[13px] text-white/90 group-hover:text-primary">
                      {col.title}
                    </h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                      @{col.author} {col.creatorId === currentUser?.id && "(Mía)"}
                    </p>
                  </div>
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