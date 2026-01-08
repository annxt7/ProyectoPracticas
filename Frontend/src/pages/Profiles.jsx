import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  Plus,
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("collections");
  const { user, updateUser } = useAuth();
  const { userId } = useParams(); // Leemos el ID de la URL (si estamos visitando a otro)

  // 1. LÓGICA DE IDENTIDAD
  // Si hay userId en la URL, es "otro". Si no, soy "yo".
  // IMPORTANTE: Convertimos a string para comparar bien (a veces userId es string y user.user_id es number)
  const targetId = userId ? userId : user?.user_id;
  const isOwnProfile = user && String(targetId) === String(user.user_id);

  // Estados de datos
  const [profileUser, setProfileUser] = useState(null); // Datos del usuario que estamos viendo (nombre, bio...)
  const [collections, setCollections] = useState([]);   // Sus colecciones
  const [isLoading, setIsLoading] = useState(true);

  // Referencias (solo para cuando editas tu propio perfil)
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Edición de Bio
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  // 2. EFECTO: CARGAR DATOS DEL PERFIL
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // A. Cargar colecciones del usuario objetivo
        // Asegúrate de que tu ruta en backend es GET /collections/user/:userId
        const colRes = await api.get(`/collections/user/${targetId}`);
        setCollections(colRes.data);

        // B. Cargar datos del usuario (si no soy yo)
        // Si soy yo, ya tengo los datos en el contexto 'user', pero si visito a otro necesito sus datos
        if (isOwnProfile) {
            setProfileUser(user);
            setNewDescription(user.bio || "");
        } else {
            // Necesitarías un endpoint tipo GET /users/:id para obtener nombre, avatar, etc de otro usuario
            // Por ahora, si no tienes ese endpoint, usaremos datos dummy o lo que tengas
            // TODO: Crear endpoint GET /users/:id en backend si no existe
            // const userRes = await api.get(`/users/${targetId}`);
            // setProfileUser(userRes.data);
            
            // MODO PROVISIONAL: Si no tienes endpoint de "get one user", 
            // no podremos mostrar su nombre real todavía. 
            // Asumiremos que es un usuario genérico para que no falle.
            setProfileUser({ username: "Usuario " + targetId, bio: "Bio del usuario...", avatar: null, banner: null });
        }

      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (targetId) {
        fetchProfileData();
    }
  }, [targetId, user, isOwnProfile]);


  // 3. FUNCIONES DE EDICIÓN (Solo funcionan si isOwnProfile es true)
  const handleStartEditing = () => {
    setNewDescription(profileUser?.bio || "");
    setIsEditing(true);
  };

  const handleSaveBio = async (e) => {
    e.preventDefault();
    if (newDescription.trim()) {
      try {
        await api.put("/users/update-profile", { bio: newDescription });
        // Actualizamos localmente y en contexto
        setProfileUser({ ...profileUser, bio: newDescription });
        updateUser({ bio: newDescription });
        setIsEditing(false);
      } catch (error) {
        console.error("Error actualizando bio", error);
      }
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("imagen", file);

      const uploadRes = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const cloudUrl = uploadRes.data.url;

      const payload = type === "avatar" ? { avatarUrl: cloudUrl } : { bannerUrl: cloudUrl };
      await api.put("/users/update-profile", payload);

      if (type === "avatar") {
        updateUser({ avatar: cloudUrl });
        setProfileUser(prev => ({ ...prev, avatar: cloudUrl }));
      } else {
        updateUser({ banner: cloudUrl });
        setProfileUser(prev => ({ ...prev, banner: cloudUrl }));
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!profileUser && !isLoading) return <div className="p-10 text-center">Usuario no encontrado</div>;

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      <main className="mx-auto">
        {/* HEADER */}
        <div className="relative">
          {/* === BANNER === */}
          <div className="h-40 md:h-80 w-full relative bg-neutral-900 overflow-hidden group">
            <img
              src={profileUser?.banner || "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg"}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

            {isOwnProfile && (
              <button
                onClick={() => !isUploading && bannerInputRef.current.click()}
                className="absolute bottom-4 right-4 bg-base-100 text-base-content p-2 rounded-full shadow-md border border-white/40 hover:bg-base-200 transition-colors z-20"
                title="Cambiar portada"
              >
                <Camera size={20} />
              </button>
            )}
            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, "banner")} className="hidden" accept="image/*" disabled={isUploading} />
          </div>

          <div className="px-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
              
              {/* === AVATAR === */}
              <div className="relative" onClick={() => isOwnProfile && !isUploading && avatarInputRef.current.click()}>
                <div className={`avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm ${isOwnProfile ? "cursor-pointer hover:ring-primary/50" : ""}`}>
                  <div className="w-24 md:w-32 rounded-full overflow-hidden relative bg-base-200">
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <span className="loading loading-spinner text-white"></span>
                      </div>
                    )}
                    <img
                      src={profileUser?.avatar || "https://i.pinimg.com/736x/b8/b3/12/b8b312949b0c78751f6aa82849120bc9.jpg"}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                {isOwnProfile && (
                  <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-base-100 text-base-content p-2 rounded-full shadow-md border border-white/40 pointer-events-none">
                    <Camera size={16} className="md:w-5 md:h-5" />
                  </button>
                )}
                <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, "avatar")} className="hidden" accept="image/*" disabled={isUploading} />
              </div>

              {/* === BOTONES DE ACCIÓN === */}
              <div className="flex gap-2 mt-2 mb-2">
                {isOwnProfile ? (
                  <>
                    <button onClick={handleStartEditing} className="btn btn-sm md:btn-md py-1 btn-ghost border border-white/40 rounded-full px-4 md:px-6 hover:bg-base-200">
                      Editar Perfil
                    </button>
                    <button className="btn btn-sm md:btn-md btn-circle btn-ghost border border-white/40">
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

            {/* INFO USUARIO */}
            <div className="space-y-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-serif tracking-tight">
                  {profileUser?.username || "Usuario"}
                </h1>
                <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={14} /> Madrid, ES
                </p>
              </div>

              {/* BIO */}
              {isEditing ? (
                <form onSubmit={handleSaveBio} className="flex flex-col md:flex-row gap-3 items-start max-w-xl">
                  <div className="w-full relative group">
                    <textarea
                      className="w-full bg-base-200/60 text-base-content p-4 rounded-xl outline-none focus:bg-base-100 focus:ring-2 focus:ring-primary h-32 resize-none"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                       <button type="submit" className="btn btn-primary btn-sm btn-square"><Check size={14}/></button>
                       <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm btn-square"><X size={18}/></button>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="max-w-md text-base leading-relaxed opacity-80 whitespace-pre-wrap">
                  {profileUser?.bio || "Sin biografía."}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 py-4 mt-4">
                 <div className="flex flex-col md:flex-row gap-1 items-baseline">
                    <span className="font-bold text-lg">{collections.length}</span>
                    <span className="text-xs uppercase opacity-60 font-bold">Colecciones</span>
                 </div>
                 {/* Aquí podrías poner stats reales de seguidores si los tuvieras en DB */}
                 <div className="flex flex-col md:flex-row gap-1 items-baseline opacity-50">
                    <span className="font-bold text-lg">0</span>
                    <span className="text-xs uppercase opacity-60 font-bold">Seguidores</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-t border-white/40 mt-4 sticky top-16 bg-base-100/95 backdrop-blur-sm z-30">
          <div className="flex justify-center gap-4 md:gap-12">
            <button onClick={() => setActiveTab("collections")} className={`flex items-center gap-2 py-4 border-b-2 px-4 text-sm font-bold tracking-wide transition-all ${activeTab === "collections" ? "border-primary text-base-content" : "border-transparent text-base-content/40 hover:text-base-content/70"}`}>
              <Grid size={18} /> COLECCIONES
            </button>
            <button onClick={() => setActiveTab("saved")} className={`flex items-center gap-2 py-4 border-b-2 px-4 text-sm font-bold tracking-wide transition-all ${activeTab === "saved" ? "border-primary text-base-content" : "border-transparent text-base-content/40 hover:text-base-content/70"}`}>
              <Bookmark size={18} /> GUARDADO
            </button>
          </div>
        </div>

        {/* GRID DE COLECCIONES (REAL) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:px-6 min-h-[300px]">
          
          {/* Botón Nueva Colección (Solo si soy yo) */}
          {isOwnProfile && activeTab === "collections" && (
            <Link to="/create-collection" className="aspect-4/5 bg-base-100 border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-base-200/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <Plus size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100">
                Nueva
              </span>
            </Link>
          )}

          {/* Listado de Colecciones Reales */}
          {isLoading ? (
             <div className="col-span-full text-center py-10 opacity-50">Cargando...</div>
          ) : collections.map((col) => (
            <Link
              to={`/collection/${col.collection_id}`}
              key={col.collection_id}
              className="group cursor-pointer block"
            >
              <div className="card bg-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden aspect-4/5 relative">
                {/* Usamos cover_url de la DB, o una random si no tiene */}
                <img
                  src={col.cover_url || `https://picsum.photos/400?random=${col.collection_id}`}
                  alt={col.collection_name}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 flex flex-col justify-end p-5">
                  <p className="text-white font-serif font-bold truncate text-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    {col.collection_name}
                  </p>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mt-1">
                    {col.collection_type}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          
          {!isLoading && collections.length === 0 && !isOwnProfile && (
              <div className="col-span-full text-center py-10 opacity-50">Este usuario no tiene colecciones públicas.</div>
          )}
        </div>
      </main>

      <NavMobile />
    </div>
  );
};

export default Profile;