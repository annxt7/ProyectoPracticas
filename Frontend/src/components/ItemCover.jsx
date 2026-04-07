import { useState, useMemo } from "react";

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
  const displayTitle = title?.trim() || "Sin Título";
  const { gradient, initials } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < displayTitle.length; i++) {
      hash = displayTitle.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    
    const words = displayTitle.split(/\s+/).filter(w => w.length > 0);
    const textInitials = words.length >= 2 
      ? (words[0][0] + words[1][0]).toUpperCase()
      : displayTitle.substring(0, 2).toUpperCase();

    return { gradient: GRADIENTS[index], initials: textInitials || "??" };
  }, [displayTitle]);

  const showFallback = !src || src === "null" || src === "undefined" || imgError;

  return (
    <div className={`w-full h-full relative flex items-center justify-center overflow-hidden select-none ${className} ${showFallback ? gradient : "bg-neutral"}`}>
      {!showFallback && (
        <img
          src={src}
          alt={displayTitle}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      )}

      {showFallback && (
        <span className="font-bold text-white drop-shadow-md uppercase tracking-tighter text-xl md:text-2xl">
          {initials}
        </span>
      )}
    </div>
  );
};

export default ItemCover;