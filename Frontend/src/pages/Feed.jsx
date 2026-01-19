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

  useEffect(() => {
    const fetchFeedData = async () => {
      if (!myId) return;
      setLoading(true);
      try {
        const [activityRes, suggestionsRes, followingRes] = await Promise.all([
          api.get("/users/feed/activity"),
          api.get("/search/suggested"),
          api.get(`/users/following/${myId}`)
        ]);

        // Saneamiento profundo
        const safeActivity = (activityRes.data || [])
          .filter(item => item && item.username && item.collection_id) // Solo items válidos
          .filter(item => Number(item.user_id) !== myId)
          .map(item => ({
            ...item,
            username: String(item.username || "usuario"),
            collection_name: String(item.collection_name || "Colección"),
            collection_type: String(item.collection_type || "Otros")
          }));

        setActivities(safeActivity);
        setFollowingIds((followingRes.data || []).map(u => Number(u.id || u.user_id)));
        setSuggestedUsers((suggestionsRes.data || [])
          .map(u => normalizeUser(u))
          .filter(u => u && u.username && Number(u.id) !== myId));
          
      } catch (error) {
        console.error("Error en feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedData();
  }, [myId]);

  // Handler de Like (con validación de ID)
  const handleToggleLike = async (collectionId) => {
    if (!collectionId) return;
    try {
      const res = await api.post(`/collections/like/${collectionId}`);
      if (res.data.success) {
        setActivities(prev => prev.map(item => 
          item.collection_id === collectionId 
            ? { ...item, has_liked: res.data.liked, likes: res.data.liked ? (item.likes || 0) + 1 : Math.max(0, (item.likes || 0) - 1) } 
            : item
        ));
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content">
      <NavDesktop />
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 px-4">
        
        <div className="lg:col-span-8 space-y-6">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Actividad</h1>

          {loading ? (
            <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center py-20 opacity-30">
              <ShieldAlert size={48} className="mb-4" />
              <p className="font-bold">No hay actividad para mostrar</p>
            </div>
          ) : (
            activities.map((item) => (
              <div key={`${item.collection_id}-${item.user_id}`} className="bg-base-100 border border-white/5 md:rounded-3xl overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${item.user_id}`} className="w-10 h-10 rounded-full overflow-hidden bg-base-200 border border-white/10">
                      <img src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}`} alt="" />
                    </Link>
                    <div>
                      <p className="text-sm font-bold">@{item.username}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">{item.collection_type}</p>
                    </div>
                  </div>
                </div>

                <Link to={`/collection/${item.collection_id}`}>
                  <div className="relative aspect-video bg-base-200 overflow-hidden group">
                    <ItemCover src={item.cover_url} title={item.collection_name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                      <h2 className="text-white text-xl font-black uppercase italic tracking-tight">{item.collection_name}</h2>
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <button 
                    onClick={() => handleToggleLike(item.collection_id)}
                    className={`flex items-center gap-2 text-sm font-black transition-all ${item.has_liked ? "text-error" : "opacity-40 hover:opacity-100"}`}
                  >
                    <Heart size={20} fill={item.has_liked ? "currentColor" : "none"} strokeWidth={3} />
                    <span>{item.likes || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sugerencias laterales */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-primary">Descubrir Tribers</h3>
            <div className="space-y-6">
              {suggestedUsers.map((u) => (
                <MiniUserCard 
                  key={u.id} 
                  user={u} 
                  isFollowing={followingIds.includes(Number(u.id))} 
                  onFollowToggle={() => {/* tu lógica de follow */}} 
                />
              ))}
            </div>
          </div>
        </div>

      </main>
      <NavMobile />
    </div>
  );
};

export default Feed;