import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Heart, UserPlus, MessageSquare, Bell, CheckCheck, Info, Filter as FilterIcon } from "lucide-react";
import api from "../services/api.js";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";

const Activity = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  // 1. Carga de datos con validación de identidad (Concordancia de ID)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Validamos sesión primero para evitar errores 404 y obtener tu ID (19, 26, etc.)
      const userRes = await api.get("/users/me");
      setCurrentUser(userRes.data);

      // Obtenemos las notificaciones reales de la base de datos
      const res = await api.get("/activity");
      setNotifications(res.data || []);
      
    } catch (err) {
      console.error("❌ Error de sincronización:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // 2. Marcar como leído (Sincronización con la tabla Notifications)
  const markAsRead = async (id) => {
    // Cambio instantáneo en UI (Optimistic Update)
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    try { 
      await api.put(`/activity/${id}/read`); 
    } catch (e) { 
      fetchData(); // Si falla el servidor, revertimos al estado real
    }
  };

  // 3. Lógica de Filtrado (Mapea 'like_collection' de MariaDB a 'Interacciones')
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
      
      {/* Banner de Concordancia: Confirma si el Backend te reconoce */}
      {currentUser && (
        <div className="bg-primary/10 text-primary text-[10px] py-1 text-center border-b border-primary/20 tracking-widest uppercase font-bold">
          Sesión Sincronizada: {currentUser.username} (ID: {currentUser.id})
        </div>
      )}

      <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Actividad</h2>
          </div>
          <button className="btn btn-ghost btn-xs opacity-40 hover:opacity-100 transition-opacity">
            <CheckCheck size={14} className="mr-1" /> Leídas
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-8">
        
        {/* Sidebar de Filtros */}
        <aside className="hidden lg:block space-y-6">
          <section>
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
              <FilterIcon size={12} /> Filtrar por
            </h4>
            <div className="flex flex-col gap-1">
              {[
                { id: 'all', label: 'Todo' },
                { id: 'interactions', label: 'Interacciones' },
                { id: 'follows', label: 'Seguidores' }
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

        {/* Feed Principal de Notificaciones */}
        <main className="max-w-2xl w-full mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map(n => (
                <NotificationItem 
                  key={n.id} 
                  data={n} 
                  onRead={() => markAsRead(n.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
              <Info className="mx-auto mb-4 opacity-20" size={40} />
              <p className="opacity-40 text-sm italic font-light">No hay actividad registrada en tu cuenta</p>
            </div>
          )}
        </main>

        {/* Sidebar de Estadísticas Rápidas */}
        <aside className="hidden lg:block">
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
            <h4 className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-6 text-center">Resumen</h4>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="opacity-50">Total</span>
                <span className="font-bold">{notifications.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-50">Pendientes</span>
                <span className="text-primary font-bold">
                  {notifications.filter(n => !n.read).length}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <NavMobile />
    </div>
  );
};

// Sub-componente para cada item de notificación
const NotificationItem = ({ data, onRead }) => {
  // Asignación dinámica de iconos según el ENUM de MariaDB
  const getIcon = () => {
    switch (data.type) {
      case 'follow': return { icon: UserPlus, color: 'text-blue-400' };
      case 'like_collection': return { icon: Heart, color: 'text-pink-500' };
      case 'comment': return { icon: MessageSquare, color: 'text-emerald-400' };
      default: return { icon: Bell, color: 'text-primary' };
    }
  };

  const { icon: Icon, color } = getIcon();

  return (
    <div 
      onClick={!data.read ? onRead : undefined}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
        data.read 
          ? "bg-transparent border-transparent opacity-40" 
          : "bg-white/[0.05] border-white/10 hover:bg-white/[0.08] cursor-pointer"
      }`}
    >
      <div className="relative flex-none">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral border border-white/5">
          <img 
            src={data.user?.avatar || `https://ui-avatars.com/api/?name=${data.user?.name || 'U'}&background=random`} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-base-100 flex items-center justify-center border border-white/5 ${color}`}>
          <Icon size={12} strokeWidth={3} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug text-white/90">
          <span className="font-bold text-white">{data.user?.name || "Usuario"}</span> {data.content}
        </p>
        <span className="text-[10px] opacity-30 mt-1 block uppercase font-medium tracking-tight">
          {data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Reciente'}
        </span>
      </div>

      {!data.read && (
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--p),0.5)]"></div>
      )}
    </div>
  );
};

export default Activity;