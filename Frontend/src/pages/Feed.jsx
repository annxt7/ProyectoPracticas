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

  const myId = currentUser ? Number(currentUser.id || currentUser.user_id) : null;

  // 1. Cargar seguidos (Normalizado)
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

  // 2. Cargar actividad y sugerencias
  useEffect(() => {
    if (!myId) return;
    const fetchFeedData = async () => {
      setLoading(true);
      try {
        const activityRes = await api.get("/users/feed/activity");
        // Saneamiento de datos para evitar errores de toLowerCase
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
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return `${days} d`;
  }

  return (
    // CAMBIO AQUI: bg-base-200 para crear contraste con el Nav y las Cards
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-200">
      <NavDesktop />
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 px-4">
        
        {/* COLUMNA IZQUIERDA: FEED */}
        <div className="md:col-span-2 space-y-6">
          <div className="md:hidden flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-serif">Tu Feed</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center">
              <ShieldAlert size={48} className="mb-4" />
              <p>No hay actividad reciente de las personas que sigues.</p>
              <p className="text-xs">¡Sigue a más Tribers para llenar tu feed!</p>
            </div>
          ) : (
            activities.map((item) => (
              <div
                key={`${item.collection_id}-${item.created_at}`}
                // Las cards se mantienen en base-100 para resaltar sobre el fondo base-200
                className="bg-base-100 border-b border-base-200 md:border md:rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Header del post */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${item.user_id}`} className="w-10 h-10 rounded-full overflow-hidden border border-base-200">
                      <img
                        src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random`}
                        alt={item.username}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="text-sm">
                      <p className="font-semibold">
                        <Link to={`/profile/${item.user_id}`} className="hover:text-primary">
                          @{item.username}
                        </Link>
                        <span className="font-normal opacity-60 ml-2">creó una colección</span>
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">
                        {item.collection_type}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] opacity-40 font-bold uppercase">
                    {timeAgo(item.created_at)}
                  </span>
                </div>

                {/* Portada de la colección */}
                <Link to={`/collection/${item.collection_id}`}>
                  <div className="relative aspect-video bg-base-200 w-full overflow-hidden group">
                    <ItemCover
                      src={item.cover_url}
                      title={item.collection_name}
                      className="group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="inline-block bg-black/70 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-sm font-bold shadow-xl border border-white/10">
                          {item.collection_name}
                        </div>
                    </div>
                  </div>
                </Link>

                {/* Footer del post: Likes */}
                <div className="p-4">
                  <button
                    onClick={() => handleToggleLike(item.collection_id)}
                    className={`flex items-center gap-2 text-sm font-black transition-all ${
                      item.has_liked ? "text-error" : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    <Heart
                      size={22}
                      fill={item.has_liked ? "currentColor" : "none"}
                      strokeWidth={2.5}
                    />
                    <span>{item.likes || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* COLUMNA DERECHA: SUGERENCIAS */}
        <div className="hidden md:block col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Fondo base-100 para que resalte sobre el base-200 */}
            <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-primary">
                Tribers Sugeridos
              </h3>
              <div className="space-y-5">
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