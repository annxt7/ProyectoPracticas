import React, { useState, useRef, useEffect } from "react";
import {
  Settings,
  UserPlus,
  Grid,
  Bookmark,
  Check,
  MapPin,
  Share2,
  X,
  Camera,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { useAuth } from "../context/AuthContext";
import api from "../services/api"; 

const Profile = ({ isOwnProfile = true }) => {
  const [activeTab, setActiveTab] = useState("collections");
  // AÑADIDO: 'updateUser' para guardar los cambios en el navegador al instante
  const { user, login, updateUser } = useAuth(); 

  // Referencias a los inputs invisibles
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null); // <--- NUEVO: Referencia para el banner

  // Estado local para spinner de carga
  const [isUploading, setIsUploading] = useState(false);

  // Estados de texto (Bio)
  const [description, setDescription] = useState(
    user?.bio || "Hola! Soy nuevo en Tribe."
  );
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  // Sincronizar descripción si el usuario cambia (ej: al recargar)
  useEffect(() => {
    if (user?.bio) setDescription(user.bio);
  }, [user]);

  const stats = [
    { label: "Colecciones", value: "12" },
    { label: "Seguidores", value: "1.4k" },
    { label: "Siguiendo", value: "342" },
  ];

  const handleStartEditing = () => {
    setNewDescription(description);
    setIsEditing(true);
  };

  // Guardar Bio
  const handleSaveBio = async (e) => {
    e.preventDefault();
    if (newDescription.trim()) {
      try {
        await api.put('/users/update-profile', { bio: newDescription });
        setDescription(newDescription);
        updateUser({ bio: newDescription }); // Actualiza el contexto global
        setIsEditing(false);
      } catch (error) {
        console.error("Error actualizando bio", error);
      }
    }
  };

  // --- FUNCIÓN UNIFICADA PARA SUBIR IMÁGENES (Avatar o Banner) ---
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vista previa inmediata (opcional, pero mejora UX)
    const localPreview = URL.createObjectURL(file);
    if (type === 'avatar') {
       // Podrías tener un estado local aquí si quisieras, pero usaremos el user del contexto
    }
    
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('imagen', file); 
      
      // 1. Subir a Cloudflare/Servidor
      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const cloudUrl = uploadRes.data.url;
      console.log(`Imagen (${type}) subida:`, cloudUrl);

      // 2. Preparar datos para actualizar perfil
      // Si type es 'avatar' manda { avatarUrl: ... }, si es 'banner' manda { bannerUrl: ... }
      const payload = type === 'avatar' 
        ? { avatarUrl: cloudUrl } 
        : { bannerUrl: cloudUrl };

      // 3. Guardar en Base de Datos
      await api.put('/users/update-profile', payload);

      // 4. Actualizar Contexto (para que se vea el cambio sin recargar)
      if (type === 'avatar') {
        updateUser({ avatar: cloudUrl });
      } else {
        updateUser({ banner: cloudUrl });
      }

      console.log("Perfil actualizado con éxito");

    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert("Hubo un error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      <main className="mx-auto">
        {/* HEADER */}
        <div className="relative">
          
          {/* === BANNER === */}
          {/* Añadido grupo 'group' para efectos hover */}
          <div className="h-40 md:h-80 w-full relative bg-neutral-900 overflow-hidden group">
            <img
              // Usa el banner del usuario, o el de por defecto si es null
              src={user?.banner || "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg"}
              alt="cover"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* BOTÓN CAMBIAR BANNER (Solo si es tu perfil) */}
            {isOwnProfile && (
              <button 
                onClick={() => !isUploading && bannerInputRef.current.click()}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                title="Cambiar portada"
              >
                <Camera size={20} />
              </button>
            )}

            {/* INPUT OCULTO BANNER */}
            <input 
              type="file" 
              ref={bannerInputRef} 
              onChange={(e) => handleFileUpload(e, 'banner')} 
              className="hidden" 
              accept="image/*"
              disabled={isUploading}
            />
          </div>

          <div className="px-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
              
              {/* === FOTO DE PERFIL === */}
              {/* Usamos una función anónima para el click del avatar */}
              <div className="relative" onClick={() => isOwnProfile && !isUploading && avatarInputRef.current.click()}>
                <div className={`avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm ${isOwnProfile ? 'cursor-pointer hover:ring-primary/50 transition-all' : ''}`}>
                  <div className="w-24 md:w-32 rounded-full overflow-hidden relative bg-base-200">
                    
                    {/* Spinner de carga global para la zona de fotos */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <span className="loading loading-spinner text-white"></span>
                      </div>
                    )}
                    
                    <img
                      src={user?.avatar || "https://i.pinimg.com/736x/b8/b3/12/b8b312949b0c78751f6aa82849120bc9.jpg"}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* BOTÓN DE CÁMARA AVATAR */}
                {isOwnProfile && (
                  <button
                    className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-base-100 text-base-content p-2 rounded-full shadow-md border border-white/40 hover:bg-base-200 transition-colors z-10 pointer-events-none"
                  >
                    <Camera size={16} className="md:w-5 md:h-5" />
                  </button>
                )}

                {/* INPUT OCULTO AVATAR */}
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={(e) => handleFileUpload(e, 'avatar')} // Pasamos 'avatar' como tipo
                  className="hidden"
                  accept="image/*"
                  disabled={isUploading}
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 mt-2 mb-2">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={handleStartEditing}
                      className="btn btn-sm md:btn-md py-1 btn-ghost border border-white/40 rounded-full px-4 md:px-6 hover:bg-base-200"
                    >
                      Editar Perfil
                    </button>
                    <button
                      className="btn btn-sm md:btn-md btn-circle btn-ghost border border-white/40"
                    >
                      <Settings size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm rounded-full px-6 gap-2">
                      <UserPlus size={16} /> Seguir
                    </button>
                    <button className="btn btn-sm btn-circle btn-ghost border border-white/40">
                      <Share2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Texto Bio */}
            <div className="space-y-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-serif tracking-tight">
                  {user?.username}
                </h1>
                <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={14} /> Madrid, ES
                </p>
              </div>

              {/* === ZONA DE EDICIÓN DE BIO === */}
              {isEditing ? (
                <form
                  onSubmit={handleSaveBio}
                  className="flex flex-col md:flex-row gap-3 items-start max-w-xl animate-in fade-in duration-300"
                >
                  <div className="w-full relative group">
                    <textarea
                      className="w-full bg-base-200/60 text-base-content text-base p-4 rounded-xl outline-none focus:bg-base-100 focus:ring-2 focus:ring-primary transition-all resize-none shadow-inner h-32"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Cuéntanos sobre ti..."
                      autoFocus
                    />
                    <div className="inline-flex gap-1 mt-2 items-center justify-between w-full">
                      <div className="text-xs text-right mt-1 opacity-40 px-1 font-medium">
                        {newDescription.length}/200
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm btn-square rounded-lg shadow-lg hover:scale-105 transition-transform"
                          disabled={!newDescription.trim()}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="btn btn-ghost btn-sm btn-square rounded-lg hover:bg-base-200"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="max-w-md text-base leading-relaxed opacity-80 whitespace-pre-wrap">
                  {description}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex gap-6 py-4 mt-4">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row md:gap-2 items-center md:items-baseline group cursor-pointer hover:opacity-80 transition-opacity"
                  >
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

        {/* TABS */}
        <div className="border-t border-white/40 mt-4 sticky top-16 bg-base-100/95 backdrop-blur-sm z-30">
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

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:px-6 min-h-[300px]">
          {isOwnProfile && activeTab === "collections" && (
            <div className="aspect-4/5 bg-base-100 border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-base-200/50 hover:border-primary/50 transition-all group">
              <Link to={"/create-collection"} className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <Plus size={24} />
              </Link>
              <span className="text-xs font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100">
                Nueva Colección
              </span>
            </div>
          )}

          {[1, 2, 3, 4, 5].map((item) => (
            <Link
              to={`/collection/${item}`}
              key={item}
              className="group cursor-pointer block"
            >
              <div className="card bg-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden aspect-4/5 relative">
                <img
                  src={`https://picsum.photos/400?random=${item + 10}`}
                  alt="Collection"
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 flex flex-col justify-end p-5">
                  <p className="text-white font-serif font-bold truncate text-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    Retro Vibes
                  </p>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mt-1">
                    24 items
                  </p>
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