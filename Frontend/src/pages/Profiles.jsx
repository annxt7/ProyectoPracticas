import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Settings, UserPlus, Grid, Bookmark, Check, MapPin, Share2, X, Camera, Plus } from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { userId } = useParams(); // Lo que viene de la URL

  // --- LÓGICA DE DETECCIÓN (DIAGNÓSTICO) ---
  const contextId = user?.userId || user?.user_id; // Tu ID real
  
  // Si la URL es "me" o está vacía, usamos tu ID. Si no, usamos lo de la URL.
  let effectiveId = null;
  if (!userId || userId === "me") {
      effectiveId = contextId;
  } else {
      effectiveId = userId;
  }

  const isOwnProfile = String(effectiveId) === String(contextId);

  // Estados
  const [activeTab, setActiveTab] = useState("collections");
  const [profileUser, setProfileUser] = useState(null); 
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Edición
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        setErrorMsg("");

        if (!effectiveId) {
            setErrorMsg("ESPERANDO: No hay ID válido todavía (Login lento o URL mal)");
            setIsLoading(false);
            return;
        }

        try {
            // 1. Cargar colecciones
            console.log(`Pidiendo colecciones para: ${effectiveId}`);
            const colRes = await api.get(`/collections/user/${effectiveId}`);
            setCollections(colRes.data);

            // 2. Cargar usuario
            if (isOwnProfile) {
                setProfileUser(user); // Usamos datos del contexto si soy yo
                setNewDescription(user?.bio || "");
            } else {
                // Perfil de otro (Simulado por ahora)
                setProfileUser({ username: "Visitando ID " + effectiveId, bio: "Perfil externo", avatar: null, banner: null });
            }

        } catch (err) {
            console.error("Error API:", err);
            setErrorMsg(`ERROR API: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (user) { // Solo cargamos si el usuario (contexto) ya existe
        loadData();
    }
  }, [effectiveId, user, isOwnProfile]);

  // Handlers simplificados para no ocupar espacio
  const handleStartEditing = () => { setNewDescription(profileUser?.bio || ""); setIsEditing(true); };
  const handleSaveBio = async (e) => {
      e.preventDefault();
      await api.put("/users/update-profile", { bio: newDescription });
      updateUser({ bio: newDescription }); setProfileUser(prev => ({...prev, bio: newDescription})); setIsEditing(false);
  };
  const handleFileUpload = async (e, type) => {
      const file = e.target.files[0]; if(!file) return; setIsUploading(true);
      const fd = new FormData(); fd.append("imagen", file);
      const res = await api.post("/files/upload", fd);
      const payload = type === "avatar" ? { avatarUrl: res.data.url } : { bannerUrl: res.data.url };
      await api.put("/users/update-profile", payload);
      updateUser(type === "avatar" ? {avatar: res.data.url} : {banner: res.data.url});
      setIsUploading(false);
  };

  // --- RENDERIZADO DE DIAGNÓSTICO ---
  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      
      {/* === ZONA DE DIAGNÓSTICO (BORRAR LUEGO) === */}
      <div className="bg-red-100 border-2 border-red-500 p-4 m-4 text-red-900 font-mono text-sm rounded-lg">
          <h3 className="font-bold">🛠 MODO DIAGNÓSTICO 🛠</h3>
          <p><strong>1. URL Params (userId):</strong> {userId ? `"${userId}"` : "undefined (estás en /profile)"}</p>
          <p><strong>2. Context User ID:</strong> {contextId || "Cargando..."}</p>
          <p><strong>3. ID Calculado (Effective):</strong> {effectiveId || "NULL"}</p>
          <p><strong>4. ¿Es mi perfil?:</strong> {isOwnProfile ? "SÍ" : "NO"}</p>
          <p><strong>5. Estado Carga:</strong> {isLoading ? "Cargando..." : "Listo"}</p>
          <p><strong>6. Profile User Data:</strong> {profileUser ? "OK (Datos cargados)" : "NULL (Vacío)"}</p>
          {errorMsg && <p className="font-bold bg-white p-1">⚠️ ERROR: {errorMsg}</p>}
      </div>
      {/* =========================================== */}

      <main className="mx-auto">
        <div className="relative">
          {/* BANNER */}
          <div className="h-40 md:h-80 w-full relative bg-neutral-900 overflow-hidden group">
            <img src={profileUser?.banner || user?.banner || "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg"} className="w-full h-full object-cover" />
            {isOwnProfile && <button onClick={() => bannerInputRef.current.click()} className="absolute bottom-4 right-4 bg-base-100 p-2 rounded-full z-20"><Camera size={20} /></button>}
            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, "banner")} className="hidden" />
          </div>

          <div className="px-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
              {/* AVATAR */}
              <div className="relative" onClick={() => isOwnProfile && avatarInputRef.current.click()}>
                <div className="avatar ring-4 ring-base-100 rounded-full w-24 md:w-32 overflow-hidden bg-base-200">
                    <img src={profileUser?.avatar || user?.avatar || "https://i.pinimg.com/736x/b8/b3/12/b8b312949b0c78751f6aa82849120bc9.jpg"} className="object-cover w-full h-full" />
                </div>
                <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, "avatar")} className="hidden" />
              </div>
              <div className="flex gap-2 mb-2">
                {isOwnProfile ? <button onClick={handleStartEditing} className="btn btn-sm">Editar</button> : <button className="btn btn-primary btn-sm">Seguir</button>}
              </div>
            </div>

            <div className="space-y-3 mb-6">
                <h1 className="text-2xl font-bold">{profileUser?.username || user?.username || "Usuario"}</h1>
                {isEditing ? (
                    <form onSubmit={handleSaveBio}><textarea className="textarea w-full" value={newDescription} onChange={e=>setNewDescription(e.target.value)} /><button className="btn btn-xs">Guardar</button></form>
                ) : (
                    <p>{profileUser?.bio || "Sin bio"}</p>
                )}
            </div>
          </div>
        </div>
        
        {/* COLECCIONES */}
        <div className="p-4 grid grid-cols-2 gap-4">
            {collections.map(col => (
                <Link key={col.collection_id} to={`/collection/${col.collection_id}`} className="card bg-base-200 aspect-square">
                    <div className="card-body p-4 flex items-end"><p className="font-bold text-white">{col.collection_name}</p></div>
                </Link>
            ))}
        </div>
      </main>
      <NavMobile />
    </div>
  );
};

export default Profile;