import React, { useState, useEffect } from "react";
import { Heart, ShieldAlert } from "lucide-react";
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

  // Aseguramos que el ID actual sea siempre un número
  const myId = currentUser ? Number(currentUser.id || currentUser.user_id) : null;

  // 1. Cargar lista de seguidos (Para saber a quién sigo ya)
  useEffect(() => {
    const fetchMyFollowing = async () => {
      if (!myId) return;
      try {
        const res = await api.get(`/users/following/${myId}`);
        // Normalizamos los IDs a números para comparaciones directas
        const ids = (res.data || []).map((u) => Number(u.id || u.user_id));
        setFollowingIds(ids);
      } catch (e) {
        console.error("Error cargando seguidos:", e);
      }
    };
    fetchMyFollowing();
  }, [myId]);

  // 2. Cargar actividad global y sugerencias
  useEffect(() => {
    const fetchFeedData = async () => {
      if (!myId) return;
      setLoading(true);
      try {
        // Obtenemos actividad de la red
        const activityRes = await api.get("/users/feed/activity");
        // Filtramos para no ver mis propias acciones
        const filteredActivity = (activityRes.data || []).filter(
          (item) => Number(item.user_id) !== myId
        );
        setActivities(filteredActivity);

        // Obtenemos sugerencias
        const suggestionsRes = await api.get("/search/suggested");
        const normalizedSuggestions = (suggestionsRes.data || [])
          .map(u => normalizeUser(u))
          .filter(u => Number(u.id) !== myId);
        
        setSuggestedUsers(normalizedSuggestions);
      } catch (error) {
        console.error("Error cargando feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedData();
  }, [myId]);

  // Handler de seguimiento (Optimista)
  const handleFollowToggle = async (targetId, currentlyFollowing) => {
    const id = Number(targetId);
    // Cambio local instantáneo para feedback del usuario
    if (currentlyFollowing) {
      setFollowingIds(prev => prev.filter(fid => fid !== id));
    } else {
      setFollowingIds(prev => [...prev, id]);
    }

    try {
      if (currentlyFollowing) {
        await api.delete(`/users/unfollow/${id}`);
      } else {
        await api.post(`/users/follow/${id}`);
      }
    } catch (error) {
      console.error("Error en toggle follow:", error);
      // Rollback si falla la API
      if (currentlyFollowing) {
        setFollowingIds(prev => [...prev, id]);
      } else {
        setFollowingIds(prev => prev.filter(fid => fid !== id));
      }
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
      console.error("Error like:", error);
    }
  };

  function timeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Ahora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return `${days} d`;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 px-4">
        
        {/* COLUMNA IZQUIERDA: ACTIVIDAD (8 de 12 columnas) */}
        <div className="lg:col-span-8 space-y-6">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Actividad reciente</h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
              <ShieldAlert size={48} className="mb-4 opacity-20" />
              <p className="font-bold opacity-60">Tu feed está vacío</p>
              <p className="text-xs opacity-40 max-w-[200px] mt-2">Sigue a otros usuarios para ver sus nuevas colecciones aquí.</p>
            </div>
          ) : (
            activities.map((item) => (
              <div
                key={`${item.collection_id}-${item.created_at}`}
                className="bg-base-100 border border-white/5 rounded-3xl overflow-hidden shadow-sm"
              >
                {/* Header: Usuario */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${item.user_id}`} className="avatar">
                      <div className="w-10 h-10 rounded-full border border-white/10">
                        <img
                          src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random`}
                          alt={item.username}
                        />
                      </div>
                    </Link>
                    <div>
                      <p className="text-sm font-bold">
                        <Link to={`/profile/${item.user_id}`} className="hover:text-primary transition-colors">
                          @{item.username}
                        </Link>
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {item.collection_type || 'Nueva Colección'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">
                    {timeAgo(item.created_at)}
                  </span>
                </div>

                {/* Contenido: Portada */}
                <Link to={`/collection/${item.collection_id}`} className="relative block group aspect-video overflow-hidden bg-base-300">
                  <ItemCover
                    src={item.cover_url}
                    title={item.collection_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <h2 className="text-white text-xl font-black italic uppercase tracking-tight leading-none">
                      {item.collection_name}
                    </h2>
                  </div>
                </Link>

                {/* Footer: Acciones */}
                <div className="p-4 flex items-center gap-4">
                  <button
                    onClick={() => handleToggleLike(item.collection_id)}
                    className={`flex items-center gap-2 text-sm font-black transition-all ${
                      item.has_liked ? "text-error" : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={item.has_liked ? "currentColor" : "none"}
                      strokeWidth={3}
                    />
                    <span>{item.likes || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* COLUMNA DERECHA: SUGERENCIAS (4 de 12 columnas) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-primary">
                Descubrir Tribers
              </h3>
              <div className="space-y-6">
                {suggestedUsers.map((u) => {
                  const targetId = Number(u.id);
                  const isFollowingThis = followingIds.includes(targetId);
                  
                  return (
                    <MiniUserCard
                      key={targetId}
                      user={u}
                      isFollowing={isFollowingThis}
                      onFollowToggle={() => handleFollowToggle(targetId, isFollowingThis)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <NavMobile />
    </div>
  );
};

export default Feed;