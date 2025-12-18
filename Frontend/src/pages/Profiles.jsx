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
  Camera, // Icono para la foto
} from "lucide-react";
import { Link } from "react-router-dom";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";

const Profile = ({ isOwnProfile = true }) => {
  const [activeTab, setActiveTab] = useState("collections");

  // ESTADO DE LA IMAGEN DE PERFIL
  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
  );

  // REFERENCIA AL INPUT INVISIBLE DE ARCHIVO
  const fileInputRef = useRef(null);

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

  // Activar edición
  const handleStartEditing = () => {
    setNewDescription(description);
    setIsEditing(true);
  };

  // Guardar biografía
  const handleSave = (e) => {
    e.preventDefault();
    if (newDescription.trim()) {
      setDescription(newDescription);
      setIsEditing(false);
    }
  };

  // CAMBIAR FOTO DE PERFIL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handlePhotoClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      <main className=" mx-auto">
        {/* HEADER */}
        <div className="relative">
          {/* BANNER (Fondo) - CORREGIDO */}
          <div className="h-40 md:h-80 w-full relative bg-neutral-900 overflow-hidden">
            {/* Imagen normal (sin opacity-50 que la dejaba gris) */}
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
              alt="cover"
              className="w-full h-full object-cover"
            />
            {/* Degradado negro solo abajo para que se lea el texto, sin tapar la foto entera */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
          </div>

          <div className="px-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
              {/* === FOTO DE PERFIL (ESTILO INSTAGRAM) === */}
              <div className="relative" onClick={handlePhotoClick}>
                <div className="avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm cursor-pointer">
                  <div className="w-24 md:w-32 rounded-full overflow-hidden relative bg-base-200">
                    <img
                      src={profileImage}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* BOTÓN DE CÁMARA FLOTANTE (Badge) - Soluciona el problema móvil */}
                {isOwnProfile && (
                  <button
                    className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-base-100 text-base-content p-2 rounded-full shadow-md border border-white hover:bg-base-200 transition-colors z-10"
                    title="Cambiar foto"
                  >
                    <Camera size={16} className="md:w-5 md:h-5" />
                  </button>
                )}

                {/* Input file oculto */}
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
                      onClick={handleStartEditing}base-300
                      className="btn btn-sm md:btn-md py-1 btn-ghost border border-white rounded-full px-4 md:px-6 hover:bg-base-200"
                    >
                      Editar Perfil
                    </button>
                    <button
                      onClick={handleStartEditing}
                      className="btn btn-sm md:btn-md btn-circle btn-ghost border border-white"
                    >
                      <Settings size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm rounded-full px-6 gap-2">
                      <UserPlus size={16} /> Seguir
                    </button>
                    <button className="btn btn-sm btn-circle btn-ghost border border-white">
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
                  Usuario_07
                </h1>
                <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={14} /> Madrid, ES
                </p>
              </div>

              {/* === ZONA DE EDICIÓN DE BIO === */}
              {isEditing ? (
                <form
                  onSubmit={handleSave}
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
        <div className="border-t border-white mt-4 sticky top-16 bg-base-100/95 backdrop-blur-sm z-30">
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
