import React, { useState, useMemo, useEffect } from "react";
import {
  Heart, UserPlus, MessageSquare, Zap, CheckCheck, Filter as FilterIcon, Sparkles, Bell
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
      console.log("🔍 [Activity] Solicitando notificaciones a /activity...");
      const res = await api.get("/activity"); 
      
      console.log("✅ [Activity] Datos recibidos del backend:", res.data);
      
      // Verificamos si los datos vienen como array
      if (!Array.isArray(res.data)) {
        console.error("⚠️ [Activity] Los datos recibidos no son un Array. Revisa el backend.");
      }
      
      setNotifications(res.data || []);
    } catch (error) {
      console.error("❌ [Activity] Error en fetchNotifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    console.log(`🔔 [Activity] Intentando marcar ${unreadCount} como leídas...`);
    
    if (unreadCount === 0) return;
    try {
      const res = await api.put("/activity/read-all");
      console.log("✅ [Activity] Respuesta de read-all:", res.data);
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("❌ [Activity] Error en markAllAsRead:", error);
    }
  };

  const markAsRead = async (id) => {
    console.log(`🎯 [Activity] Marcando notificación ID: ${id} como leída...`);
    try {
      const res = await api.put(`/activity/${id}/read`);
      console.log(`✅ [Activity] Notificación ${id} actualizada en BD:`, res.data);
      
      // Sincronización del estado local
      setNotifications(prev => {
        const updated = prev.map(n => {
          // IMPORTANTE: Verifica si tu backend usa .id o ._id
          const currentId = n.id || n._id;
          if (currentId === id) {
            return { ...n, read: true };
          }
          return n;
        });
        console.log("🔄 [Activity] Nuevo estado de notificaciones sincronizado.");
        return updated;
      });
    } catch (error) {
      console.error(`❌ [Activity] Error al marcar ID ${id}:`, error);
    }
  };

  // Log para ver el renderizado y los filtros activos
  console.log(`🖥️ [Render] Mostrando ${notifications.length} notificaciones. Filtro: ${activeFilter}, Estado: ${statusFilter}`);

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
            className="btn btn-ghost btn-xs text-[10px] uppercase tracking-wider opacity-50 hover:opacity-100"
          >
            <CheckCheck size={14} className="mr-1" /> Marcar todo
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-8">
        
        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-8">
            <section>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4 flex items-center gap-2">
                <FilterIcon size={12} /> Filtrar por
              </h4>
              <nav className="flex flex-col gap-1">
                {['all', 'interactions', 'follows'].map((f) => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`text-left text-xs py-2.5 px-4 rounded-xl transition-all ${activeFilter === f ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-white/[0.03] opacity-50'}`}>
                    {f === 'all' ? 'Todo' : f === 'interactions' ? 'Interacciones' : 'Seguidores'}
                  </button>
                ))}
              </nav>
            </section>

            <section>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-4">Estado</h4>
              <nav className="flex flex-col gap-1">
                {['all', 'unread', 'read'].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-left text-xs py-2.5 px-4 rounded-xl transition-all ${statusFilter === s ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/[0.03] opacity-40'}`}>
                    {s === 'all' ? 'Cualquier estado' : s === 'unread' ? 'No leídos' : 'Leídos'}
                  </button>
                ))}
              </nav>
            </section>
          </div>
        </aside>

        <main className="max-w-2xl w-full mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-dots loading-md text-primary/40"></span>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredNotifications.length > 0 ? (
                <>
                  {(statusFilter === 'all' || statusFilter === 'unread') && (
                    <section>
                      <h3 className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        Pendientes
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </h3>
                      <div className="flex flex-col gap-3">
                        {filteredNotifications.filter(n => !n.read).map(n => 
                          <NotificationItem key={n.id || n._id} data={n} onRead={() => markAsRead(n.id || n._id)} />
                        )}
                        {filteredNotifications.filter(n => !n.read).length === 0 && (
                          <div className="p-10 text-center border border-white/5 rounded-[2rem] bg-white/[0.01] opacity-20 text-xs italic">Todo al día</div>
                        )}
                      </div>
                    </section>
                  )}

                  {(statusFilter === 'all' || statusFilter === 'read') && filteredNotifications.filter(n => n.read).length > 0 && (
                    <section>
                      <h3 className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 mt-4">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        Anteriores
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </h3>
                      <div className="flex flex-col gap-3">
                        {filteredNotifications.filter(n => n.read).map(n => 
                          <NotificationItem key={n.id || n._id} data={n} />
                        )}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className="text-center py-32 opacity-20 italic text-sm">Sin actividad</div>
              )}
            </div>
          )}
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-48">
            <div className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-30 font-bold mb-8">Resumen</h4>
              <div className="space-y-6 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-40">Seguidores</span>
                  <span className="text-blue-400 font-bold">+{stats.followers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-40">Reacciones</span>
                  <span className="text-pink-400 font-bold">{stats.interactions}</span>
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

// --- COMPONENTE HIJO CON LOGS ---
const NotificationItem = ({ data, onRead }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  // Verificamos qué datos llegan a cada item
  // console.log(`Rendering Item ${data.id || data._id} - Read Status: ${data.read}`);

  const handleFollow = async (e) => {
    e.stopPropagation();
    console.log(`👤 Seguir usuario: ${data.user?.id || '?'}`);
    try {
      await api.post(`/users/follow/${data.user.id || data.user._id}`);
      setIsFollowing(true);
    } catch (error) { console.error(error); }
  };

  return (
    <div
      onClick={!data.read ? onRead : undefined}
      className={`
        relative group flex items-start gap-4 p-5 rounded-[1.5rem] transition-all duration-500 border
        ${data.read ? "bg-transparent border-transparent opacity-60" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] shadow-lg"}
      `}
    >
      {!data.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
      )}

      <div className="flex-none">
        <div className="avatar">
          <div className="w-11 h-11 rounded-2xl bg-base-300">
            <img src={data.user?.avatar || `https://ui-avatars.com/api/?name=${data.user?.name}&background=random`} alt="" />
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="text-[13px] text-white/90">
          <span className="font-bold text-white mr-1.5">{data.user?.name || "Usuario"}</span>
          <span className="opacity-60">{data.content}</span>
        </div>
        <span className="text-[9px] opacity-20 mt-2 block uppercase">hace poco</span>
      </div>

      <div className="flex-none">
        {data.type === "follow" && !isFollowing && (
          <button onClick={handleFollow} className="btn btn-xs btn-primary rounded-xl px-4">Seguir</button>
        )}
      </div>
    </div>
  );
};

export default Activity;