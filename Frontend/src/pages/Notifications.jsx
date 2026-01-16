import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Heart, UserPlus, MessageSquare, Bell, Info, Filter as FilterIcon, CheckCircle } from "lucide-react";
import api from "../services/api.js";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";

const Activity = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // Carga inicial de datos desde el Backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/activity");
      // El backend ya devuelve 'read' (booleano) y la estructura mapeada
      setNotifications(res.data);
    } catch (err) {
      console.error("❌ Error de sincronización:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // MARCAR UNA COMO LEÍDA (Persistente en DB)
  const markAsRead = async (id) => {
    try {
      await api.put(`/activity/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Error al actualizar notificación:", err);
    }
  };

  // MARCAR TODAS COMO LEÍDAS (Persistente en DB)
  const markAllAsRead = async () => {
    try {
      await api.put("/activity/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error al marcar todas como leídas:", err);
    }
  };

  // Lógica de Filtrado
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const isInteraction = n.type === 'like_collection' || n.type === 'comment';
      const isFollow = n.type === 'follow';
      
      if (activeFilter === "all") return true;
      if (activeFilter === "interactions") return isInteraction;
      if (activeFilter === "follows") return isFollow;
      return true;
    });
  }, [notifications, activeFilter]);

  return (
    <div className="min-h-screen pb-28 md:pb-10 bg-base-100 text-white font-sans">
      <NavDesktop />
      
      <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Actividad</h2>
          </div>

          {/* Botón intuitivo para marcar todas */}
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
            >
              Limpiar pendientes
            </button>
          )}
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-8">
        
        {/* Filtros Lateral */}
        <aside className="hidden lg:block space-y-6">
          <section>
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
              <FilterIcon size={12} /> Filtrar por
            </h4>
            <div className="flex flex-col gap-1">
              {[
                { id: 'all', label: 'Todo' },
                { id: 'interactions', label: 'Likes & Feedback' },
                { id: 'follows', label: 'Nuevos Seguidores' }
              ].map(f => (
                <button 
                  key={f.id} 
                  onClick={() => setActiveFilter(f.id)}
                  className={`text-left text-xs p-3 rounded-xl transition-all ${
                    activeFilter === f.id ? 'bg-primary/20 text-primary font-bold' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* Feed Principal */}
        <main className="max-w-2xl w-full mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><span className="loading loading-spinner text-primary"></span></div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map(n => (
                <NotificationItem 
                  key={n.id} 
                  data={n} 
                  onMarkRead={() => !n.read && markAsRead(n.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
              <Info className="mx-auto mb-4 opacity-10" size={40} />
              <p className="opacity-30 text-sm">No hay actividad por aquí</p>
            </div>
          )}
        </main>

        {/* Resumen Lateral (Sin IDs técnicos) */}
        <aside className="hidden lg:block">
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 text-center">
            <h4 className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-6">Estado</h4>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">
                  {notifications.filter(n => !n.read).length}
                </span>
                <span className="text-[9px] opacity-40 uppercase font-black">Nuevos avisos</span>
              </div>
              <div className="h-[1px] bg-white/5 w-8 mx-auto"></div>
              <p className="text-[11px] opacity-40 leading-relaxed px-2">
                Mantente al día con quienes interactúan con tus colecciones.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <NavMobile />
    </div>
  );
};

// Componente de Item Individual
const NotificationItem = ({ data, onMarkRead }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'follow': return { icon: UserPlus, color: 'text-blue-400' };
      case 'like_collection': return { icon: Heart, color: 'text-pink-500' };
      default: return { icon: MessageSquare, color: 'text-primary' };
    }
  };

  const { icon: Icon, color } = getIcon();

  return (
    <div 
      onClick={onMarkRead}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
        data.read 
          ? "bg-transparent border-transparent opacity-40 grayscale-[0.5]" 
          : "bg-white/[0.05] border-white/10 hover:border-primary/40 hover:bg-white/[0.08]"
      }`}
    >
      <div className="relative flex-none">
        <img 
          src={data.user?.avatar || `https://ui-avatars.com/api/?name=${data.user?.name}&background=random`} 
          className="w-12 h-12 rounded-full object-cover border border-white/10"
          alt=""
        />
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-base-100 flex items-center justify-center border border-white/5 ${color}`}>
          <Icon size={12} strokeWidth={3} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-bold">@{data.user?.name.toLowerCase()}</span> {data.content}
        </p>
        <span className="text-[10px] opacity-30 font-medium">
          {new Date(data.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      <div className="flex-none">
        {!data.read ? (
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_#570df8] animate-pulse"></div>
        ) : (
          <CheckCircle size={14} className="opacity-10" />
        )}
      </div>
    </div>
  );
};

export default Activity;