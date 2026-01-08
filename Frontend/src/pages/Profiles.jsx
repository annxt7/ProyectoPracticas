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
  const { userId } = useParams();

  // --- CORRECCIÓN DEFINITIVA AQUÍ ---
  // Ahora buscamos 'id' primero, que es lo que tiene tu usuario Pepe
  const myId = user?.id || user?.userId || user?.user_id;

  // Lógica para saber qué perfil cargar
  let targetId;
  if (!userId || userId === "me") {
      targetId = myId;
  } else {
      targetId = userId;
  }

  // Comparamos como texto para evitar errores
  const isOwnProfile = String(targetId) === String(myId);
  // ----------------------------------

  // Estados
  const [profileUser, setProfileUser] = useState(null); 
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edición
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  // EFECTO: CARGAR DATOS
  useEffect(() => {
    const fetchProfileData = async () => {
      // Si no hay ID (ej: recargando página), esperamos
      if (!targetId) return;

      setIsLoading(true);
      try {
        // 1. Cargar colecciones
        const colRes = await api.get(`/collections/user/${targetId}`);
        setCollections(colRes.data);

        // 2. Cargar datos del usuario
        if (isOwnProfile) {
            setProfileUser(user);
            setNewDescription(user?.bio || "");
        } else {
            // Si visitamos a otro, mostramos datos genéricos hasta tener el endpoint de usuarios
            setProfileUser({ 
                username: "Usuario " + targetId, 
                bio: "Perfil de usuario.", 
                avatar: null, 
                banner: null 
            });
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [targetId, user, isOwnProfile]);

  // Handlers
  const handleStartEditing = () => {
    setNewDescription(profileUser?.bio || "");
    setIsEditing(true);
  };

  const handleSaveBio = async (e) => {
    e.preventDefault();
    if (newDescription.trim()) {
      try {
        await api.put("/users/update-profile", { bio: newDescription });
        setProfileUser((prev) => ({ ...prev, bio: newDescription }));
        updateUser({ bio: newDescription });
        setIsEditing(false);
      } catch (error) {
        console.error("Error bio:", error);
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

      // Actualizamos contexto y estado local
      const updateData = type === "avatar" ? { avatar: cloudUrl } : { banner: cloudUrl };
      updateUser(updateData);
      setProfileUser((prev) => ({ ...prev, ...updateData }));

    } catch (error) {
      alert("Error al subir imagen");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper para imágenes (Fallback)
  const getAvatarSrc = (u) => u?.avatar || u?.avatar_url || "https://i.pinimg.com/736x/b8/b3/12/b8b312949b0c78751f6aa82849120bc9.jpg";
  const getBannerSrc = (u) => u?.banner || u?.banner_url || "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg";

  // Render
  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      <main className="mx-auto">
        <div className="relative">
          {/* BANNER */}
          <div className="h-40 md:h-80 w-full relative bg-neutral-900 overflow-hidden group">
            <img
              src={getBannerSrc(profileUser || user)}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

            {isOwnProfile && (
              <button
                onClick={() => !isUploading && bannerInputRef.current.click()}
                className="absolute bottom-4 right-4 bg-base-100 text-base-content p-2 rounded-full shadow-md hover:bg-base-200 z-20"
              >
                <Camera size={20} />
              </button>
            )}
            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, "banner")} className="hidden" accept="image/*" disabled={isUploading} />
          </div>

          <div className="px-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
              
              {/* AVATAR */}
              <div className="relative" onClick={() => isOwnProfile && !isUploading && avatarInputRef.current.click()}>
                <div className={`avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm ${isOwnProfile ? "cursor-pointer hover:ring-primary/50" : ""}`}>
                  <div className="w-24 md:w-32 rounded-full overflow-hidden relative bg-base-200">
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <span className="loading loading-spinner text-white"></span>
                      </div>
                    )}
                    <img
                      src={getAvatarSrc(profileUser || user)}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, "avatar")} className="hidden" accept="image/*" disabled={isUploading} />
              </div>

              {/* BOTONES */}
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
                  <button className="btn btn-primary btn-sm rounded-full px-6 gap-2">
                    <UserPlus size={16} /> Seguir
                  </button>
                )}
              </div>
            </div>

            {/* INFO */}
            <div className="space-y-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-serif tracking-tight">
                  {(profileUser || user)?.username}
                </h1>
                <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={14} /> Madrid, ES
                </p>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveBio} className="flex flex-col gap-2 max-w-xl">
                  <textarea
                    className="textarea textarea-bordered w-full h-32"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                     <button type="submit" className="btn btn-primary btn-sm"><Check size={14}/></button>
                     <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm"><X size={18}/></button>
                  </div>
                </form>
              ) : (
                <p className="max-w-md text-base leading-relaxed opacity-80 whitespace-pre-wrap">
                  {(profileUser || user)?.bio || "¡Hola! Soy nuevo en Tribe."}
                </p>
              )}

              {/* STATS */}
              <div className="flex gap-6 py-4 mt-4">
                 <div className="flex flex-col md:flex-row gap-1 items-baseline">
                    <span className="font-bold text-lg">{collections.length}</span>
                    <span className="text-xs uppercase opacity-60 font-bold">Colecciones</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS Y GRID */}
        <div className="border-t border-white/40 mt-4 sticky top-16 bg-base-100/95 backdrop-blur-sm z-30 flex justify-center gap-12">
            <button onClick={() => setActiveTab("collections")} className={`py-4 border-b-2 px-4 text-sm font-bold ${activeTab==="collections" ? "border-primary" : "border-transparent opacity-50"}`}>COLECCIONES</button>
            <button onClick={() => setActiveTab("saved")} className={`py-4 border-b-2 px-4 text-sm font-bold ${activeTab==="saved" ? "border-primary" : "border-transparent opacity-50"}`}>GUARDADO</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:px-6 min-h-[300px]">
          {isOwnProfile && activeTab === "collections" && (
            <Link to="/create-collection" className="aspect-4/5 bg-base-100 border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-base-200/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <Plus size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100">Nueva</span>
            </Link>
          )}

          {!isLoading && collections.map((col) => (
            <Link to={`/collection/${col.collection_id}`} key={col.collection_id} className="group cursor-pointer block">
              <div className="card bg-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden aspect-4/5 relative">
                <img
                  src={col.cover_url || `https://picsum.photos/400?random=${col.collection_id}`}
                  alt={col.collection_name}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 flex flex-col justify-end p-5">
                  <p className="text-white font-serif font-bold truncate text-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">{col.collection_name}</p>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mt-1">{col.collection_type}</p>
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