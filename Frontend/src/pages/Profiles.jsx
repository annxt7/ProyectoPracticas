import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Settings, UserPlus, Grid, Bookmark, Check, MapPin, Share2, X, Camera, Plus } from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("collections");
  const { user, updateUser } = useAuth();
  const { userId } = useParams(); // ID de la URL
  const myId = user?.id;
  const targetId = userId || myId;
  const isOwnProfile = String(targetId) === String(myId);

  // Estados
  const [profileUser, setProfileUser] = useState(null); 
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs y Edición
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  // EFECTO: CARGAR DATOS
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // A. Cargar Colecciones
        const colRes = await api.get(`/collections/user/${targetId}`);
        setCollections(colRes.data);

        // B. Cargar Usuario
        if (isOwnProfile) {
            // Si soy yo, uso los datos del contexto que ya están estandarizados
            setProfileUser(user);
            setNewDescription(user?.bio || "");
        } else {
            // Si es otro usuario, simulamos datos (hasta que tengas endpoint GET /users/:id)
            // Aquí idealmente harías: const u = await api.get(`/users/${targetId}`); setProfileUser(u.data);
            setProfileUser({ 
                username: "Usuario " + targetId, 
                bio: "Bio no disponible", 
                avatar: null, // Saldrá la por defecto
                banner: null  // Saldrá la por defecto
            });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (targetId) fetchProfileData();
  }, [targetId, user, isOwnProfile]);

  // --- HANDLERS (Igual que antes) ---
  const handleStartEditing = () => {
    setNewDescription(profileUser?.bio || "");
    setIsEditing(true);
  };

  const handleSaveBio = async (e) => {
    e.preventDefault();
    if (!newDescription.trim()) return;
    try {
      await api.put("/users/update-profile", { bio: newDescription });
      setProfileUser(prev => ({ ...prev, bio: newDescription }));
      updateUser({ bio: newDescription });
      setIsEditing(false);
    } catch (error) { console.error(error); }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("imagen", file);
      const uploadRes = await api.post("/files/upload", formData, { headers: { "Content-Type": "multipart/form-data" }});
      const cloudUrl = uploadRes.data.url;

      const payload = type === "avatar" ? { avatarUrl: cloudUrl } : { bannerUrl: cloudUrl };
      await api.put("/users/update-profile", payload);

      // Actualizamos con los nombres estándar: 'avatar' y 'banner'
      const updateKey = type === "avatar" ? "avatar" : "banner";
      updateUser({ [updateKey]: cloudUrl });
      setProfileUser(prev => ({ ...prev, [updateKey]: cloudUrl }));

    } catch (error) { alert("Error subiendo imagen"); } 
    finally { setIsUploading(false); }
  };

  if (!profileUser && !isLoading) return <div className="p-10 text-center">Cargando perfil...</div>;

  // IMAGENES POR DEFECTO CENTRALIZADAS
  const defaultAvatar = "https://i.pinimg.com/736x/b8/b3/12/b8b312949b0c78751f6aa82849120bc9.jpg";
  const defaultBanner = "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg";

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      <main className="mx-auto">
        <div className="relative">
          {/* BANNER */}
          <div className="h-40 md:h-80 w-full relative bg-neutral-900 overflow-hidden group">
            <img 
                src={profileUser?.banner || defaultBanner} 
                className="w-full h-full object-cover" alt="cover" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent"></div>
            {isOwnProfile && (
              <button onClick={() => !isUploading && bannerInputRef.current.click()} className="absolute bottom-4 right-4 bg-base-100 p-2 rounded-full shadow-md z-20 hover:bg-base-200">
                <Camera size={20} />
              </button>
            )}
            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, "banner")} className="hidden" accept="image/*" disabled={isUploading}/>
          </div>

          <div className="px-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
              {/* AVATAR */}
              <div className="relative" onClick={() => isOwnProfile && !isUploading && avatarInputRef.current.click()}>
                <div className={`avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm ${isOwnProfile ? "cursor-pointer hover:ring-primary/50" : ""}`}>
                  <div className="w-24 md:w-32 rounded-full overflow-hidden relative bg-base-200">
                    {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"><span className="loading loading-spinner text-white"></span></div>}
                    <img src={profileUser?.avatar || defaultAvatar} className="object-cover w-full h-full" alt="avatar"/>
                  </div>
                </div>
                {isOwnProfile && <button className="absolute bottom-1 right-1 bg-base-100 p-2 rounded-full shadow-md pointer-events-none"><Camera size={16}/></button>}
                <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, "avatar")} className="hidden" accept="image/*" disabled={isUploading}/>
              </div>

              {/* BOTONES */}
              <div className="flex gap-2 mt-2 mb-2">
                {isOwnProfile ? (
                  <>
                    <button onClick={handleStartEditing} className="btn btn-sm md:btn-md btn-ghost border border-white/40 rounded-full px-6">Editar Perfil</button>
                    <button className="btn btn-sm md:btn-md btn-circle btn-ghost border border-white/40"><Settings size={18}/></button>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm rounded-full px-6 gap-2"><UserPlus size={16}/> Seguir</button>
                )}
              </div>
            </div>

            {/* TEXTOS */}
            <div className="space-y-3 mb-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold font-serif">{profileUser?.username}</h1>
                    <p className="text-sm opacity-60 flex items-center gap-1 mt-1"><MapPin size={14}/> Madrid, ES</p>
                </div>
                {isEditing ? (
                    <form onSubmit={handleSaveBio} className="flex flex-col gap-2 max-w-xl">
                        <textarea className="textarea textarea-bordered w-full h-32" value={newDescription} onChange={e => setNewDescription(e.target.value)} autoFocus/>
                        <div className="flex justify-end gap-2">
                            <button type="submit" className="btn btn-primary btn-sm"><Check size={14}/></button>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm"><X size={18}/></button>
                        </div>
                    </form>
                ) : (
                    <p className="max-w-md opacity-80 whitespace-pre-wrap">{profileUser?.bio || "Sin biografía."}</p>
                )}
                
                {/* STATS */}
                <div className="flex gap-6 py-4 mt-4">
                    <div className="flex gap-1 items-baseline"><span className="font-bold text-lg">{collections.length}</span><span className="text-xs opacity-60 font-bold">Colecciones</span></div>
                </div>
            </div>
          </div>
        </div>

        {/* COLECCIONES GRID */}
        <div className="border-t border-white/40 mt-4 sticky top-16 bg-base-100/95 z-30 flex justify-center gap-12">
            <button onClick={() => setActiveTab("collections")} className={`py-4 border-b-2 px-4 text-sm font-bold ${activeTab==="collections" ? "border-primary" : "border-transparent opacity-50"}`}>COLECCIONES</button>
            <button onClick={() => setActiveTab("saved")} className={`py-4 border-b-2 px-4 text-sm font-bold ${activeTab==="saved" ? "border-primary" : "border-transparent opacity-50"}`}>GUARDADO</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 min-h-[300px]">
            {isOwnProfile && activeTab === "collections" && (
                <Link to="/create-collection" className="aspect-4/5 border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center hover:border-primary opacity-60 hover:opacity-100">
                    <Plus size={32}/> <span className="text-xs font-bold mt-2 uppercase">Nueva</span>
                </Link>
            )}
            {!isLoading && collections.map(col => (
                <Link to={`/collection/${col.collection_id}`} key={col.collection_id} className="card bg-base-200 shadow-sm aspect-4/5 hover:scale-105 transition-transform">
                    <img src={col.cover_url || `https://picsum.photos/400?random=${col.collection_id}`} className="w-full h-full object-cover rounded-xl" alt={col.collection_name}/>
                    <div className="absolute inset-0 bg-black/40 flex items-end p-4 rounded-xl">
                        <p className="text-white font-bold">{col.collection_name}</p>
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