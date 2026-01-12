import React, { useState, useEffect } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import ItemCover from "../components/ItemCover.jsx";
import MiniUserCard from "../components/MiniUserCard.jsx";
import NavDesktop from "../components/NavDesktop.jsx";
import NavMobile from "../components/NavMobile.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Feed = () => {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);

  useEffect(() => {
    const fetchMyFollowing = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/users/following/${user.id}`);
        const ids = res.data.map(u => String(u.id || u.user_id));
        setFollowingIds(ids);
      } catch (e) {
        console.error("Error cargando mis seguidos", e);
      }
    };

    fetchMyFollowing();
  }, [user?.id]);

  // 2. Cargar Feed y Sugerencias
  useEffect(() => {
    const fetchFeedData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [activityRes, suggestionsRes] = await Promise.all([
          api.get("/users/feed/activity"),
          api.get("/search/suggested")
        ]);

        // Filtrar para no mostrar mi propia actividad en el feed
        const filteredActivity = activityRes.data.filter(item => 
          String(item.user_id) !== String(user.id)
        );
        setActivities(filteredActivity);

        // Filtrar para no sugerirme a mí mismo
        const filteredSuggestions = suggestionsRes.data.filter(u => 
          String(u.id || u.user_id) !== String(user.id)
        );
        setSuggestedUsers(filteredSuggestions);

      } catch (error) {
        console.error("Error cargando feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, [user?.id]);

  // 3. Manejar Follow/Unfollow
  const handleFollowToggle = async (targetId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await api.delete(`/users/unfollow/${targetId}`);
        setFollowingIds(prev => prev.filter(id => id !== String(targetId)));
      } else {
        await api.post(`/users/follow/${targetId}`);
        setFollowingIds(prev => [...prev, String(targetId)]);
      }
    } catch (error) {
      console.error("Error follow toggle:", error);
    }
  };
  
  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Ahora";
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
    return "Hace poco";
  }

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
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-20 bg-base-200/30 rounded-3xl border-2 border-dashed border-base-300">
              <p className="opacity-50 text-lg">No hay actividad reciente.</p>
              <p className="text-sm opacity-40">¡Sigue a más personas para llenar tu feed!</p>
            </div>
          ) : (
            activities.map((item) => (
              <div
                key={`${item.action_type}-${item.collection_id}-${item.created_at}`}
                className="card border-b bg-base-100 border-white/5 md:border md:rounded-2xl md:shadow-sm overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${item.user_id}`} className="avatar">
                      <div className="w-10 h-10 rounded-full ring ring-primary/10">
                        <img
                          src={item.avatar || item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random`}
                          alt={item.username}
                        />
                      </div>
                    </Link>
                    <div className="text-sm">
                      <p className="font-semibold">
                        <Link to={`/profile/${item.user_id}`} className="hover:text-primary transition-colors">
                          {item.username}
                        </Link>{" "}
                        <span className="font-normal opacity-70">
                          {item.action_type?.includes("created") ? "creó una colección" : "actualizó su perfil"}
                        </span>
                      </p>
                      <p className="text-xs font-bold opacity-60 capitalize">
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
                  <div className="relative aspect-video bg-base-200 w-full overflow-hidden group">
                    <ItemCover
                      src={item.cover_url}
                      title={item.collection_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                      {item.collection_name}
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <button className="btn btn-ghost btn-sm gap-2">
                    <Heart size={18} />
                    <span>Me gusta</span>
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
                  suggestedUsers.map((u) => {
                    const targetId = String(u.id || u.user_id);
                    const isFollowing = followingIds.includes(targetId);
                    
                    return (
                      <MiniUserCard
                        key={targetId}
                        user={{
                          id: targetId,
                          name: u.username || u.name,
                          handle: u.username,
                          img: u.avatar || u.avatar_url,
                          isFollowing: isFollowing,
                          onFollowToggle: () => handleFollowToggle(targetId, isFollowing),
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="opacity-50 text-sm italic text-center py-4">No hay sugerencias nuevas.</div>
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