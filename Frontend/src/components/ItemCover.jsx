import React, { useState } from "react";

const GRADIENTS = [
  "bg-gradient-to-br from-rose-400 to-orange-300",
  "bg-gradient-to-br from-indigo-400 to-cyan-400",
  "bg-gradient-to-br from-emerald-400 to-teal-500",
  "bg-gradient-to-br from-fuchsia-500 to-purple-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-slate-600 to-slate-800",
];

const ItemCover = ({ src, title, className = "" }) => {
  const [imgError, setImgError] = useState(false);

  // 1. Limpieza de título: Si no hay título, usamos un placeholder para el hash del color
  const displayTitle = title?.trim() || "Colección";

  // 2. Generación de iniciales ultra-segura
  const getInitials = () => {
    if (!title || title.trim().length === 0) return "??";
    const words = title.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0].substring(0, 2).toUpperCase();
  };

  // 3. Selección de color basada en el título (o en el placeholder)
  const getGradient = () => {
    let hash = 0;
    const text = displayTitle;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  };

  // 4. Limpieza de URL
  const cleanSrc = src && src !== "null" && src !== "undefined" ? src : null;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className} ${(!cleanSrc || imgError) ? getGradient() : "bg-neutral"}`}>
      
      {cleanSrc && !imgError && (
        <img
          key={src} // El 'key' fuerza a React a tratarlo como imagen nueva si cambia el src sin usar useEffect
          src={cleanSrc}
          alt={displayTitle}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      )}

      {(!cleanSrc || imgError) && (
        <span className="font-bold text-white drop-shadow-md uppercase tracking-tighter">
          {getInitials()}
        </span>
      )}
    </div>
  );
};

export default ItemCover;