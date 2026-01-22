import React, { useState, useEffect } from "react";
import { Heart, ShieldAlert, MessageCircle, MoreHorizontal, UserPlus, UserCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import ItemCover from "../components/ItemCover.jsx";
import MiniUserCard from "../components/MiniUserCard.jsx";
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
    if (!dateString) return "Ahora";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Ahora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="min-h-screen pb-24 bg-[#0a0a0a] text-[#e0e0e0] selection:bg-primary/30">
      <NavDesktop />
      
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 px-4">
        
        {/* LADO IZQUIERDO: SECCIÓN DE FEED */}
        <div className="lg:col-span-8 space-y-10">
          <header className="flex items-end justify-between border-b border-white/5 pb-6">
            <div>
              <h1 className="text-4xl font-serif italic tracking-tight text-white">Tu Galería</h1>
              <p className="text-sm opacity-40 mt-1">Novedades de tu círculo en la Tribu</p>
            </div>
            <button className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
              Filtros
            </button>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-ring loading-lg text-primary"></span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
              <ShieldAlert size={40} className="mb-4 opacity-20" />
              <p className="font-serif italic text-xl opacity-60">El feed está en silencio</p>
              <p className="text-xs opacity-40 mt-2">Sigue a nuevos curadores para ver sus colecciones</p>
            </div>
          ) : (
            <div className="space-y-12">
              {activities.map((item) => (
                <article
                  key={`${item.collection_id}-${item.created_at}`}
                  className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700"
                >
                  {/* Info del usuario superior */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${item.user_id}`} className="relative">
                        <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-500">
                          <img
                            src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random`}
                            alt={item.username}
                            className="w-full h-full object-cover scale-110"
                          />
                        </div>
                      </Link>
                      <div>
                        <Link to={`/profile/${item.user_id}`} className="block font-bold text-sm text-white hover:text-primary transition-colors">
                          @{item.username}
                        </Link>
                        <div className="flex items-center gap-2 opacity-40 text-[11px] font-medium">
                          <Clock size={12} />
                          <span>{timeAgo(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-circle btn-sm opacity-30 hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Tarjeta de Contenido */}
                  <div className="relative overflow-hidden rounded-[2rem] bg-base-200 border border-white/5 shadow-2xl">
                    <Link to={`/collection/${item.collection_id}`} className="block overflow-hidden aspect-[16/10] md:aspect-video relative">
                      <ItemCover
                        src={item.cover_url}
                        title={item.collection_name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      
                      <div className="absolute bottom-6 left-8 right-8">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                          {item.collection_type}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-none">
                          {item.collection_name}
                        </h2>
                      </div>
                    </Link>

                    {/* Acciones del Post */}
                    <div className="p-6 bg-[#121212] flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleToggleLike(item.collection_id)}
                          className={`flex items-center gap-2.5 group/btn transition-all ${
                            item.has_liked ? "text-error" : "text-white/40 hover:text-white"
                          }`}
                        >
                          <div className={`p-2 rounded-full transition-colors ${item.has_liked ? "bg-error/10" : "group-hover/btn:bg-white/5"}`}>
                            <Heart
                              size={20}
                              fill={item.has_liked ? "currentColor" : "none"}
                              strokeWidth={item.has_liked ? 0 : 2}
                            />
                          </div>
                          <span className="text-sm font-mono tracking-tighter">{item.likes || 0}</span>
                        </button>
                        
                        <button className="flex items-center gap-2.5 text-white/40 hover:text-white group/btn transition-all">
                          <div className="p-2 rounded-full group-hover/btn:bg-white/5 transition-colors">
                            <MessageCircle size={20} />
                          </div>
                          <span className="text-sm font-mono tracking-tighter">0</span>
                        </button>
                      </div>

                      <Link 
                        to={`/collection/${item.collection_id}`} 
                        className="text-[11px] font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform inline-flex items-center gap-2"
                      >
                        Explorar Colección →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: SUGERENCIAS */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-[#121212] border border-white/5 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-10 -mr-10 -mt-10 bg-primary/10 blur-[80px] rounded-full" />
              
              <h3 className="font-serif italic text-2xl text-white mb-6">
                Descubre Tribers
              </h3>
              
              <div className="space-y-6">
                {suggestedUsers.map((u) => {
                  const targetId = Number(u.id);
                  const isFollowingThis = followingIds.includes(targetId);
                  
                  return (
                    <div key={targetId} className="flex items-center justify-between group/user">
                      <Link to={`/profile/${targetId}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <img 
                          src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}`} 
                          className="w-10 h-10 rounded-full border border-white/10 group-hover/user:border-primary/50 transition-colors"
                          alt={u.username} 
                        />
                        <div className="truncate">
                          <p className="text-sm font-bold text-white truncate group-hover/user:text-primary transition-colors">@{u.username}</p>
                          <p className="text-[10px] opacity-40 uppercase tracking-tight">Curador de {u.main_category || 'Arte'}</p>
                        </div>
                      </Link>
                      
                      <button
                        onClick={() => handleFollowToggle(targetId, isFollowingThis)}
                        className={`btn btn-circle btn-sm transition-all duration-300 ${
                          isFollowingThis 
                          ? "bg-white/5 border-white/10 text-white" 
                          : "btn-primary shadow-lg shadow-primary/20"
                        }`}
                      >
                        {isFollowingThis ? <UserCheck size={14} /> : <UserPlus size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <button className="w-full mt-8 py-3 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-white/5 transition-all">
                Ver todos los curadores
              </button>
            </div>

            {/* Footer de enlaces secundarios */}
            <div className="px-8 flex flex-wrap gap-4 opacity-20 text-[10px] font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-white">Privacidad</a>
              <a href="#" className="hover:text-white">Términos</a>
              <a href="#" className="hover:text-white">Tribu © 2024</a>
            </div>
          </div>
        </aside>
      </main>
      
      <NavMobile />
    </div>
  );
};

export default Feed;