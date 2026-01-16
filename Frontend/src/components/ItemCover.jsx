import React, { useState, useEffect } from "react";

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

  // Si la prop src cambia (por ejemplo, al navegar entre colecciones), intentamos cargar la imagen de nuevo
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // Aseguramos que el título sea siempre un string limpio
  const safeTitle = typeof title === "string" ? title.trim() : "";

  // Lógica de iniciales ultra-segura
  const getInitials = (text) => {
    if (!text) return "??";
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length >= 2) {
      // Primera letra de la primera palabra + Primera letra de la segunda
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1) {
      // Dos primeras letras de la única palabra
      return words[0].substring(0, 2).toUpperCase();
    }
    return "??";
  };

  const getGradient = (text) => {
    if (!text) return GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
  };

  // Solo intentamos renderizar la imagen si hay un src válido y no ha dado error
  const shouldShowImage = src && src !== "" && src !== "null" && src !== "undefined" && !imgError;

  if (shouldShowImage) {
    return (
      <img
        src={src}
        alt={safeTitle}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-opacity duration-300 ${className}`}
        onError={() => setImgError(true)} 
        loading="lazy"
      />
    );
  }

  // Renderizado del "Fallback" (el cuadro con color e iniciales)
  return (
    <div 
      className={`w-full h-full flex items-center justify-center text-white p-2 text-center select-none overflow-hidden ${getGradient(safeTitle)} ${className}`}
      title={safeTitle} // Tooltip para ver el título completo al pasar el ratón
    >
      <span className="font-bold text-2xl md:text-3xl lg:text-4xl drop-shadow-lg opacity-90 tracking-tighter">
        {getInitials(safeTitle)}
      </span>
    </div>
  );
};

export default ItemCover;