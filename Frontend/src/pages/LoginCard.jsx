import React, { useState, useRef } from "react";
import {
  Settings,
  Plus,
  UserPlus,
  Grid,
  Bookmark,
  Check,
  MapPin,
  Share2,
  X,
  Camera // Nuevo icono para la foto
} from "lucide-react";
import { Link } from "react-router-dom";
import NavMobile from "../components/NavMobile";  
import NavDesktop from "../components/NavDesktop";

const Profile = ({ isOwnProfile = true }) => {
  const [activeTab, setActiveTab] = useState("collections");
  
  // Estado para la imagen de perfil
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300");
  const fileInputRef = useRef(null); // Referencia para el input invisible

  // Estado para la biografía
  const [description, setDescription] = useState(
    "Cineasta visual y recolectora de vinilos de los 70s. Intentando organizar mi caos visual en pequeñas dosis. ☕️ & 🎬"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const stats = [
    { label: "Colecciones", value: "12" },
    { label: "Seguidores", value: "1.4k" },
    { label: "Siguiendo", value: "342" },
  ];

  // --- LÓGICA DE EDICIÓN DE BIO ---
  const handleStartEditing = () => {
    setNewDescription(description);
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (newDescription.trim()) {
      setDescription(newDescription);
      setIsEditing(false);
    }
  };

  // --- LÓGICA DE CAMBIO DE FOTO ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Creamos una URL temporal para mostrar la imagen seleccionada inmediatamente
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content">
      <NavDesktop />
      
      <main className="max-w-5xl mx-auto">
        {/* =======================
            HEADER DEL PERFIL
        ======================== */}
        <div className="relative">
          {/* Portada (Banner) */}
          <div className="h-40 md:h-80 w-full bg-gradient-to-r from-gray-200 to-gray-300 overflow-hidden group relative">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
              alt="cover"
              className="w-full h-full object-cover opacity-50"
            />
            {/* Opcional: Botón para cambiar portada también podría ir aquí */}
          </div>

          {/* Info del Usuario */}
          <div className="px-6 relative">
            
            {/* Fila Avatar y Botones */}
            <div className="flex justify-between items-end -mt-12 mb-4">
              
              {/* === FOTO DE PERFIL CON CAMBIO === */}
              <div className="relative group">
                <div className="avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm">
                  <div className="w-24 md:w-32 rounded-full overflow-hidden relative">
                    <img
                      src={profileImage}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                    
                    {/* Overlay para subir foto (Solo si es tu perfil) */}
                    {isOwnProfile && (
                      <div 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-[2px]"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <Camera className="text-white drop-shadow-md" size={24} />
                      </div>
                    )}
                  </div>
                </div>
                {/* Input invisible para el archivo */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 mt-2 mb-2">
                {isOwnProfile ? (
                  <>
                    <button 
                      onClick={handleStartEditing}
                      className="btn btn-md py-1 btn-ghost border border-base-300 rounded-full px-6 hover:bg-base-200 transition-colors"
                    >
                      Editar Perfil
                    </button>
                    <button 
                      onClick={handleStartEditing}
                      className="btn btn-md btn-circle btn-ghost border border-base-300 hover:rotate-45 transition-transform"
                    >
                      <Settings size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm rounded-full px-6 gap-2">
                      <UserPlus size={16} /> Seguir
                    </button>
                    <button className="btn btn-sm btn-circle btn-ghost border border-base-300">
                      <Share2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Texto Bio y Nombre */}
            <div className="space-y-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-serif tracking-tight">
                  Usuario_07
                </h1>
                <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={14} /> Madrid, ES
                </p>
              </div>
              
              {/* Lógica de Edición de Biografía */}
              {isEditing ? (
                <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-3 items-start max-w-xl animate-in fade-in zoom-in duration-200">
                  {/* ESTILO DEL INPUT MEJORADO */}
                  <div className="w-full relative">
                    <textarea
                      className="textarea w-full text-base leading-relaxed h-28 resize-none bg-base-200/50 border-transparent focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl p-4 shadow-inner"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Escribe algo sobre ti..."
                      autoFocus
                    />
                    <div className="text-xs text-right mt-1 opacity-50 px-1">
                        {newDescription.length}/150
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 pt-1">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-sm btn-square rounded-lg shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                      disabled={!newDescription.trim()}
                      title="Guardar"
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="btn btn-ghost btn-sm btn-square rounded-lg hover:bg-base-200"
                      title="Cancelar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </form>
              ) : (
                <p className="max-w-md text-base leading-relaxed opacity-80 whitespace-pre-wrap">
                  {description}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex gap-6 py-4 border-y border-base-200/50 md:border-none md:py-2 mt-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:gap-2 items-center md:items-baseline group cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="font-bold text-lg">{stat.value}</span>
                    <span className="text-xs md:text-sm opacity-60 uppercase tracking-wide font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =======================
            TABS DE CONTENIDO
        ======================== */}
        <div className="border-t border-base-200 mt-4 sticky top-64px] bg-base-100/95 backdrop-blur-sm z-30">
          <div className="flex justify-center gap-4 md:gap-12">
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 py-4 border-b-2 px-4 text-sm font-bold tracking-wide transition-all ${
                activeTab === "collections"
                  ? "border-primary text-base-content"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              <Grid size={18} /> MIS COLECCIONES
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-4 border-b-2 px-4 text-sm font-bold tracking-wide transition-all ${
                activeTab === "saved"
                  ? "border-primary text-base-content"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              <Bookmark size={18} /> GUARDADO
            </button>
          </div>
        </div>

        {/* =======================
            GRID DE COLECCIONES
        ======================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:px-6 min-h-[300px]">
          {/* Botón Crear */}
          {isOwnProfile && activeTab === "collections" && (
            <div className="aspect-4/5 bg-base-100 border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-base-200/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                <Plus size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100">
                Nueva Colección
              </span>
            </div>
          )}

          {[1, 2, 3, 4, 5].map((item) => (
            <Link to={`/collection/${item}`} key={item} className="group cursor-pointer block">
              <div className="card bg-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden aspect-[4/5] relative">
                 <img
                    src={`https://picsum.photos/400?random=${item + 10}`}
                    alt="Collection"
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 flex flex-col justify-end p-5">
                    <p className="text-white font-serif font-bold truncate text-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                      Retro Vibes
                    </p>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider mt-1">24 items</p>
                  </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      
      <NavMobile />
    </div>
  );
};

export default Profile;