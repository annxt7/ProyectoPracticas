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

  // 1. Normalización del título
  const safeTitle = typeof title === "string" ? title.trim() : String(title || "");

  // 2. Limpieza de URL (Forzar HTTPS para evitar bloqueos del navegador)
  const cleanSrc = src && src !== "null" && src !== "undefined" 
    ? src.replace("http://", "https://") 
    : null;

  // 3. Lógica de Iniciales (Máximo 2 letras)
  const getInitials = (text) => {
    if (!text) return "?";
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return text.substring(0, 2).toUpperCase();
  };

  const getGradient = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  };

  // Renderizado condicional basado en si hay imagen y si cargó bien
  const showFallback = !cleanSrc || imgError;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className} ${showFallback ? getGradient(safeTitle) : "bg-neutral"}`}>
      
      {cleanSrc && !imgError && (
        <img
          src={cleanSrc}
          alt={safeTitle}
          className="w-full h-full object-cover transition-opacity duration-500"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          // Eliminamos el onLoad que causaba el cascading render
        />
      )}

      {showFallback && (
        <span className="font-bold text-white drop-shadow-md uppercase tracking-tighter">
          {getInitials(safeTitle)}
        </span>
      )}
    </div>
  );
};

export default ItemCover;