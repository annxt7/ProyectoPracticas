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

  // --- 1. LÓGICA ROBUSTA DE IDENTIDAD ---
  if (userId === "me" && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const isMe = userId === "me" || !userId || String(userId) === String(user?.id);
  const targetId = isMe ? user?.id : userId;

  // Estados
  const [profileData, setProfileData] = useState(isMe ? user : null); 
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edición
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Controla cámaras y form
  const [newDescription, setNewDescription] = useState("");

  // Sincronizar datos si soy yo
  useEffect(() => {
    if (isMe && user) {
        setProfileData(user);
        setNewDescription(user.bio || "");
    }
  }, [user, isMe]);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      if (!targetId) return; 
      setIsLoading(true);
      try {
        const res = await api.get(`/collections/user/${targetId}`);
        setCollections(res.data);

        if (!isMe) {
             setProfileData({
                 username: "Usuario " + targetId,
                 bio: "Perfil público",
                 avatar: null,
                 banner: null
             });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [targetId, isMe]);

  // --- HANDLERS ---
  const handleSaveBio = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/update-profile", { bio: newDescription });
      updateUser({ bio: newDescription }); 
      setIsEditing(false); // Cierra edición al guardar
    } catch (error) { console.error(error); }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("imagen", file);
      const res = await api.post("/files/upload", fd); 
      
      const payload = type === "avatar" ? { avatarUrl: res.data.url } : { bannerUrl: res.data.url };
      await api.put("/users/update-profile", payload); 

      updateUser(type === "avatar" ? { avatar: res.data.url } : { banner: res.data.url });
    } catch (error) { console.error(error); } 
    finally { setIsUploading(false); }
  };

  const getImg = (url, fallback) => url ? url : fallback;
  const DEFAULT_AVATAR = "https://i.pinimg.com/736x/b8/b3/12/b8b312949b0c78751f6aa82849120bc9.jpg";
  const DEFAULT_BANNER = "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg";

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      <main className="mx-auto">
        
        {/* BANNER */}
        <div className="relative h-40 md:h-80 w-full bg-neutral-900 overflow-hidden group">
            <img 
                src={getImg(profileData?.banner, DEFAULT_BANNER)} 
                className="w-full h-full object-cover" 
                alt="banner"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent"></div>
            
            {/* CÁMARA BANNER: Solo sale si estoy editando (isEditing = true) */}
            {isMe && isEditing && (
                <button onClick={() => !isUploading && bannerInputRef.current.click()} className="absolute bottom-4 right-4 bg-base-100 p-2 rounded-full shadow-md z-20 hover:bg-base-200 cursor-pointer animate-in fade-in zoom-in duration-300">
                    {isUploading ? <span className="loading loading-spinner loading-xs"/> : <Camera size={20} />}
                </button>
            )}
            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, "banner")} className="hidden" accept="image/*"/>
        </div>

        <div className="px-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
                
                {/* AVATAR */}
                <div className="relative">
                    <div 
                        // Solo deja hacer click si estoy editando
                        onClick={() => isMe && isEditing && !isUploading && avatarInputRef.current.click()} 
                        className={`avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm ${isMe && isEditing ? "cursor-pointer hover:ring-primary" : ""}`}
                    >
                        <div className="w-24 md:w-32 rounded-full overflow-hidden bg-base-200">
                            <img src={getImg(profileData?.avatar, DEFAULT_AVATAR)} className="object-cover w-full h-full" alt="avatar"/>
                        </div>
                    </div>

                    {/* CÁMARA AVATAR: Solo sale si estoy editando */}
                    {isMe && isEditing && !isUploading && (
                        <div className="absolute bottom-1 right-1 bg-base-100 p-1.5 rounded-full shadow-md pointer-events-none animate-in fade-in zoom-in duration-300">
                            <Camera size={16}/>
                        </div>
                    )}
                    <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, "avatar")} className="hidden" accept="image/*"/>
                </div>

                {/* BOTONES PRINCIPALES */}
                <div className="flex gap-2 mb-2">
                    {isMe ? (
                        <>
                            {/* Si NO estoy editando, muestro el botón de Editar. Si ya estoy editando, lo oculto (opcional) */}
                            {!isEditing && (
                                <button onClick={() => { setIsEditing(true); setNewDescription(profileData?.bio || ""); }} className="btn btn-sm md:btn-md btn-ghost border border-white/40 rounded-full">
                                    Editar Perfil
                                </button>
                            )}
                            
                            <button className="btn btn-sm md:btn-md btn-circle btn-ghost border border-white/40">
                                <Settings size={18}/>
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary btn-sm rounded-full px-6 gap-2"><UserPlus size={16}/> Seguir</button>
                    )}
                </div>
            </div>

            {/* INFO Y BIO */}
            <div className="space-y-3 mb-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold font-serif">{profileData?.username || "Cargando..."}</h1>
                    <p className="text-sm opacity-60 flex items-center gap-1 mt-1"><MapPin size={14}/> Madrid, ES</p>
                </div>

                {/* --- AQUÍ ESTÁ EL ESTILO QUE QUERÍAS --- */}
                {isEditing ? (
                    <form onSubmit={handleSaveBio} className="flex flex-col gap-2 max-w-xl animate-in slide-in-from-top-2 duration-300">
                        <textarea 
                            className="textarea textarea-bordered w-full h-32 text-base focus:textarea-primary" 
                            value={newDescription} 
                            onChange={e => setNewDescription(e.target.value)} 
                            autoFocus
                            placeholder="Escribe algo sobre ti..."
                        />
                        <div className="flex justify-end gap-2">
                            {/* Botón Check (Guardar) */}
                            <button type="submit" className="btn btn-primary btn-sm btn-square">
                                <Check size={18}/>
                            </button>
                            {/* Botón X (Cancelar) */}
                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm btn-square hover:bg-base-200">
                                <X size={18}/>
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="max-w-md text-base opacity-80 whitespace-pre-wrap leading-relaxed">
                        {profileData?.bio || "¡Hola! Soy nuevo en Tribe."}
                    </p>
                )}
                {/* -------------------------------------- */}

                <div className="flex gap-6 py-4 mt-4">
                    <div className="flex gap-1 items-baseline">
                        <span className="font-bold text-lg">{collections.length}</span>
                        <span className="text-xs uppercase opacity-60 font-bold">Colecciones</span>
                    </div>
                </div>
            </div>
        </div>

        {/* TABS Y GRID */}
        <div className="border-t border-white/40 mt-4 sticky top-16 bg-base-100/95 z-30 flex justify-center gap-12 backdrop-blur-md">
            <button onClick={() => setActiveTab("collections")} className={`py-4 border-b-2 px-4 text-sm font-bold ${activeTab==="collections"?"border-primary":"border-transparent opacity-50"}`}>COLECCIONES</button>
            <button onClick={() => setActiveTab("saved")} className={`py-4 border-b-2 px-4 text-sm font-bold ${activeTab==="saved"?"border-primary":"border-transparent opacity-50"}`}>GUARDADO</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 min-h-[300px] max-w-6xl mx-auto">
            {isMe && activeTab === "collections" && (
                <Link to="/create-collection" className="aspect-[4/5] border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center hover:border-primary/50 hover:bg-base-200/50 transition-all opacity-60 hover:opacity-100 cursor-pointer">
                    <Plus size={32} />
                    <span className="text-xs font-bold mt-2 uppercase">Nueva</span>
                </Link>
            )}
            
            {collections.map(col => (
                <Link to={`/collection/${col.collection_id}`} key={col.collection_id} className="card bg-base-200 shadow-sm aspect-[4/5] hover:scale-[1.02] transition-transform cursor-pointer group">
                    <figure className="relative h-full">
                        <img src={col.cover_url || `https://picsum.photos/400?random=${col.collection_id}`} className="w-full h-full object-cover" alt="cover"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            <h3 className="text-white font-bold leading-tight">{col.collection_name}</h3>
                            <p className="text-white/70 text-xs mt-1">{col.collection_type}</p>
                        </div>
                    </figure>
                </Link>
            ))}
        </div>

      </main>
      <NavMobile />
    </div>
  );
};

export default Profile;