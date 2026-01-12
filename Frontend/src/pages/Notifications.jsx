import React, { useState, useMemo, useEffect } from "react";
import {
  Heart,
  UserPlus,
  MessageSquare,
  Zap,
  CheckCheck,
  Filter as FilterIcon
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import api from "../services/api.js";

const Activity = () => {
  const [activeFilter, setActiveFilter] = useState("all"); 
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Endpoint que devuelve las notificaciones del usuario logueado
      const res = await api.get("/activity"); 
      setNotifications(res.data);
    } catch (error) {
      console.error("Error cargando actividad:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    if (notifications.filter(n => !n.read).length === 0) return;
    try {
      await api.put("/activity/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  // Marcar una sola notificación como leída al hacer click
  const markAsRead = async (id) => {
    try {
      await api.put(`/activity/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const stats = useMemo(() => ({
    followers: notifications.filter(n => n.type === "follow").length,
    interactions: notifications.filter(n => n.type?.includes("like") || n.type === "comment").length,
    mentions: notifications.filter(n => n.type === "comment").length
  }), [notifications]);

  const filteredNotifications = notifications.filter(n => {
    const matchesType = activeFilter === "all" || 
      (activeFilter === "interactions" && (n.type?.includes("like") || n.type === "comment")) ||
      (activeFilter === "follows" && n.type === "follow");
    
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "unread" && !n.read) ||
      (statusFilter === "read" && n.read);

    return matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen pb-28 md:pb-10 font-sans text-base-content flex flex-col bg-base-100">
      <NavDesktop />
      
      <div className="max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-8">
        
        {/* PANEL IZQUIERDO: FILTROS */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-4 flex items-center gap-2 text-white">
                <FilterIcon size={12} /> Tipo
              </h4>
              <nav className="flex flex-col gap-1">
                {['all', 'interactions', 'follows'].map((f) => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`text-left text-sm py-2 px-3 rounded-xl transition-all ${activeFilter === f ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-base-200 opacity-60'}`}>
                    {f === 'all' ? 'Todo' : f === 'interactions' ? 'Interacciones' : 'Seguidores'}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-4 text-white">Estado</h4>
              <nav className="flex flex-col gap-1">
                {['all', 'unread', 'read'].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-left text-sm py-2 px-3 rounded-xl transition-all ${statusFilter === s ? 'bg-white/10 text-white font-semibold' : 'hover:bg-base-200 opacity-60'}`}>
                    {s === 'all' ? 'Cualquier estado' : s === 'unread' ? 'Pendientes' : 'Leído'}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* COLUMNA CENTRAL: ACTIVIDAD */}
        <main className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Actividad</h2>
            <button onClick={markAllAsRead} className="flex items-center gap-2 text-xs font-medium opacity-50 hover:opacity-100 transition-opacity active:scale-95">
              <CheckCheck size={14} /> Marcar todo como leído
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg opacity-20"></span>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredNotifications.length > 0 ? (
                <>
                  {/* SECCIÓN PENDIENTES */}
                  {(statusFilter === 'all' || statusFilter === 'unread') && (
                    <section>
                      <h3 className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-4 pl-2">Pendientes</h3>
                      <div className="flex flex-col gap-2">
                        {filteredNotifications.filter(n => !n.read).length > 0 ? (
                          filteredNotifications.filter(n => !n.read).map(n => 
                            <NotificationItem key={n.id} data={n} onRead={() => markAsRead(n.id)} />
                          )
                        ) : (
                          <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30 text-sm italic">
                            No hay notificaciones nuevas
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* SECCIÓN LEÍDO */}
                  {(statusFilter === 'all' || statusFilter === 'read') && filteredNotifications.filter(n => n.read).length > 0 && (
                    <section>
                      <h3 className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-4 pl-2">Leído</h3>
                      <div className="flex flex-col gap-2 opacity-80">
                        {filteredNotifications.filter(n => n.read).map(n => 
                          <NotificationItem key={n.id} data={n} />
                        )}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className="text-center py-20 opacity-40">No se encontró actividad con estos filtros.</div>
              )}
            </div>
          )}
        </main>

        {/* PANEL DERECHO: RESUMEN */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="p-6 rounded-[2rem] border border-white/5 bg-base-200/40 backdrop-blur-sm">
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-6 text-white">Resumen</h4>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium opacity-60">Seguidores</span>
                  <span className="text-sm font-black text-blue-400">+{stats.followers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium opacity-60">Reacciones</span>
                  <span className="text-sm font-black text-pink-400">{stats.interactions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium opacity-60">Comentarios</span>
                  <span className="text-sm font-black text-green-400">{stats.mentions}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <NavMobile />
    </div>
  );
};

const NotificationItem = ({ data, onRead }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const formatTime = (dateString) => {
    if (!dateString) return "Ahora";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `ahora`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    try {
      await api.post(`/users/follow/${data.user.id}`);
      setIsFollowing(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      onClick={!data.read ? onRead : undefined}
      className={`
        relative group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 border border-white/5
        ${data.read ? "hover:bg-white/5 opacity-70" : "bg-white/[0.03] hover:bg-white/[0.07]"}
        ${!data.read ? "cursor-pointer" : ""}
      `}
    >
      {!data.read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--p),0.8)]"></div>
      )}

      <div className="relative flex-none">
        {data.type === "system" ? (
          <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
            <Zap size={20} />
          </div>
        ) : (
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-base-100 ring-offset-2 overflow-hidden bg-base-300">
              <img 
                src={data.user?.avatar || `https://ui-avatars.com/api/?name=${data.user?.name}`} 
                alt={data.user?.name} 
              />
            </div>
            <div className={`
              absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-base-100 text-white text-[10px]
              ${data.type?.includes("like") ? "bg-pink-500" : data.type === "follow" ? "bg-blue-500" : "bg-green-500"}
            `}>
              {data.type?.includes("like") && <Heart size={10} fill="currentColor" />}
              {data.type === "follow" && <UserPlus size={10} />}
              {data.type === "comment" && <MessageSquare size={10} />}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-sm leading-snug">
          {data.type !== "system" && (
            <span className="font-bold hover:text-primary text-white mr-1 transition-colors">
              {data.user?.name || "Usuario"}
            </span>
          )}
          <span className="opacity-80">{data.content}</span>{" "}
          {data.target && <span className="font-medium text-white">"{data.target}"</span>}
          {data.commentSnippet && (
            <span className="block mt-1 text-xs opacity-60 pl-2 border-l-2 border-white/10 italic">
              {data.commentSnippet}
            </span>
          )}
        </div>
        <span className="text-[10px] opacity-40 mt-1 block uppercase tracking-wider">
          {formatTime(data.created_at)}
        </span>
      </div>

      <div className="flex-none self-center">
        {data.type === "follow" && !isFollowing && (
          <button 
            onClick={handleFollow}
            className="btn btn-xs btn-primary rounded-full px-4 text-[10px] font-bold"
          >
            Seguir
          </button>
        )}
        {isFollowing && <span className="text-[10px] opacity-40 font-bold px-2">Siguiendo</span>}
        
        {(data.type?.includes("like") || data.type === "comment") && data.image && (
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shadow-sm">
            <img src={data.image} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;