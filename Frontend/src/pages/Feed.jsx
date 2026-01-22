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

  // --- LÓGICA (Sin cambios) ---
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
    // CAMBIO 1: Fondo bg-base-200 para contrastar con el Nav (que suele ser base-100)
    <div className="min-h-screen pb-24 bg-base-200 text-base-content font-sans selection:bg-primary selection:text-white">
      <NavDesktop />
      
      {/* CAMBIO 2: pt-6 para separar del nav y max-w ajustado */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Encabezado Visual Separador */}
        <div className="flex items-baseline justify-between mb-8 border-b border-base-content/10 pb-6">
             <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tighter opacity-90 text-base-content">
                Feed
              </h1>
             <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 hidden sm:block">
                Últimas Actualizaciones
             </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUMNA PRINCIPAL (FEED) */}
          <div className="lg:col-span-8">

            {loading ? (
              <div className="flex justify-center py-20">
                <span className="loading loading-dots loading-lg opacity-20"></span>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-base-content/20 rounded-3xl bg-base-100">
                <ShieldAlert className="mx-auto mb-4 opacity-20" size={40} />
                <p className="font-serif text-2xl italic opacity-50">El feed está tranquilo hoy.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {activities.map((item) => (
                  // CAMBIO 3: Cada post ahora tiene fondo blanco (base-100) para resaltar sobre el gris (base-200)
                  // Añadida sombra suave (shadow-sm) y bordes redondeados
                  <article 
                    key={`${item.collection_id}-${item.created_at}`} 
                    className="group relative bg-base-100 p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    
                    {/* Header del Post */}
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                         <span>{item.collection_type}</span>
                      </div>
                      <span>{timeAgo(item.created_at)}</span>
                    </div>

                    {/* Contenido */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Avatar Flotante */}
                      <div className="hidden md:block md:col-span-1">
                        <Link to={`/profile/${item.user_id}`} className="block w-10 h-10 rounded-full overflow-hidden border border-base-200 group-hover:border-primary transition-colors">
                           <img
                            src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random`}
                            alt={item.username}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                      </div>

                      <div className="md:col-span-11">
                        <div className="mb-5">
                           <Link to={`/profile/${item.user_id}`} className="md:hidden flex items-center gap-2 mb-3">
                              <img src={item.avatar_url} className="w-8 h-8 rounded-full border border-base-200"/>
                              <span className="text-sm font-bold">@{item.username}</span>
                           </Link>
                           
                           <Link to={`/collection/${item.collection_id}`} className="block hover:text-primary transition-colors">
                              <h2 className="text-3xl md:text-5xl font-serif font-medium leading-tight tracking-tight">
                                {item.collection_name}
                              </h2>
                           </Link>
                        </div>

                        <Link to={`/collection/${item.collection_id}`} className="block relative aspect-video overflow-hidden rounded-xl bg-base-200">
                           <ItemCover
                            src={item.cover_url}
                            title={item.collection_name}
                            className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl translate-y-2 group-hover:translate-y-0">
                            <ArrowUpRight size={20} />
                          </div>
                        </Link>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-base-200">
                           <button 
                             onClick={() => handleToggleLike(item.collection_id)}
                             className={`flex items-center gap-2 px-0 transition-all ${
                               item.has_liked ? "text-error" : "text-base-content/40 hover:text-base-content"
                             }`}
                           >
                             <Heart size={20} fill={item.has_liked ? "currentColor" : "none"} />
                             <span className="text-sm font-bold">{item.likes || 0}</span>
                           </button>
                           
                           <div className="flex items-center gap-2 text-xs font-medium opacity-50">
                              <span>by</span>
                              <Link to={`/profile/${item.user_id}`} className="hover:underline text-base-content opacity-100 font-bold">
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

          {/* COLUMNA LATERAL (SUGERENCIAS) */}
          <aside className="hidden lg:block lg:col-span-4 pl-4">
            <div className="sticky top-24 bg-base-100 p-6 rounded-[2rem] shadow-sm border border-base-content/5">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2">
                Curadores para ti
              </h3>

              <ul className="space-y-4">
                {suggestedUsers.map((u) => {
                  const isFollowing = followingIds.includes(Number(u.id));
                  return (
                    <li key={u.id} className="group">
                      <div className="flex items-center justify-between p-2 rounded-xl hover:bg-base-200/50 transition-colors">
                        <Link to={`/profile/${u.id}`} className="flex items-center gap-3 overflow-hidden">
                           <img 
                              src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}`} 
                              className="w-10 h-10 rounded-full border border-base-200"
                              alt={u.username}
                           />
                           <div className="flex flex-col truncate">
                              <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                @{u.username}
                              </span>
                              <span className="text-[10px] uppercase opacity-40 tracking-wider">
                                {u.main_category || 'Artist'}
                              </span>
                           </div>
                        </Link>
                        
                        <button
                          onClick={() => handleFollowToggle(u.id, isFollowing)}
                          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
                            isFollowing
                              ? "bg-base-content text-base-100 border-base-content"
                              : "border-base-content/20 hover:border-primary hover:text-primary bg-transparent"
                          }`}
                        >
                          {isFollowing ? <span className="text-[10px]">✓</span> : <Plus size={14} />}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 pt-6 border-t border-base-content/5 text-center">
                <Link to="/search" className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                  Ver todos los curadores →
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