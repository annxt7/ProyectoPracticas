import React, { useState, useEffect } from "react";

// Lista de degradados elegantes (Estilo moderno)
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

  // Reiniciamos el error si cambia la fuente (por si se corrige la URL dinámicamente)
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // CORRECCIÓN DE SEGURIDAD: Convertimos a String para evitar crash si es null/undefined
  const safeTitle = title ? String(title) : "";

  // 1. Lógica para obtener las iniciales (Máximo 2 letras)
  const getInitials = (text) => {
    if (!text) return "?";
    // .trim() fallaba si text era null. Ahora usamos 'safeTitle' que es seguro.
    const words = text.trim().split(" ");
    
    // Si no hay palabras válidas
    if (words.length === 0 || !words[0]) return "?";

    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    
    // Aseguramos que existe la segunda palabra antes de acceder a ella
    const firstInitial = words[0][0] || "";
    const secondInitial = (words[1] && words[1][0]) ? words[1][0] : words[0][1] || "";
    
    return (firstInitial + secondInitial).toUpperCase();
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

  if (src && !imgError) {
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

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-white p-4 text-center select-none ${getGradient(safeTitle)} ${className}`}>
      <span className="font-serif font-bold text-5xl md:text-6xl drop-shadow-md opacity-90 tracking-tighter">
        {getInitials(safeTitle)}
      </span>
    </div>
  );
};

export default ItemCover;