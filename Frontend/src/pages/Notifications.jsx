import React, { useState, useMemo, useEffect } from "react";
import {
  Heart,
  UserPlus,
  MessageSquare,
  Zap,
  CheckCheck,
  Filter as FilterIcon,
  Sparkles,
  Bell
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
      const res = await api.get("/activity"); 
      setNotifications(res.data || []);
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
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount === 0) return;
    try {
      await api.put("/activity/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

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
      
      {/* HEADER STICKY */}
      <div className="sticky top-0 md:top-16 z-30 bg-base-100/80 backdrop-blur-md border-b border-white/5 py-6">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Actividad</h2>
          </div>
          <button 
            onClick={markAllAsRead} 
            className="btn btn-ghost btn-xs text-[10px] uppercase tracking-wider opacity-50 hover:opacity-100 hover:bg-transparent"
          >
            <CheckCheck size={14} className="mr-1" /> Marcar todo
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-8">
        
        {/* IZQUIERDA: FILTROS */}
        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-8">
            <section>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4 flex items-center gap-2">
                <FilterIcon size={12} /> Filtrar por
              </h4>
              <nav className="flex flex-col gap-1">
                {[
                  { id: 'all', label: 'Todo' },
                  { id: 'interactions', label: 'Interacciones' },
                  { id: 'follows', label: 'Seguidores' }
                ].map((f) => (
                  <button key={f.id} onClick={() => setActiveFilter(f.id)}
                    className={`text-left text-xs py-2.5 px-4 rounded-xl transition-all ${activeFilter === f.id ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-white/[0.03] opacity-50'}`}>
                    {f.label}
                  </button>
                ))}
              </nav>
            </section>

            <section>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-4">Estado</h4>
              <nav className="flex flex-col gap-1">
                {[
                  { id: 'all', label: 'Cualquier estado' },
                  { id: 'unread', label: 'No leídos' },
                  { id: 'read', label: 'Leídos' }
                ].map((s) => (
                  <button key={s.id} onClick={() => setStatusFilter(s.id)}
                    className={`text-left text-xs py-2.5 px-4 rounded-xl transition-all ${statusFilter === s.id ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/[0.03] opacity-40'}`}>
                    {s.label}
                  </button>
                ))}
              </nav>
            </section>
          </div>
        </aside>

        {/* CENTRO: FEED */}
        <main className="max-w-2xl w-full mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-dots loading-md text-primary/40"></span>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredNotifications.length > 0 ? (
                <>
                  {/* SECCIÓN PENDIENTES */}
                  {(statusFilter === 'all' || statusFilter === 'unread') && (
                    <section>
                      <h3 className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        Pendientes
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </h3>
                      <div className="flex flex-col gap-3">
                        {filteredNotifications.filter(n => !n.read).length > 0 ? (
                          filteredNotifications.filter(n => !n.read).map(n => 
                            <NotificationItem key={n.id} data={n} onRead={() => markAsRead(n.id)} />
                          )
                        ) : (
                          <div className="p-10 text-center border border-white/5 rounded-[2rem] bg-white/[0.01] opacity-20 text-xs italic">
                            No hay nada nuevo por aquí
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* SECCIÓN LEÍDO */}
                  {(statusFilter === 'all' || statusFilter === 'read') && filteredNotifications.filter(n => n.read).length > 0 && (
                    <section>
                      <h3 className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 mt-4">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        Anteriores
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </h3>
                      <div className="flex flex-col gap-3">
                        {filteredNotifications.filter(n => n.read).map(n => 
                          <NotificationItem key={n.id} data={n} />
                        )}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className="text-center py-32 opacity-20 italic text-sm">Sin actividad que mostrar</div>
              )}
            </div>
          )}
        </main>

        {/* DERECHA: RESUMEN */}
        <aside className="hidden lg:block">
          <div className="sticky top-48">
            <div className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-30 font-bold mb-8">Resumen Semanal</h4>
              <div className="space-y-6">
                {[
                  { label: 'Nuevos Fans', val: stats.followers, color: 'text-blue-400' },
                  { label: 'Reacciones', val: stats.interactions, color: 'text-pink-400' },
                  { label: 'Comentarios', val: stats.mentions, color: 'text-green-400' }
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-end">
                    <span className="text-[11px] font-medium opacity-40 uppercase tracking-wider">{stat.label}</span>
                    <span className={`text-xl font-black ${stat.color}`}>{stat.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-3 opacity-30">
                <Sparkles size={14} className="text-primary" />
                <p className="text-[10px] leading-tight">Tu perfil está creciendo un 12% más rápido que ayer.</p>
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
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    try {
      await api.post(`/users/follow/${data.user.id}`);
      setIsFollowing(true);
    } catch (error) { console.error(error); }
  };

  return (
    <div
      onClick={!data.read ? onRead : undefined}
      className={`
        relative group flex items-start gap-4 p-5 rounded-[1.5rem] transition-all duration-500 border
        ${data.read ? "bg-transparent border-transparent opacity-60 hover:opacity-100" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] shadow-lg"}
        ${!data.read ? "cursor-pointer" : ""}
      `}
    >
      {!data.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--p),0.5)]"></div>
      )}

      <div className="relative flex-none">
        {data.type === "system" ? (
          <div className="w-11 h-11 rounded-2xl bg-base-300 flex items-center justify-center text-primary/50">
            <Zap size={22} />
          </div>
        ) : (
          <div className="avatar">
            <div className="w-11 h-11 rounded-2xl bg-base-300 ring-2 ring-white/5 ring-offset-2 ring-offset-base-100">
              <img src={data.user?.avatar || `https://ui-avatars.com/api/?name=${data.user?.name}&background=random`} alt="" />
            </div>
            <div className={`
              absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center border-2 border-base-100 text-white text-[10px] shadow-xl
              ${data.type?.includes("like") ? "bg-pink-500" : data.type === "follow" ? "bg-blue-500" : "bg-green-500"}
            `}>
              {data.type?.includes("like") && <Heart size={10} fill="currentColor" />}
              {data.type === "follow" && <UserPlus size={10} />}
              {data.type === "comment" && <MessageSquare size={10} />}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] leading-relaxed text-white/90">
          {data.type !== "system" && (
            <span className="font-bold text-white mr-1.5">{data.user?.name || "Usuario"}</span>
          )}
          <span className="opacity-60">{data.content}</span>{" "}
          {data.target && <span className="font-semibold text-primary/80">"{data.target}"</span>}
          {data.commentSnippet && (
            <span className="block mt-2 text-xs opacity-40 pl-3 border-l border-white/10 italic leading-snug">
              {data.commentSnippet}
            </span>
          )}
        </div>
        <span className="text-[9px] opacity-20 mt-2 block font-black uppercase tracking-tighter">
          hace {formatTime(data.created_at)}
        </span>
      </div>

      <div className="flex-none self-center">
        {data.type === "follow" && !isFollowing && (
          <button onClick={handleFollow} className="btn btn-xs btn-primary rounded-xl px-4 text-[10px] font-bold shadow-lg shadow-primary/20">
            Seguir
          </button>
        )}
        {isFollowing && <span className="text-[10px] opacity-30 font-bold px-2">Amigos</span>}
        
        {(data.type?.includes("like") || data.type === "comment") && data.image && (
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 group-hover:scale-110 transition-transform duration-300">
            <img src={data.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;