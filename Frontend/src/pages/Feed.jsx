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
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  // Cargar seguidos
  useEffect(() => {
    if (!user?.id) return;
    const fetchMyFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        // Normalizamos los IDs a String para comparar correctamente
        setFollowingIds(res.data.map(u => String(u.id || u.user_id)));
      } catch (e) {
        console.error("Error cargando mis seguidos", e);
      }
    };
    fetchMyFollowing();
  }, [user?.id]);

  // Cargar actividad y sugerencias
  useEffect(() => {
    if (!user?.id) return;
    const fetchFeedData = async () => {
      setLoading(true);
      try {
        const activityRes = await api.get("/users/feed/activity");
        const filteredActivity = activityRes.data.filter(item => 
          String(item.user_id) !== String(user.id)
        );
        setActivities(filteredActivity);

        const suggestionsRes = await api.get("/search/suggested");
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

  const handleFollowToggle = async (targetId, currentlyFollowing) => {
    try {
      if (currentlyFollowing) {
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
    let interval = seconds / 3600;
    if (interval > 1 && interval < 24) return Math.floor(interval) + " h";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " d";
    return "Reciente";
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 px-4">
        
        <div className="md:col-span-2 space-y-6">
          <div className="md:hidden flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-serif">Tu Feed</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-10 opacity-50">No hay actividad reciente.</div>
          ) : (
            activities.map((item) => (
              <div key={`${item.collection_id}-${item.created_at}`} className="card border-b bg-base-100 border-white/5 md:border md:rounded-2xl md:shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${item.user_id}`} className="avatar">
                      <div className="w-10 h-10 rounded-full ring ring-base-200 ring-offset-1">
                        <img src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}&background=random`} alt={item.username} />
                      </div>
                    </Link>
                    <div className="text-sm">
                      <p className="font-semibold leading-none">
                        <Link to={`/profile/${item.user_id}`} className="hover:underline">{item.username}</Link>
                        <span className="font-normal opacity-70"> creó una colección</span>
                      </p>
                      <p className="text-xs font-bold mt-0.5 opacity-80 capitalize">{item.collection_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-50">{timeAgo(item.created_at)}</span>
                  </div>
                </div>

                <Link to={`/collection/${item.collection_id}`}>
                  <div className="relative aspect-4/3 bg-base-200 w-full overflow-hidden group">
                    <ItemCover src={item.cover_url} title={item.collection_name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                      {item.collection_name}
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <button className="flex items-center gap-1 text-sm font-semibold opacity-70 hover:opacity-100">
                    <Heart size={18} /> Me gusta
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="border border-white/5 bg-base-200/50 rounded-2xl p-5">
              <h3 className="font-bold font-serif text-lg mb-4 text-primary">Tribers Sugeridos</h3>
              <div className="space-y-4">
                {suggestedUsers.map((u) => {
                  const targetId = String(u.id || u.user_id);
                  const isFollowingThis = followingIds.includes(targetId);
                  return (
                    <MiniUserCard
                      key={targetId}
                      user={{
                        id: targetId,
                        name: u.username || u.name,
                        handle: u.handle,
                        img: u.avatar || u.avatar_url,
                      }}
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