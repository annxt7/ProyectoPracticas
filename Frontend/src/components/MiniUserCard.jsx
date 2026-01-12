import React from 'react';
import { Link } from 'react-router-dom';

const MiniUserCard = ({ user }) => {
  if (!user) return null;

  // 1. Obtener mi ID de forma segura para comparar
  const getMyId = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id || parsed.user_id) return String(parsed.id || parsed.user_id).trim();
      }
      
      const token = localStorage.getItem('tribe_token')?.replace(/['"]+/g, '');
      if (!token) return null;
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return String(payload.id || payload.userId || payload.user_id || "").trim();
    } catch (e) {
      return null;
    }
  };

  const myId = getMyId();
  const cardUserId = String(user.id || user.user_id || "").trim();

  // FILTRO: Si la tarjeta es de mi propio usuario, no renderizamos nada
  if (myId && cardUserId === myId) {
    return null;
  }

  const handleFollow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Siguiendo a:", user.name);
  };

  return (
    <Link to={`/profile/${user.id}`} className="block group">
      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
        <div className="flex items-center gap-3 min-w-0">
          {/* AVATAR */}
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring-2 ring-white/5 bg-white/10 overflow-hidden">
              <img 
                src={user.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                alt={user.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
              />
            </div>
          </div>

          {/* TEXTO */}
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
              {user.name}
            </h3>
            <p className="text-[10px] opacity-40 leading-none">
              {user.handle || `@${user.name.toLowerCase().replace(/\s/g, '')}`}
            </p>
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <button 
          onClick={handleFollow}
          className={`btn btn-xs rounded-full px-4 transition-all z-10 ${
            user.isFollowing 
              ? 'btn-ghost border-white/10 opacity-60' 
              : 'btn-primary font-bold'
          }`}
        >
          {user.isFollowing ? 'Siguiendo' : 'Seguir'}
        </button>
      </div>
    </Link>
  );
};

export default MiniUserCard;