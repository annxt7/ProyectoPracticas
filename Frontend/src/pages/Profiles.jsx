import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SettingsModal from "../components/Config";
import FollowsModal from "../components/FollowsModal";
import {
  Settings,
  UserPlus,
  Check,
  X,
  Camera,
  Plus,
  Trash2,
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ItemCover from "../components/ItemCover";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("collections");
  const { user, updateUser } = useAuth();
  const { userId } = useParams();

  // Estado para controlar el modal de ajustes
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  //Perfil propio??
  const isMe = userId === "me" || String(userId) === String(user?.id);
  const targetId = isMe ? user?.id : userId;

  const [profileData, setProfileData] = useState(isMe ? user : null);
  const [collections, setCollections] = useState([]);
  const [savedCollections, setSavedCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followModal, setFollowModal] = useState({
    open: false,
    type: "followers",
    title: "",
  });

  // Edición
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?background=random&color=fff&name=User";
  const DEFAULT_BANNER =
    "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg";
  const getImg = (url, fallback) => (url ? url : fallback);

  useEffect(() => {
    if (isMe && user) {
      setProfileData(user);
      setNewDescription(user.bio || "");
    }
  }, [user, isMe]);
  useEffect(() => {
    const fetchData = async () => {
      console.log("Cargando perfil para ID:", targetId);
      if (!targetId) return;
      setIsLoading(true);
      setCollections([]);
      setSavedCollections([]);

      try {
        const collectionsPromise = api.get(`/collections/user/${targetId}`);
        const statsPromise = api.get(`/users/follow-stats/${targetId}`);
        let userPromise = Promise.resolve({ data: null });
        let savedPromise = Promise.resolve({ data: [] });

        if (!isMe) {
          userPromise = api.get(`/users/${targetId}`);
        } else {
          savedPromise = api.get(`/collections/saved/${targetId}`);
        }

        const [colRes, uRes, sRes,statsRes] = await Promise.all([
          collectionsPromise,
          userPromise,
          savedPromise,
          statsPromise
        ]);
        setCollections(colRes.data || []);
        setSavedCollections(isMe ? sRes.data || [] : []);
        setFollowStats({
          followers: statsRes.data.followers || 0,
          following: statsRes.data.following || 0,
        });
        setIsFollowing(statsRes.data.amIFollowing || false);
        if (!isMe && uRes.data) {
          setProfileData(uRes.data);
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
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
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("imagen", file);
      const res = await api.post("/files/upload", fd);
      const payload =
        type === "avatar"
          ? { avatarUrl: res.data.url }
          : { bannerUrl: res.data.url };
      await api.put("/users/update-profile", payload);
      updateUser(
        type === "avatar" ? { avatar: res.data.url } : { banner: res.data.url }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCollection = async (e, collection_id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que quieres borrar esta colección?"))
      return;
    try {
      await api.delete(`/collections/${collection_id}`);
      setCollections((prev) =>
        prev.filter((c) => c.collection_id !== collection_id)
      );
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  };
  const handleDeleteSavedCollection = async (e, collection_id) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta colección de tus guardados?"
      )
    )
      return;
    try {
      await api.delete(`/collections/saved/${collection_id}`);
      setSavedCollections((prev) =>
        prev.filter((c) => c.collection_id !== collection_id)
      );
    } catch (error) {
      console.error("Error al eliminar de guardados:", error);
    }
  };

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${targetId}`);
        setFollowStats((prev) => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await api.post(`/users/follow/${targetId}`);
        setFollowStats((prev) => ({ ...prev, followers: prev.followers + 1 }));
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error al cambiar estado de seguimiento:", error);
    }
  };
  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      <main className="mx-auto">
        {/* HEADER: Banner */}
        <div className="relative h-40 md:h-80 w-full bg-neutral-900 overflow-hidden group">
          <img
            src={getImg(profileData?.banner, DEFAULT_BANNER)}
            className="w-full h-full object-cover"
            alt="banner"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
          {isMe && isEditing && (
            <button
              onClick={() => !isUploading && bannerInputRef.current.click()}
              className="absolute bottom-4 right-4 bg-base-100 p-2 rounded-full shadow-md z-20 hover:bg-base-200 transition-all"
            >
              {isUploading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Camera size={20} />
              )}
            </button>
          )}
          <input
            type="file"
            ref={bannerInputRef}
            onChange={(e) => handleFileUpload(e, "banner")}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="px-6 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            {/* AVATAR */}
            <div className="relative">
              <div
                onClick={() =>
                  isMe &&
                  isEditing &&
                  !isUploading &&
                  avatarInputRef.current.click()
                }
                className={`avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm ${
                  isMe && isEditing ? "cursor-pointer hover:ring-primary" : ""
                }`}
              >
                <div className="w-24 md:w-32 rounded-full overflow-hidden bg-base-200">
                  <img
                    src={getImg(profileData?.avatar, DEFAULT_AVATAR)}
                    alt="avatar"
                  />
                </div>
              </div>
              {isMe && isEditing && !isUploading && (
                <div className="absolute bottom-1 right-1 bg-base-100 p-1.5 rounded-full shadow-md pointer-events-none">
                  <Camera size={16} />
                </div>
              )}
              <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => handleFileUpload(e, "avatar")}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-2 mb-2">
              {isMe ? (
                <>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-sm md:btn-md btn-ghost border border-white/40 rounded-full"
                    >
                      Editar Perfil
                    </button>
                  )}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="btn btn-sm md:btn-md btn-circle btn-ghost border border-white/40"
                  >
                    <Settings size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`btn btn-sm md:btn-md rounded-full px-6 gap-2 ${
                    isFollowing ? "btn-neutral" : "btn-primary"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check size={16} /> Siguiendo
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Seguir
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* INFORMACIÓN DEL PERFIL */}
        <div className="space-y-3 mb-6">
            <h1 className="text-2xl md:text-4xl font-bold font-serif">
              {profileData?.username || "Usuario"}
            </h1>

            {/* ... (Bio igual) ... */}

            <div className="flex gap-6 py-4 mt-4">
              <div className="flex gap-1 items-baseline">
                <span className="font-bold text-lg">{collections.length}</span>
                <span className="text-xs uppercase opacity-60 font-bold">Colecciones</span>
              </div>

              {/* CONTADOR SEGUIDORES (Clickable) */}
              <div 
                className="flex gap-1 items-baseline cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => setFollowModal({ open: true, type: "followers", title: "Seguidores" })}
              >
                <span className="font-bold text-lg">{followStats.followers}</span>
                <span className="text-xs uppercase opacity-60 font-bold">Seguidores</span>
              </div>

              {/* CONTADOR SEGUIDOS (Clickable) */}
              <div 
                className="flex gap-1 items-baseline cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => setFollowModal({ open: true, type: "following", title: "Siguiendo" })}
              >
                <span className="font-bold text-lg">{followStats.following}</span>
                <span className="text-xs uppercase opacity-60 font-bold">Siguiendo</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVEGACIÓN */}
        <div className="border-t border-white/10 mt-4 sticky top-16 bg-base-100/95 z-30 flex justify-center gap-12 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("collections")}
            className={`py-4 border-b-2 px-4 text-sm font-bold transition-all ${
              activeTab === "collections"
                ? "border-primary text-primary"
                : "border-transparent opacity-50"
            }`}
          >
            COLECCIONES
          </button>
          {isMe && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`py-4 border-b-2 px-4 text-sm font-bold transition-all ${
                activeTab === "saved"
                  ? "border-primary text-primary"
                  : "border-transparent opacity-50"
              }`}
            >
              GUARDADO
            </button>
          )}
        </div>

        {/* GRID DE CONTENIDO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 min-h-[300px] max-w-6xl mx-auto">
          {isMe && activeTab === "collections" && (
            <Link
              to="/create-collection"
              className="aspect-4/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-primary/50 hover:bg-white/5 transition-all opacity-60 hover:opacity-100"
            >
              <Plus size={32} />
              <span className="text-xs font-bold mt-2 uppercase">Nueva</span>
            </Link>
          )}
          {/* COLECCIONES PROPIAS */}
          {activeTab === "collections" &&
            collections.map((col) => (
              <Link
                to={`/collection/${col.collection_id}`}
                key={col.collection_id}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-base-200 shadow-sm hover:scale-[1.02] transition-transform group"
              >
                {col.cover_url ? (
                  <img
                    src={col.cover_url}
                    className="w-full h-full object-cover"
                    alt="cover"
                  />
                ) : (
                  <ItemCover
                    src={col.cover_url}
                    title={col.collection_name}
                    className="w-full h-full object-cover"
                  />
                )}
                <img
                  src={
                    col.cover_url ||
                    `https://ui-avatars.com/api/?name=${col.collection_name}&background=random`
                  }
                  className="w-full h-full object-cover"
                  alt="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold leading-tight">
                    {col.collection_name}
                  </h3>
                  <p className="text-white/70 text-xs mt-1 capitalize">
                    {col.collection_type}
                  </p>
                </div>
                {isMe && (
                  <button
                    onClick={(e) =>
                      handleDeleteCollection(e, col.collection_id)
                    }
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </Link>
            ))}
          {/* COLECCIONES GUARDADAS */}
          {activeTab === "saved" &&
            isMe &&
            savedCollections.map((col) => (
              <Link
                to={`/collection/${col.collection_id}`}
                key={col.collection_id}
                className="relative aspect-4/5 rounded-2xl overflow-hidden bg-base-200 shadow-sm hover:scale-[1.02] transition-transform group"
              >
                <img
                  src={
                    col.cover_url ||
                    `https://ui-avatars.com/api/?name=${col.collection_name}&background=random`
                  }
                  className="w-full h-full object-cover"
                  alt="cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold leading-tight">
                    {col.collection_name}
                  </h3>
                  <p className="text-white/70 text-xs mt-1 capitalize">
                    {col.collection_type}
                  </p>
                </div>
                {isMe && (
                  <button
                    onClick={(e) =>
                      handleDeleteSavedCollection(e, col.collection_id)
                    }
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </Link>
            ))}
        </div>

        {/* Config*/}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
        <FollowsModal
          isOpen={followModal.open}
          onClose={() => setFollowModal({ ...followModal, open: false })}
          userId={targetId}
          type={followModal.type}
          title={followModal.title}
        />
      </main>

      <NavMobile />
    </div>
  );
};

export default Profile;
