import React, { useState } from "react";

// Lista de degradados elegantes (Estilo moderno)
const GRADIENTS = [
  "bg-gradient-to-br from-rose-400 to-orange-300",
  "bg-gradient-to-br from-indigo-400 to-cyan-400",
  "bg-gradient-to-br from-emerald-400 to-teal-500",
  "bg-gradient-to-br from-fuchsia-500 to-purple-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-slate-600 to-slate-800", // Gris oscuro elegante
];

const ItemCover = ({ src, title, className = "" }) => {
  const [imgError, setImgError] = useState(false);

  // 1. Lógica para obtener las iniciales (Máximo 2 letras)
  const getInitials = (text) => {
    if (!text) return "?";
    const words = text.trim().split(" ");
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
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

  // CASO A: Tenemos imagen y no ha dado error
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={title}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover ${className}`}
        onError={() => setImgError(true)} // Si falla, activamos el modo texto
      />
    );
  }

  // CASO B: No hay imagen o dio error -> Mostramos Iniciales
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-white p-4 text-center select-none ${getGradient(title)} ${className}`}>
      <span className="font-serif font-bold text-5xl md:text-6xl drop-shadow-md opacity-90 tracking-tighter">
        {getInitials(title)}
      </span>
      {/* Opcional: Mostrar título pequeño abajo si quieres, aunque las iniciales suelen bastar */}
      {/* <span className="text-xs font-medium mt-2 opacity-75 line-clamp-1">{title}</span> */}
    </div>
  );
};

export default ItemCover;