import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Heart, UserPlus, MessageSquare, Bell, CheckCheck, Filter as FilterIcon, Info
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import api from "../services/api.js";

const Activity = () => {
  const [activeFilter, setActiveFilter] = useState("all"); 
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 1. Cargar datos y verificar concordancia de ID
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtenemos el perfil para saber quién es el usuario actual (ID 19 o 26)
      const userRes = await api.get("/auth/me");
      setCurrentUser(userRes.data);
      console.log("👤 [Concordancia] Usuario logueado ID:", userRes.data.id);

      const res = await api.get("/activity"); 
      console.log("📥 [Backend] Datos recibidos:", res.data);
      
      setNotifications(res.data || []);
    } catch (error) {
      console.error("❌ [Error] Fallo al sincronizar con el backend:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 2. Marcar como leído (Sincronización manual)
  const markAsRead = async (id) => {
    console.log(`🎯 [Acción] Marcando ID ${id} como leído...`);
    
    // Actualización optimista: cambiamos la UI antes de esperar al servidor
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    try {
      await api.put(`/activity/${id}/read`);
      console.log("✅ [Sincronización] DB actualizada correctamente.");
    } catch (error) {
      console.error("❌ [Error] No se pudo actualizar en DB, revirtiendo...");
      fetchNotifications(); // Si falla, recargamos el estado real
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/activity/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      console.log("✅ [Sincronización] Todas marcadas como leídas.");
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Filtrado lógico
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Ajuste para que 'like_collection' de MariaDB entre en 'interactions'
      const isInteraction = n.type === 'like_collection' || n.type === 'comment';
      const isFollow = n.type === 'follow';

      const matchesType = activeFilter === "all" || 
        (activeFilter === "interactions" && isInteraction) ||
        (activeFilter === "follows" && isFollow);
      
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "unread" && !n.read) ||
        (statusFilter === "read" && n.read);

      return matchesType && matchesStatus;
    });
  }, [notifications, activeFilter, statusFilter]);

  const stats = useMemo(() => ({
    followers: notifications.filter(n => n.type === "follow").length,
    interactions: notifications.filter(n => n.type === "like_collection" || n.type === "comment").length
  }), [notifications]);

  return (
    <div className="min-h-screen pb-28 md:pb-10 bg-base-100 text-white font-sans">
      <NavDesktop />
      
      {/* Banner de Debug para concordancia */}
      {currentUser && (
        <div className="bg-warning/10 text-warning text-[10px] py-1 text-center border-b border-warning/20">
          CONCORDANCIA ACTIVA - SESIÓN: {currentUser.username} (ID: {currentUser.id})
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
          <button onClick={markAllAsRead} className="btn btn-ghost btn-xs opacity-50 hover:opacity-100">
            <CheckCheck size={14} className="mr-1" /> Marcar todo
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-8">
        
        {/* Sidebar Filtros */}
        <aside className="hidden lg:block space-y-8">
          <section>
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
              <FilterIcon size={12} /> Categoría
            </h4>
            <div className="flex flex-col gap-1">
              {['all', 'interactions', 'follows'].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`text-left text-xs p-3 rounded-xl transition-all ${activeFilter === f ? 'bg-primary/20 text-primary font-bold' : 'opacity-40 hover:opacity-100'}`}>
                  {f === 'all' ? 'Todo' : f === 'interactions' ? 'Interacciones' : 'Seguidores'}
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
            <div className="space-y-4">
              {filteredNotifications.map(n => (
                <NotificationItem 
                  key={n.id} 
                  data={n} 
                  onRead={() => markAsRead(n.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
              <Info className="mx-auto mb-4 opacity-20" size={40} />
              <p className="opacity-40 text-sm italic">No hay actividad que coincida con los filtros</p>
            </div>
          )}
        </main>

        {/* Sidebar Estadísticas */}
        <aside className="hidden lg:block">
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
            <h4 className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-6">Resumen</h4>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="opacity-50">Seguidores</span>
                <span className="text-primary font-bold">+{stats.followers}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">Interacciones</span>
                <span className="text-secondary font-bold">{stats.interactions}</span>
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
  const Icon = data.type === 'follow' ? UserPlus : data.type === 'like_collection' ? Heart : MessageSquare;
  const iconColor = data.type === 'follow' ? 'text-blue-400' : data.type === 'like_collection' ? 'text-pink-500' : 'text-green-400';

  return (
    <div 
      onClick={!data.read ? onRead : undefined}
      className={`group flex items-start gap-4 p-4 rounded-2xl transition-all border ${
        data.read ? "bg-transparent border-transparent opacity-50" : "bg-white/[0.05] border-white/10 hover:bg-white/[0.08] cursor-pointer"
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-base-300 border border-white/10">
          <img 
            src={data.user?.avatar || `https://ui-avatars.com/api/?name=${data.user?.name}&background=random`} 
            alt={data.user?.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-base-100 flex items-center justify-center border border-white/5 ${iconColor}`}>
          <Icon size={12} strokeWidth={3} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight text-white/90">
          <span className="font-bold text-white">{data.user?.name}</span> {data.content}
        </p>
        <span className="text-[10px] opacity-30 mt-1 block uppercase font-medium tracking-tighter">
          {new Date(data.created_at).toLocaleDateString()}
        </span>
      </div>

      {!data.read && (
        <div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_10px_rgba(var(--p),0.5)]"></div>
      )}
    </div>
  );
};

export default Activity;