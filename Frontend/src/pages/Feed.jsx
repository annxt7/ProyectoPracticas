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
    const fetchMyFollowing = async () => {
      if (!myId) return;
      try {
        const res = await api.get(`/users/following/${myId}`);
        const ids = (res.data || []).map((u) => Number(u.id || u.user_id));
        setFollowingIds(ids);
      } catch (e) { console.error(e); }
    };
    fetchMyFollowing();
  }, [myId]);

  useEffect(() => {
    const fetchFeedData = async () => {
      if (!myId) return;
      setLoading(true);
      try {
        const [activityRes, suggestionsRes] = await Promise.all([
          api.get("/users/feed/activity"),
          api.get("/search/suggested")
        ]);

        // PROTECCIÓN EXTREMA: Normalizamos todos los campos de texto
        const safeActivity = (activityRes.data || [])
          .filter(item => item && Number(item.user_id) !== myId)
          .map(item => ({
            ...item,
            username: String(item.username || "usuario"),
            collection_name: String(item.collection_name || "Colección"),
            collection_type: String(item.collection_type || "Otros")
          }));

        setActivities(safeActivity);

        const normalizedSuggestions = (suggestionsRes.data || [])
          .map(u => normalizeUser(u))
          .filter(u => u && Number(u.id) !== myId);
        
        setSuggestedUsers(normalizedSuggestions);
      } catch (error) {
        console.error("Error en feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedData();
  }, [myId]);

  // Si el error de toLowerCase persiste, es probable que esté en ItemCover
  // Pasamos valores asegurados aquí también
  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 px-4">
        <div className="lg:col-span-8 space-y-6">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Feed</h1>

          {loading ? (
            <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <ShieldAlert size={48} className="mb-4" />
              <p>No hay actividad aún.</p>
            </div>
          ) : (
            activities.map((item, index) => (
              <div key={`act-${index}`} className="bg-base-100 border border-white/5 md:rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${item.user_id}`} className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-base-300">
                      <img src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.username}`} alt="" />
                    </Link>
                    <div>
                      <p className="text-sm font-bold">@{item.username}</p>
                      <p className="text-[10px] font-black uppercase text-primary">{item.collection_type}</p>
                    </div>
                  </div>
                </div>

                <Link to={`/collection/${item.collection_id}`}>
                  <div className="relative aspect-video bg-base-300 overflow-hidden group">
                    <ItemCover 
                      src={item.cover_url} 
                      title={String(item.collection_name || "Colección")} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 flex flex-col justify-end p-6">
                      <h2 className="text-white text-xl font-black uppercase italic">{item.collection_name}</h2>
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                   <button className="flex items-center gap-2 opacity-40">
                      <Heart size={20} />
                      <span>{item.likes || 0}</span>
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-primary">Sugerencias</h3>
            <div className="space-y-6">
              {suggestedUsers.map((u) => (
                <MiniUserCard key={`sug-${u.id}`} user={u} isFollowing={followingIds.includes(Number(u.id))} />
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