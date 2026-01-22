import React, { useState, useEffect } from "react";
import { Heart, ShieldAlert, ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ItemCover from "../components/ItemCover.jsx";
import NavDesktop from "../components/NavDesktop.jsx";
import NavMobile from "../components/NavMobile.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { normalizeUser } from "../services/normalizers";

const Feed = () => {
  const { user: currentUser } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const myId = currentUser ? Number(currentUser.id || currentUser.user_id) : null;

  // --- LÓGICA (Se mantiene igual) ---
  useEffect(() => {
    if (!myId) return;
    const fetchMyFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${myId}`);
        setFollowingIds((res.data || []).map((u) => Number(u.id || u.user_id)));
      } catch (e) {
        console.error("Error cargando mis seguidos", e);
      }
    };
    fetchMyFollowing();
  }, [myId]);

  useEffect(() => {
    if (!myId) return;
    const fetchFeedData = async () => {
      setLoading(true);
      try {
        const activityRes = await api.get("/users/feed/activity");
        const filteredActivity = (activityRes.data || [])
          .filter((item) => Number(item.user_id) !== myId)
          .map(item => ({
            ...item,
            username: item.username || "usuario",
            collection_name: item.collection_name || "Sin título",
            collection_type: item.collection_type || "Colección"
          }));
        setActivities(filteredActivity);

        const suggestionsRes = await api.get("/search/suggested");
        const filteredSuggestions = (suggestionsRes.data || [])
          .map(u => normalizeUser(u))
          .filter(u => Number(u.id) !== myId);
        
        setSuggestedUsers(filteredSuggestions);
      } catch (error) {
        console.error("Error cargando feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedData();
  }, [myId]);

  const handleFollowToggle = async (targetId, currentlyFollowing) => {
    const id = Number(targetId);
    try {
      if (currentlyFollowing) {
        await api.delete(`/users/unfollow/${id}`);
        setFollowingIds((prev) => prev.filter((fid) => fid !== id));
      } else {
        await api.post(`/users/follow/${id}`);
        setFollowingIds((prev) => [...prev, id]);
      }
    } catch (error) {
      console.error("Error follow toggle:", error);
    }
  };

  const handleToggleLike = async (collectionId) => {
    try {
      const res = await api.post(`/collections/like/${collectionId}`);
      if (res.data.success) {
        setActivities((prev) =>
          prev.map((item) => {
            if (item.collection_id === collectionId) {
              return {
                ...item,
                has_liked: res.data.liked,
                likes: res.data.liked
                  ? (item.likes || 0) + 1
                  : Math.max(0, (item.likes || 0) - 1),
              };
            }
            return item;
          })
        );
      }
    } catch (error) {
      console.error("Error al dar like en el feed:", error);
    }
  };

  function timeAgo(dateString) {
    if (!dateString) return "Hoy";
    const date = new Date(dateString);
    const now = new Date();
    const hours = Math.floor((now - date) / 3600000); // Horas
    if (hours < 1) return "Reciente";
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  }

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content font-sans selection:bg-primary selection:text-white">
      <NavDesktop />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUMNA PRINCIPAL (FEED) */}
          <div className="lg:col-span-8">
            <header className="mb-12 border-b border-base-content/10 pb-4">
              <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter opacity-90">
                Feed
              </h1>
            </header>

            {loading ? (
              <div className="flex justify-center py-20">
                <span className="loading loading-dots loading-lg opacity-20"></span>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-20 text-center border-y border-base-content/5">
                <ShieldAlert className="mx-auto mb-4 opacity-20" size={40} />
                <p className="font-serif text-2xl italic opacity-50">Nada por aquí aún.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-16">
                {activities.map((item) => (
                  <article key={`${item.collection_id}-${item.created_at}`} className="group relative">
                    
                    {/* 1. Header del Post: Línea superior con datos técnicos */}
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-40 mb-3 border-t border-base-content/10 pt-4">
                      <div className="flex items-center gap-2">
                        <span>01 // {item.collection_type}</span>
                      </div>
                      <span>{timeAgo(item.created_at)}</span>
                    </div>

                    {/* 2. Cuerpo: Título e Imagen */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Info Lateral (Solo Desktop) */}
                      <div className="hidden md:flex md:col-span-1 flex-col items-center gap-4 pt-2">
                        <Link to={`/profile/${item.user_id}`} className="block w-10 h-10 rounded-full overflow-hidden border border-base-content/10 hover:border-primary transition-colors">
                           <img
                            src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random`}
                            alt={item.username}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                         <div className="w-px h-20 bg-base-content/5"></div>
                      </div>

                      {/* Contenido Principal */}
                      <div className="md:col-span-11">
                        <div className="mb-4">
                           <Link to={`/profile/${item.user_id}`} className="md:hidden flex items-center gap-2 mb-2">
                              <img src={item.avatar_url} className="w-6 h-6 rounded-full"/>
                              <span className="text-sm font-bold">@{item.username}</span>
                           </Link>
                           
                           {/* Título GIGANTE clickeable */}
                           <Link to={`/collection/${item.collection_id}`} className="block group-hover:opacity-70 transition-opacity">
                              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[0.9] md:leading-[0.85] tracking-tight mb-6">
                                {item.collection_name}
                              </h2>
                           </Link>
                        </div>

                        {/* Portada */}
                        <Link to={`/collection/${item.collection_id}`} className="block relative aspect-[16/9] overflow-hidden bg-base-200">
                           <ItemCover
                            src={item.cover_url}
                            title={item.collection_name}
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                          />
                          {/* Botón flotante sutil */}
                          <div className="absolute top-4 right-4 bg-base-100 text-base-content rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                            <ArrowUpRight size={24} />
                          </div>
                        </Link>

                        {/* Footer del post */}
                        <div className="flex items-center justify-between mt-4">
                           <div className="flex items-center gap-4">
                              <button 
                                onClick={() => handleToggleLike(item.collection_id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                                  item.has_liked 
                                  ? "border-error text-error bg-error/5" 
                                  : "border-base-content/20 hover:border-base-content hover:bg-base-content hover:text-base-100"
                                }`}
                              >
                                <Heart size={16} fill={item.has_liked ? "currentColor" : "none"} />
                                <span className="text-xs font-bold">{item.likes || 0}</span>
                              </button>
                           </div>
                           
                           <div className="flex items-center gap-2 text-xs font-medium opacity-50">
                              <span className="hidden sm:inline">Curada por</span>
                              <Link to={`/profile/${item.user_id}`} className="hover:underline text-base-content opacity-100">
                                @{item.username}
                              </Link>
                           </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA LATERAL (SUGERENCIAS) - Estilo Lista Técnica */}
          <aside className="hidden lg:block lg:col-span-4 pl-8 border-l border-base-content/10">
            <div className="sticky top-24">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Curadores Activos
              </h3>

              <ul className="space-y-0">
                {suggestedUsers.map((u, index) => {
                  const isFollowing = followingIds.includes(Number(u.id));
                  return (
                    <li key={u.id} className="group border-b border-base-content/5 last:border-0">
                      <div className="py-4 flex items-center justify-between transition-all hover:pl-2">
                        <Link to={`/profile/${u.id}`} className="flex items-center gap-4">
                           <span className="text-xs font-mono opacity-30">{(index + 1).toString().padStart(2, '0')}</span>
                           <div className="flex flex-col">
                              <span className="font-bold text-lg leading-none group-hover:text-primary transition-colors">
                                @{u.username}
                              </span>
                              <span className="text-xs opacity-40 mt-1 truncate max-w-[120px]">
                                {u.main_category || 'General'}
                              </span>
                           </div>
                        </Link>
                        
                        <button
                          onClick={() => handleFollowToggle(u.id, isFollowing)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
                            isFollowing
                              ? "bg-base-content text-base-100 border-base-content"
                              : "border-base-content/20 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {isFollowing ? (
                             <span className="text-xs font-bold">✓</span>
                          ) : (
                             <Plus size={16} />
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-12 p-6 bg-base-200/50 text-center">
                <p className="font-serif italic text-lg mb-2">¿Buscas inspiración?</p>
                <Link to="/search" className="btn btn-outline btn-sm w-full rounded-none font-bold tracking-widest text-xs">
                  EXPLORAR TODO
                </Link>
              </div>
            </div>
          </aside>
          
        </div>
      </main>
      <NavMobile />
    </div>
  );
};

export default Feed;