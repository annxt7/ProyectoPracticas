import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 1. Importar hook

const MiniUserCard = ({ user, isFollowing, onFollowToggle }) => {
  const { t } = useTranslation(); // 2. Inicializar t
  
  if (!user) return null;

  // Normalización interna
  const displayName = user.username || user.name || t("explorer.no_users"); // Uso de fallback traducido
  const displayImg = user.avatar || user.img || user.avatar_url;
  
  const safeHandle = user.handle || `@${String(displayName).toLowerCase().replace(/\s/g, "")}`;

  const handleBtnClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    onFollowToggle?.();
  };

  return (
    <Link to={`/profile/${user.id}`} className="block group">
      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
        
        <div className="flex items-center gap-3 min-w-0">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring-2 ring-white/5 bg-white/10 overflow-hidden">
              <img
                src={
                  displayImg ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff`
                }
                alt={displayName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm text-base-content truncate group-hover:text-primary transition-colors">
              {displayName}
            </h3>
            <p className="text-[10px] opacity-40 leading-none">
              {safeHandle}
            </p>
          </div>
        </div>

        <button
          onClick={handleBtnClick}
          className={`btn btn-xs rounded-full px-4 transition-all z-10 ${
            isFollowing
              ? "btn-outline border-white/10 opacity-60"
              : "btn-primary font-bold"
          }`}
        >
          {/* 3. Traducción de los estados del botón */}
          {isFollowing ? t("explorer.btn_following") : t("explorer.btn_follow")}
        </button>
      </div>
    </Link>
  );
};

export default MiniUserCard;