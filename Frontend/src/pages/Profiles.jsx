import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import SettingsModal from "../components/Config";
import FollowsModal from "../components/FollowsModal";
import { useTranslation } from "react-i18next"; 
import {
  Settings,
  UserPlus,
  Check,
  X,
  Camera,
  Plus,
  Trash2,
  Filter,
  ArrowDownWideNarrow
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ItemCover from "../components/ItemCover";
import { normalizeUser } from "../services/normalizers";
import NavDesktop from "../components/NavDesktop";
import NavMobile from "../components/NavMobile";

const Profile = () => {
  const { t } = useTranslation(); 
  const [activeTab, setActiveTab] = useState("collections");
  const { user, updateUser } = useAuth();
  const { userId } = useParams();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMe = userId === "me" || Number(userId) === Number(user?.id);
  const targetId = isMe ? user?.id : userId;
  const [profileData, setProfileData] = useState(null);
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
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    type: null,
    title: "",
  });
  const [filter, setFilter] = useState({ sortBy: "recent", order: "DESC" });
  
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=random&color=fff&name=User";
  const DEFAULT_BANNER = "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg";

  const getImg = (url, fallback) => (url ? url : fallback);

  useEffect(() => {
    if (isMe && user) {
      const normalized = normalizeUser(user);
      setProfileData(normalized);
      setNewDescription(normalized.bio || "");
    }
  }, [user, isMe]);

  useEffect(() => {
    const fetchData = async () => {
      if (!targetId) return;
      setIsLoading(true);

      try {
        const queryParams = `?sortBy=${filter.sortBy}&order=${filter.order}`;
        const collectionsPromise = api.get(`/collections/user/${targetId}${queryParams}`);
        const statsPromise = api.get(`/users/follow-stats/${targetId}`);
        let userPromise = Promise.resolve({ data: null });
        let savedPromise = Promise.resolve({ data: [] });

        if (!isMe) {
          userPromise = api.get(`/users/${targetId}`);
        } else {
          savedPromise = api.get(`/collections/saved/${targetId}${queryParams}`);
        }
        const [colRes, uRes, sRes, statsRes] = await Promise.all([
          collectionsPromise,
          userPromise,
          savedPromise,
          statsPromise,
        ]);

        setCollections(colRes.data || []);
        setSavedCollections(isMe ? sRes.data || [] : []);
        setFollowStats({
          followers: statsRes.data.followers || 0,
          following: statsRes.data.following || 0,
        });
        setIsFollowing(statsRes.data.amIFollowing || false);

        if (!isMe && uRes.data) {
          setProfileData(normalizeUser(uRes.data));
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
        toast.error(t("profile.messages.error_update"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [targetId, isMe, filter, t]);

  const handleSaveBio = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/users/update-profile", {
        bio: newDescription,
      });
      updateUser(res.data.user);
      setIsEditing(false);
      toast.success(t("profile.messages.bio_updated"));
    } catch (error) {
      toast.error(t("profile.messages.error_update"));
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const loadingToast = toast.loading(t("profile.messages.loading", { type }));
    try {
      const fd = new FormData();
      fd.append("imagen", file);
      const uploadRes = await api.post("/files/upload", fd);
      const payload = type === "avatar" ? { avatarUrl: uploadRes.data.url } : { bannerUrl: uploadRes.data.url };
      const updateRes = await api.put("/users/update-profile", payload);
      updateUser(updateRes.data.user);
      toast.success(t("profile.messages.img_updated"), { id: loadingToast });
    } catch (error) {
      toast.error(t("profile.messages.error_update"), { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCollection = (e, collection_id, name) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      id: collection_id,
      type: "own",
      title: name,
    });
  };

  const handleDeleteSavedCollection = (e, collection_id, name) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      id: collection_id,
      type: "saved",
      title: name,
    });
  };

  const executeDelete = async () => {
    const { id, type } = deleteConfirm;
    setDeleteConfirm({ ...deleteConfirm, isOpen: false });
    const tId = toast.loading(t("common.loading") || "...");

    try {
      if (type === "own") {
        await api.delete(`/collections/${id}`);
        setCollections((prev) => prev.filter((c) => c.collection_id !== id));
      } else {
        await api.delete(`/collections/saved/${id}`);
        setSavedCollections((prev) => prev.filter((c) => c.collection_id !== id));
      }
      toast.success(t("profile.messages.deleted"), { id: tId });
    } catch (error) {
      toast.error(t("profile.messages.error_update"), { id: tId });
    }
  };

  const handleFollowToggle = async () => {
    if (!targetId) return;
    const prevFollowingState = isFollowing;

    setIsFollowing(!isFollowing);
    setFollowStats((prev) => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
    }));

    try {
      if (prevFollowingState) {
        await api.delete(`/users/unfollow/${targetId}`);
        toast.success(t("profile.messages.unfollowed"));
      } else {
        await api.post(`/users/follow/${targetId}`);
        toast.success(t("profile.messages.following_success"));
      }
    } catch (error) {
      setIsFollowing(prevFollowingState);
      toast.error(t("profile.messages.error_update"));
    }
  };

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-300">
      <Toaster position="bottom-center" />
      <NavDesktop />

      <main className="mx-auto">
        <div className="relative h-40 md:h-80 w-full bg-neutral-900 overflow-hidden group">
          <img src={getImg(profileData?.banner, DEFAULT_BANNER)} className="w-full h-full object-cover" alt="banner" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
          {isMe && isEditing && (
            <button onClick={() => !isUploading && bannerInputRef.current.click()} className="absolute bottom-4 right-4 bg-base-100 p-2 rounded-full shadow-md z-20 hover:bg-base-200 transition-all">
              {isUploading ? <span className="loading loading-spinner loading-xs" /> : <Camera size={20} />}
            </button>
          )}
          <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, "banner")} className="hidden" accept="image/*" />
        </div>

        <div className="px-6 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="relative">
              <div onClick={() => isMe && isEditing && !isUploading && avatarInputRef.current.click()} className={`avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm ${isMe && isEditing ? "cursor-pointer hover:ring-primary" : ""}`}>
                <div className="w-24 md:w-32 rounded-full overflow-hidden bg-base-200">
                  <img src={getImg(profileData?.avatar, DEFAULT_AVATAR)} alt="avatar" />
                </div>
              </div>
              {isMe && isEditing && !isUploading && (
                <div className="absolute bottom-1 right-1 bg-base-100 p-1.5 rounded-full shadow-md pointer-events-none"><Camera size={16} /></div>
              )}
              <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, "avatar")} className="hidden" accept="image/*" />
            </div>

            <div className="flex gap-2 mb-2">
              {isMe ? (
                <>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn btn-sm md:btn-md btn-ghost border border-white/40 rounded-full">
                      {t("profile.edit_btn")}
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(false)} className="btn btn-sm md:btn-md btn-circle btn-ghost border border-white/40">
                      <X size={18} />
                    </button>
                  )}
                  <button onClick={() => setIsSettingsOpen(true)} className="btn btn-sm md:btn-md btn-circle btn-ghost border border-white/40"><Settings size={18} /></button>
                </>
              ) : (
                <button onClick={handleFollowToggle} className={`btn btn-sm md:btn-md rounded-full px-6 gap-2 ${isFollowing ? "btn-neutral" : "btn-primary"}`}>
                  {isFollowing ? <><Check size={16} /> {t("profile.following_btn")}</> : <><UserPlus size={16} /> {t("profile.follow_btn")}</>}
                </button>
              )}
            </div>
          </div>

          {/* INFORMACIÓN DEL PERFIL */}
          <div className="space-y-3 mb-6">
            <h1 className="text-2xl md:text-4xl font-bold font-serif">
              {profileData?.username || t("profile.default_username")}
            </h1>

            <div className="mt-2 text-sm md:text-base">
              {isEditing ? (
                <form
                  onSubmit={handleSaveBio}
                  className="flex flex-col gap-2 max-w-xl"
                >
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="textarea textarea-bordered w-full resize-none bg-base-100 text-base"
                    rows={3}
                    placeholder={t("profile.bio_placeholder")}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn btn-sm btn-ghost"
                    >
                      {t("profile.delete_modal.cancel")}
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary">
                      {t("common.save") || "Guardar"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="opacity-80">
                  {profileData?.bio || t("profile.bio_empty")}
                </p>
              )}
            </div>

            {/* CONTADORES */}
            <div className="flex gap-6 py-4 mt-4">
              <div className="flex gap-1 items-baseline">
                <span className="font-bold text-lg">{collections.length}</span>
                <span className="text-xs uppercase opacity-60 font-bold">
                  {t("profile.stats.collections")}
                </span>
              </div>

              <div
                className="flex gap-1 items-baseline cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() =>
                  setFollowModal({
                    open: true,
                    type: "followers",
                    title: t("profile.stats.followers"),
                  })
                }
              >
                <span className="font-bold text-lg">
                  {followStats.followers}
                </span>
                <span className="text-xs uppercase opacity-60 font-bold">
                  {t("profile.stats.followers")}
                </span>
              </div>

              <div
                className="flex gap-1 items-baseline cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() =>
                  setFollowModal({
                    open: true,
                    type: "following",
                    title: t("profile.stats.following"),
                  })
                }
              >
                <span className="font-bold text-lg">
                  {followStats.following}
                </span>
                <span className="text-xs uppercase opacity-60 font-bold">
                  {t("profile.stats.following")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVEGACIÓN */}
        <div className="border-t border-secondary mt-4 sticky top-16 bg-base-100/95 z-30 backdrop-blur-md shadow-sm">
          <div className="max-w-6xl mx-auto px-2 relative flex flex-col md:flex-row items-center md:justify-center">
            
            {/* COLECCIONES/GUARDADAS */}
            <div className="flex gap-8 md:gap-12 justify-center">
              <button
                onClick={() => setActiveTab("collections")}
                className={`py-4 border-b-2 px-2 text-sm font-bold transition-all ${
                  activeTab === "collections"
                    ? "border-primary text-primary"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                {t("profile.tabs.collections")}
              </button>
              {isMe && (
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`py-4 border-b-2 px-2 text-sm font-bold transition-all ${
                    activeTab === "saved"
                      ? "border-primary text-primary"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {t("profile.tabs.saved")}
                </button>
              )}
            </div>

            {/* FILTRO */}
            <div className="py-2 md:py-0 flex items-center gap-2 md:absolute md:right-2">
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-sm btn-ghost gap-2 opacity-80 hover:opacity-100 font-normal">
                  <Filter size={16} />
                  <span className="hidden md:inline">{t("profile.filter.label")}</span>
                  <span className="font-bold">
                    {filter.sortBy === 'recent' && filter.order === 'DESC' && t("profile.filter.recent_desc")}
                    {filter.sortBy === 'recent' && filter.order === 'ASC' && t("profile.filter.recent_asc")}
                    {filter.sortBy === 'updated' && t("profile.filter.updated")}
                    {filter.sortBy === 'items' && t("profile.filter.items")}
                  </span>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52 mt-4 border border-white/10">
                  <li>
                    <button 
                      onClick={() => setFilter({ sortBy: 'recent', order: 'DESC' })}
                      className={filter.sortBy === 'recent' && filter.order === 'DESC' ? 'active' : ''}
                    >
                      {t("profile.filter.option_recent")}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setFilter({ sortBy: 'recent', order: 'ASC' })}
                      className={filter.sortBy === 'recent' && filter.order === 'ASC' ? 'active' : ''}
                    >
                      {t("profile.filter.option_old")}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setFilter({ sortBy: 'updated', order: 'DESC' })}
                      className={filter.sortBy === 'updated' ? 'active' : ''}
                    >
                      {t("profile.filter.option_updated")}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setFilter({ sortBy: 'items', order: 'DESC' })}
                      className={filter.sortBy === 'items' ? 'active' : ''}
                    >
                      {t("profile.filter.option_items")}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* GRID DE CONTENIDO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 min-h-[300px] max-w-6xl mx-auto">
          {isMe && activeTab === "collections" && (
            <Link
              to="/create-collection"
              className="aspect-4/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-primary/50 hover:bg-white/5 transition-all opacity-60 hover:opacity-100"
            >
              <Plus size={32} />
              <span className="text-xs font-bold mt-2 uppercase">{t("common.new") || "Nueva"}</span>
            </Link>
          )}

          {(activeTab === "collections" ? collections : savedCollections).map(
            (col) => (
              <div
                key={col.collection_id}
                className="relative aspect-4/5 rounded-2xl overflow-hidden bg-base-200 shadow-sm"
              >
                <Link
                  to={`/collection/${col.collection_id}`}
                  className="w-full h-full block"
                >
                  <ItemCover
                    src={col.cover_url}
                    title={col.collection_name}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold leading-tight">
                      {col.collection_name}
                    </h3>
                    {activeTab === "saved" && col.username && (
                      <p className="text-primary text-[10px] font-bold uppercase mt-1">
                        @ {col.username}
                      </p>
                    )}
                    <p className="text-white/70 text-xs mt-1 capitalize">
                      {col.collection_type}
                    </p>
                  </div>
                </Link>

                {isMe && activeTab === "collections" && (
                  <button
                    onClick={(e) =>
                      handleDeleteCollection(
                        e,
                        col.collection_id,
                        col.collection_name,
                      )
                    }
                    className="absolute top-2 right-2 p-2 text-warning text-base rounded-full shadow-lg z-20 "
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {isMe && activeTab === "saved" && (
                  <button
                    onClick={(e) =>
                      handleDeleteSavedCollection(
                        e,
                        col.collection_id,
                        col.collection_name,
                      )
                    }
                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full shadow-lg z-20 "
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ),
          )}
        </div>

        {/* MODAL DE ELIMINACIÓN */}
        {deleteConfirm.isOpen && (
          <div className="modal modal-open">
            <div className="modal-box bg-base-200 border border-white/10 rounded-3xl max-w-xs text-center p-8">
              <h3 className="font-bold text-lg mb-2">
                {deleteConfirm.type === "own"
                  ? t("profile.delete_modal.title_own")
                  : t("profile.delete_modal.title_saved")}
              </h3>
              <p className="text-sm opacity-60 mb-6 italic">
                "{deleteConfirm.title}"
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={executeDelete}
                  className="btn btn-primary rounded-2xl w-full"
                >
                  {t("profile.delete_modal.confirm")}
                </button>
                <button
                  onClick={() =>
                    setDeleteConfirm({ ...deleteConfirm, isOpen: false })
                  }
                  className="btn btn-ghost rounded-2xl w-full"
                >
                  {t("profile.delete_modal.cancel")}
                </button>
              </div>
            </div>
            <div
              className="modal-backdrop bg-black/60"
              onClick={() =>
                setDeleteConfirm({ ...deleteConfirm, isOpen: false })
              }
            />
          </div>
        )}

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