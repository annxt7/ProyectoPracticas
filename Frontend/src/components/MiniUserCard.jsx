import React from "react";
import { Link } from "react-router-dom";

const MiniUserCard = ({ user, isFollowing, onFollowToggle }) => {
  if (!user) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFollowToggle?.();
  };

  return (
    <Link to={`/profile/${user.id}`} className="block group">
      <div className="flex items-center justify-between p-3 bg-white/0.02 border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
        
        {/* IZQUIERDA: AVATAR + TEXTO */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring-2 ring-white/5 bg-white/10 overflow-hidden">
              <img
                src={
                  user.img ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=random&color=fff`
                }
                alt={user.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
              {user.name}
            </h3>
            <p className="text-[10px] opacity-40 leading-none">
              {user.handle || `@${user.name.toLowerCase().replace(/\s/g, "")}`}
            </p>
          </div>
        </div>

        {/* DERECHA: BOTÓN FOLLOW */}
        <button
          onClick={handleClick}
          className={`btn btn-xs rounded-full px-4 transition-all z-10 ${
            isFollowing
              ? "btn-ghost border-white/10 opacity-60"
              : "btn-primary font-bold"
          }`}
        >
          {isFollowing ? "Siguiendo" : "Seguir"}
        </button>
      </div>
    </Link>
  );
};

export default MiniUserCard;
