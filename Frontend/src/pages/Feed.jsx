import React, { useState, useEffect } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import ItemCover from "../components/ItemCover.jsx";
import MiniUserCard from "../components/MiniUserCard.jsx";
import NavDesktop from "../components/NavDesktop.jsx";
import NavMobile from "../components/NavMobile.jsx";
import api from "../services/api.js";

const Feed = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para obtener mi ID (misma lógica que Explorer)
  const getMyId = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id || parsed.user_id) return String(parsed.id || parsed.user_id).trim();
      }
      const token = localStorage.getItem('tribe_token')?.replace(/['"]+/g, '');
      if (!token) return null;
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return String(payload.id || payload.userId || payload.user_id || "").trim();
    } catch (e) {
      return null;
    }
  };

  const myId = getMyId();

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " a";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mes";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return "Ahora";
  }

  useEffect(() => {
    const fetchFeedData = async () => {
      setLoading(true);
      try {
        // 1. Cargar Actividad del feed
        const activityRes = await api.get("/users/feed/activity");
        // FILTRO: No mostrar mi propia actividad en el feed
        const filteredActivity = activityRes.data.filter(item => 
          String(item.user_id).trim() !== myId
        );
        setActivities(filteredActivity);

        // 2. Cargar Usuarios sugeridos
        const suggestionsRes = await api.get("/search/suggested");
        // FILTRO: No mostrarme a mí mismo en sugerencias
        const filteredSuggestions = suggestionsRes.data.filter(user => 
          String(user.id || user.user_id).trim() !== myId
        );
        setSuggestedUsers(filteredSuggestions);

      } catch (error) {
        console.error("Error cargando feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, [myId]); // Añadido myId como dependencia

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 px-4">
        
        {/* COLUMNA IZQUIERDA (FEED) */}
        <div className="md:col-span-2 space-y-6">
          <div className="md:hidden flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-serif">Tu Feed</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              No hay actividad reciente de otros usuarios.
            </div>
          ) : (
            activities.map((item) => (
              <div
                key={`${item.action_type}-${item.collection_id}-${item.created_at}`}
                className="card border-b bg-base-100 border-white/5 md:border md:rounded-2xl md:shadow-sm overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${item.user_id}`} className="avatar cursor-pointer">
                      <div className="w-10 h-10 rounded-full ring ring-base-200 ring-offset-1">
                        <img
                          src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random`}
                          alt={item.username}
                        />
                      </div>
                    </Link>
                    <div className="text-sm">
                      <p className="font-semibold leading-none">
                        <Link to={`/profile/${item.user_id}`} className="hover:underline">
                          {item.username}
                        </Link>{" "}
                        <span className="font-normal opacity-70">
                          {item.action_type === "created" || item.action_type === "created_global"
                            ? "creó una colección"
                            : "actividad sugerida"}
                        </span>
                      </p>
                      <p className="text-xs font-bold mt-0.5 opacity-80 capitalize">
                        {item.collection_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-50">{timeAgo(item.created_at)}</span>
                    <button className="btn btn-ghost btn-circle btn-xs">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>

                <Link to={`/collection/${item.collection_id}`}>
                  <div className="relative aspect-4/3 bg-base-200 w-full overflow-hidden cursor-pointer group">
                    <ItemCover
                      src={item.cover_url}
                      title={item.collection_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                      {item.collection_name}
                    </div>
                  </div>
                </Link>

                <div className="p-4 flex gap-4">
                  <button className="flex items-center gap-1 text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity">
                    <Heart size={18} /> Me gusta
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* COLUMNA DERECHA (SUGERIDOS) */}
        <div className="hidden md:block col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="border border-white/5 bg-base-200/50 rounded-2xl p-5">
              <h3 className="font-bold font-serif text-lg mb-4 text-primary">
                Tribers Sugeridos
              </h3>
              <div className="space-y-4">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <MiniUserCard
                      key={user.id}
                      user={{
                        id: user.id,
                        name: user.name,
                        handle: user.handle,
                        img: user.img,
                        isFollowing: false,
                      }}
                    />
                  ))
                ) : (
                  <div className="opacity-50 text-sm">No hay sugerencias por ahora.</div>
                )}
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