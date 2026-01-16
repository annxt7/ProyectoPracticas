import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Share2,
  Settings,
  Trash2,
  Camera,
  Heart,
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover";
import AddItemModal from "../components/AddItemModal";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

// --- TUS FUNCIONES DE NORMALIZACIÓN ---
const normalizeCollection = (c) => {
  if (!c) return null;
  return {
    id: Number(c.collection_id || c.id),
    creatorId: Number(c.user_id || c.creator_id),
    title: c.collection_name || c.title || "Sin título",
    description: c.collection_description || c.description || "", // Añadida descripción
    type: c.collection_type || c.type,
    cover: c.cover_url || c.cover,
    author: (c.username || c.author || "usuario").replace(/^@/, '').toLowerCase()
  };
};

const CollectionPage = () => {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [likeCount, setLikeCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", cover: "" });

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/collections/${id}`);
        const data = res.data;

        // Usamos tu función de normalización para la cabecera
        const normalized = normalizeCollection(data);
        setCollectionInfo(normalized);
        setLikeCount(data.likes || 0);

        // Mapeo específico para los Items basado en tu tabla SQL
        if (data.items) {
          setItems(
            data.items.map((item) => ({
              id: item.item_id, // PRI de tu tabla
              title: item.custom_title || item.display_title || "Sin título",
              author: item.custom_subtitle || item.display_subtitle || "Varios",
              cover: item.custom_image || item.display_image || null,
              item_type: item.item_type,
              reference_id: item.music_id || item.book_id || item.movie_id || item.show_id || item.game_id,
            }))
          );
        }
      } catch (err) {
        console.error("Error cargando colección:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCollection();
  }, [id]);

  // Comprobación de dueño usando la normalización
  const isOwner = authUser && collectionInfo && 
                  Number(authUser.id || authUser.userId) === collectionInfo.creatorId;

  const handleSaveEditing = async () => {
    setIsUploading(true);
    try {
      let finalCoverUrl = collectionInfo.cover;
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("imagen", fileToUpload);
        const uploadRes = await api.post("/files/upload", formData);
        finalCoverUrl = uploadRes.data.url;
      }

      await api.put(`/collections/${id}`, {
        collection_name: editForm.title,
        collection_description: editForm.description,
        cover_url: finalCoverUrl,
      });

      setCollectionInfo(prev => ({
        ...prev,
        title: editForm.title,
        description: editForm.description,
        cover: finalCoverUrl,
      }));
      setIsEditing(false);
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content">
      <NavDesktop />
      
      <div className="relative">
        {/* FONDO BLUR */}
        <div className="absolute inset-0 h-[450px] overflow-hidden -z-10 opacity-25">
          <img 
            src={isEditing ? editForm.cover : collectionInfo.cover} 
            key={isEditing ? editForm.cover : collectionInfo.cover}
            className="w-full h-full object-cover blur-3xl" 
            alt="" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base-100"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link to={`/profile/${collectionInfo.creatorId}`} className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-8 transition-all">
            <ArrowLeft size={16} /> Perfil de {collectionInfo.author}
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* PORTADA */}
            <div className="relative group w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-base-300">
              <ItemCover 
                src={isEditing ? editForm.cover : collectionInfo.cover} 
                title={isEditing ? editForm.title : collectionInfo.title}
                key={isEditing ? editForm.cover : collectionInfo.cover}
                className="w-full h-full"
              />
              {isEditing && (
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                  <Camera className="text-white" size={32} />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFileToUpload(file);
                  setEditForm({ ...editForm, cover: URL.createObjectURL(file) });
                }
              }} />
            </div>

            {/* INFO */}
            <div className="flex-1 space-y-4 w-full">
              <span className="badge badge-primary badge-outline font-bold text-[10px] uppercase tracking-widest px-3">
                {collectionInfo.type}
              </span>

              {isEditing ? (
                <input 
                  className="input input-ghost w-full text-4xl font-bold px-0 focus:bg-transparent border-b border-primary/30 h-auto"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">{collectionInfo.title}</h1>
              )}

              {isEditing ? (
                <textarea 
                  className="textarea textarea-ghost w-full text-lg opacity-70 px-0 focus:bg-transparent border-l-2 border-primary/30 pl-4 h-24 resize-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              ) : (
                <p className="text-lg opacity-60 max-w-2xl border-l-2 border-white/10 pl-4 italic">
                  {collectionInfo.description || "Sin descripción."}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex gap-8">
                  <div><span className="block text-xl font-bold">{items.length}</span><span className="text-[10px] opacity-40 uppercase font-bold">Items</span></div>
                  <div><span className="block text-xl font-bold">{likeCount}</span><span className="text-[10px] opacity-40 uppercase font-bold">Likes</span></div>
                </div>

                <div className="flex gap-3">
                  {isOwner ? (
                    isEditing ? (
                      <>
                        <button onClick={handleSaveEditing} className="btn btn-primary btn-sm rounded-full px-6" disabled={isUploading}>Guardar</button>
                        <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm rounded-full">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => {
                          setEditForm({ title: collectionInfo.title, description: collectionInfo.description, cover: collectionInfo.cover });
                          setIsEditing(true);
                        }} className="btn btn-outline btn-sm rounded-full gap-2 px-4">
                          <Settings size={16} /> Editar
                        </button>
                        <button onClick={() => setIsAddItemOpen(true)} className="btn btn-primary btn-sm rounded-full gap-2 px-4">
                          <Plus size={16} /> Añadir
                        </button>
                      </>
                    )
                  ) : (
                    <button className="btn btn-sm btn-circle btn-ghost"><Heart size={18} /></button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <main className="max-w-6xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group flex flex-col gap-3">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-base-300 shadow-lg border border-white/5">
                <ItemCover 
                  src={item.cover} 
                  title={item.title} 
                  key={item.cover}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                {isOwner && (
                  <button className="absolute top-2 right-2 btn btn-square btn-xs btn-error opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="px-1">
                <h3 className="font-bold text-sm truncate leading-none mb-1">{item.title}</h3>
                <p className="text-[11px] opacity-40 uppercase tracking-wider truncate font-bold">{item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AddItemModal 
        isOpen={isAddItemOpen} 
        onClose={() => setIsAddItemOpen(false)} 
        collectionType={collectionInfo?.type} 
      />
      <NavMobile />
    </div>
  );
};

export default CollectionPage;