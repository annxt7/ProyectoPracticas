import React, { useState, useEffect } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import MiniUserCard from "../components/MiniUserCard.jsx";
import NavDesktop from "../components/NavDesktop.jsx";
import NavMobile from "../components/NavMobile.jsx";
import api from "../services/api.js";

const Feed = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper para calcular "Hace cuanto tiempo"
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
  //FEED DE ACTIVIDAD
  useEffect(() => {
    const fetchFeedData = async () => {
      setLoading(true);
      try {
        //Actividad del feed
        const activityRes = await api.get("/users/feed/activity");
        setActivities(activityRes.data);
        // Usuarios sugeridos
        const suggestionsRes = await api.get("/search/sugested");
        setSuggestedUsers(suggestionsRes.data);
      } catch (error) {
        console.error("Error cargando feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, []);

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
              No hay actividad reciente. ¡Sigue a alguien!
            </div>
          ) : (
            activities.map((item) => (
              <div
                key={`${item.action_type}-${item.collection_id}`}
                className="card border-b bg-base-100 border-white/5 md:border md:rounded-2xl md:shadow-sm overflow-hidden"
              >
                {/* CABECERA DEL POST */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/profile/${item.user_id}`}
                      className="avatar cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full ring ring-base-200 ring-offset-1">
                        <img
                          src={
                            item.avatar_url ||
                            `https://ui-avatars.com/api/?name=${item.username}&background=random`
                          }
                          alt={item.username}
                        />
                      </div>
                    </Link>
                    <div className="text-sm">
                      <p className="font-semibold leading-none">
                        <Link
                          to={`/profile/${item.user_id}`}
                          className="hover:underline"
                        >
                          {item.username}
                        </Link>{" "}
                        <span className="font-normal opacity-70">
                          {item.action_type === "created"
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
                    <span className="text-xs opacity-50">
                      {timeAgo(item.created_at)}
                    </span>
                    <button className="btn btn-ghost btn-circle btn-xs">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>

                {/* IMAGEN / CONTENIDO */}
                <Link to={`/collection/${item.collection_id}`}>
                  <div className="relative aspect-[4/3] bg-base-200 w-full overflow-hidden cursor-pointer group">
                    <ItemCover
                      src={item.cover_url}
                      title={item.collection_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                      {item.collection_name}
                    </div>

                    {/* Botón Like Flotante */}
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                      <button
                        className="flex items-center gap-1 group/btn"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Like!");
                        }}
                      >
                        <Heart
                          size={20}
                          className="group-hover/btn:text-red-500 transition-colors"
                        />
                      </button>
                    </div>
                  </div>
                </Link>

                {/* PIE DEL POST */}
                <div className="p-4 flex gap-4">
                  <div className="text-sm font-semibold opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
                    Me gusta
                  </div>
                  {/* Puedes añadir lógica de comentarios aquí en el futuro */}
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
                      key={user.userId} // Asegúrate que tu backend devuelve userId o id
                      user={{
                        id: user.userId, // Adaptamos si tu backend devuelve userId
                        name: user.username,
                        handle: "@" + user.username,
                        img: user.avatar,
                        isFollowing: false, // Por defecto en sugerencias
                      }}
                    />
                  ))
                ) : (
                  <div className="opacity-50 text-sm">
                    No hay sugerencias por ahora.
                  </div>
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
