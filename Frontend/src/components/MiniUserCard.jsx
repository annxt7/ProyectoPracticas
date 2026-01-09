import React from 'react';  

const MiniUserCard = ({ user }) => {
  // Si por alguna razón user no llega, no renderizamos nada para evitar errores
  if (!user) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-9 h-9 rounded-full ring-1 ring-white/10">
            {/* Usamos la imagen de la DB o un avatar por defecto si no tiene */}
            <img 
              src={user.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
              alt={user.name} 
            />
          </div>
        </div>
        <div className="text-sm">
          <p className="font-bold">{user.name}</p>
          <p className="text-xs opacity-60">{user.handle || "Nuevo en Tribe"}</p>
        </div>
      </div>
      <button className="btn-primary btn btn-xs rounded-full px-4">
        Seguir
      </button>
    </div>
  );
};

export default MiniUserCard;