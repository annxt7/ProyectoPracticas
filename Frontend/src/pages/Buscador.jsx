import React, { useState, useEffect } from "react";
import { Search, X, TrendingUp, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  const { user } = useAuth();

  /* ======================
     MIS SEGUIDOS (igual que Profile)
  ====================== */
  useEffect(() => {
    if (!user?.id) return;

    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/users/following/${user.id}`);
        setFollowingIds(res.data.map(u => u.id));
      } catch (err) {
        console.error("Error cargando seguidos:", err);
      }
    };

    fetchFollowing();
  }, [user?.id]);

  /* ======================
     FOLLOW / UNFOLLOW
  ====================== */
  const handleFollowToggle = async (targetId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${targetId}`);
        setFollowingIds(prev => prev.filter(id => id !== targetId));
      } else {
        await api.post(`/users/follow/${targetId}`);
        setFollowingIds(prev => [...prev, targetId]);
      }
    } catch (err) {
      console.error("Error follow toggle:", err);
    }
  };

  /* ======================
     BUSCADOR
  ====================== */
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl =
          window.location.hostname === "localhost"
            ? "http://localhost:3000"
            : "https://axel.informaticamajada.es";

        const token = localStorage
          .getItem("tribe_token")
          ?.replace(/['"]+/g, "");

        const res = await fetch(
          `${baseUrl}/api/search?query=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error API");
        const data = await res.json();

        // Filtrar mi propio usuario por ID (igual que Profile)
        const filteredUsers = (data.users || []).filter(
          u => String(u.id) !== String(user.id)
        );

        setUsers(filteredUsers);
        setCollections(data.collections || []);
      } catch (err) {
        console.error("Error búsqueda:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user?.id]);

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-base-100 text-base-content">
      <NavDesktop />

      {/* BUSCADOR */}
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full rounded-2xl py-3 pl-12 pr-10 bg-white/5 border border-white/10 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* TABS */}
          <div className="flex justify-center gap-8 border-b border-white/5">
            {["cuentas", "colecciones"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-bold capitalize ${
                  activeTab === tab
                    ? "text-primary"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center text-xs opacity-50 italic">
            Buscando...
          </div>
        )}

        {/* CUENTAS */}
        {activeTab === "cuentas" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {users.map(u => {
              const isFollowing = followingIds.includes(u.id);

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
                >
                  <Link
                    to={`/profile/${u.id}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <img
                      src={
                        u.img ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          u.name
                        )}&background=random&color=fff`
                      }
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{u.name}</h3>
                      <p className="text-xs opacity-40">{u.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() =>
                      handleFollowToggle(u.id, isFollowing)
                    }
                    className={`btn btn-xs rounded-full ${
                      isFollowing ? "btn-neutral" : "btn-primary"
                    }`}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* COLECCIONES */}
        {activeTab === "colecciones" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {collections.map(col => (
              <Link key={col.id} to={`/collection/${col.id}`}>
                <div className="rounded-3xl overflow-hidden border border-white/5">
                  <div className="aspect-video bg-white/5">
                    <ItemCover src={col.cover} title={col.title} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold truncate">{col.title}</h3>
                    <span className="text-xs text-primary">
                      {col.author}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NavMobile />
    </div>
  );
};

export default Explorer;
