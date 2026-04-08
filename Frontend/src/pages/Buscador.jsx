import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ItemCover from "../components/ItemCover";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { normalizeUser, normalizeCollection } from "../services/normalizers";
import NavDesktop from "../components/NavDesktop";
import NavMobile from "../components/NavMobile";

const Explorer = () => {
  const { t } = useTranslation(); 
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("accounts"); 
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const { user: currentUser } = useAuth();
  const myId = currentUser ? Number(currentUser.id || currentUser.user_id) : null;

  useEffect(() => {
    if (!myId) return;
    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${myId}`);
        const ids = (res.data || []).map((u) => Number(normalizeUser(u).id));
        setFollowingIds(ids);
      } catch (err) {
        console.error("Error al cargar seguidos:", err);
      }
    };
    fetchFollowing();
  }, [myId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?query=${encodeURIComponent(query)}`);
        const data = res.data;
        const cleanUsers = (data.users || [])
          .map((u) => normalizeUser(u))
          .filter((u) => Number(u.id) !== myId && u.role !== "admin");
        const cleanCollections = (data.collections || [])
          .map((c) => normalizeCollection(c))
          .filter((c) => Number(c.creatorId) !== myId);
        setUsers(cleanUsers);
        setCollections(cleanCollections);
      } catch (err) {
        console.error("Error en el buscador:", err);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(fetchData, 400); 
    return () => clearTimeout(timeoutId);
  }, [query, myId]);

  const handleFollowToggle = async (targetId, isFollowing) => {
    if (!myId) return alert(t("explorer.login_alert"));
    const id = Number(targetId);
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${id}`);
        setFollowingIds((prev) => prev.filter((fid) => fid !== id));
      } else {
        await api.post(`/users/follow/${id}`);
        setFollowingIds((prev) => [...prev, id]);
      }
    } catch (err) {
      console.error("Error en Follow Toggle:", err);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-base-300 text-base-content font-sans">
      <NavDesktop />

      <div className="sticky top-0 md:top-16 z-40 bg-base-200/80 backdrop-blur-md p-4 border-b border-base-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("explorer.search_placeholder")} 
              className="w-full bg-base-100 border border-base-300 rounded-2xl py-3 pl-12 pr-10 outline-none focus:border-primary/50 transition-all text-sm"
            />
            {query && (
              <X
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 cursor-pointer hover:opacity-100"
                size={16}
                onClick={() => setQuery("")}
              />
            )}
          </div>

          <div className="flex justify-center gap-12">
            {[
              { id: "accounts", label: t("explorer.tab_accounts") },
              { id: "collections", label: t("explorer.tab_collections") }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                {tab.label} 
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 mt-4">
        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}

        {!loading && activeTab === "accounts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length === 0 && (
              <p className="text-center opacity-40 col-span-full py-10">
                {t("explorer.no_users")}
              </p>
            )}
            {users.map((u) => {
              const isFollowing = followingIds.includes(Number(u.id));
              return (
                <div key={u.id} className="flex items-center justify-between p-4 bg-base-200 rounded-2xl border border-base-100 hover:border-primary/20 transition-all shadow-sm">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-base-300 border border-base-100">
                      <img
                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random&color=fff`}
                        className="w-full h-full object-cover"
                        alt={u.username}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">@{u.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(u.id, isFollowing)}
                    className={`btn btn-xs px-5 rounded-lg font-bold transition-all ${
                      isFollowing ? "btn-ghost bg-base-300" : "btn-primary"
                    }`}
                  >
                    {isFollowing ? t("explorer.btn_following") : t("explorer.btn_follow")}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && activeTab === "collections" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.length === 0 && (
              <p className="text-center opacity-40 col-span-full py-10">
                {t("explorer.no_collections")}
              </p>
            )}
            {collections.map((col) => (
              <Link key={col.id} to={`/collection/${col.id}`} className="group">
                <div className="flex flex-col gap-3">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-base-200 border border-base-200 group-hover:border-primary/40 transition-all relative shadow-sm">
                    <ItemCover src={col.cover} title={col.title} className="group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="px-1">
                    <h3 className="font-bold truncate text-[13px] group-hover:text-primary transition-colors">{col.title}</h3>
                    <p className="text-[10px] text-color-secondary font-extrabold uppercase">@{col.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <NavMobile />
    </div>
  );
};

export default Explorer;