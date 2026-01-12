import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Share2,
  Settings,
  BookmarkPlus,
  Trash2,
  Camera,
  Check,
  MoreHorizontal,
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover";
import AddToCollectionModal from "../components/AddToCollectionModal";
import AddItemModal from "../components/AddItemModal";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

const CollectionPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estados
  const [loading, setLoading] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", cover: "" });

  // Modales
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedItemForSave, setSelectedItemForSave] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/collections/${id}`);
        const data = res.data;
        
        setIsSaved(!!data.is_saved);

        setCollectionInfo({
          id: data.collection_id || data.id,
          title: data.collection_name || data.title,
          description: data.collection_description || data.description || "",
          type: data.collection_type || data.type,
          cover: data.cover_url || data.collection_image,
          creatorId: data.creator_id,
          creatorName: data.creator_username,
          creatorAvatar: data.creator_avatar,
          stats: { 
            items: data.items ? data.items.length : 0, 
            likes: data.likes || 0 
          },
        });

        if (data.items) {
          setItems(data.items.map(item => ({
            id: item.item_id || item.id,
            title: item.display_title || item.custom_title || "Sin título",
            author: item.display_subtitle || item.custom_subtitle || "Desconocido",
            cover: item.display_image || item.custom_image,
            item_type: item.item_type,
            reference_id: item.music_id || item.book_id || item.movie_id || item.show_id || item.game_id || item.item_id
          })));
        }
      } catch (err) {
        console.error("Error cargando colección:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCollection();
  }, [id]);

  const isOwner = user && collectionInfo && String(user.id || user.userId) === String(collectionInfo.creatorId);

  const handleSaveCollection = async () => {
    if (isSaved) return;
    setIsSaved(true);
    try {
      await api.post(`/collections/save/${id}`);
    } catch (error) {
      setIsSaved(false);
    }
  };

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
      setCollectionInfo(prev => ({ ...prev, title: editForm.title, description: editForm.description, cover: finalCoverUrl }));
      setIsEditing(false);
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("¿Eliminar este item de la colección?")) {
      try {
        await api.delete(`/collections/items/${itemId}`);
        setItems(prev => prev.filter(i => i.id !== itemId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-100"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content overflow-x-hidden">
      <NavDesktop />

      {/* --- HERO SECTION --- */}
      <div className="relative">
        {/* Background Blur */}
        <div className="absolute inset-0 h-[500px] overflow-hidden -z-10 opacity-30">
          <img src={isEditing ? editForm.cover : collectionInfo.cover} className="w-full h-full object-cover blur-3xl transition-all duration-1000" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-100/80 to-base-100"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link to={isOwner ? "/profile/me" : `/profile/${collectionInfo.creatorId}`} className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-8 transition-all hover:-translate-x-1">
            <ArrowLeft size={16} /> {isOwner ? "Mi Perfil" : `Perfil de ${collectionInfo.creatorName}`}
          </Link>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Cover Art */}
            <div className="relative group flex-none w-full md:w-72 aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-base-300">
              <ItemCover src={isEditing ? editForm.cover : collectionInfo.cover} title={collectionInfo.title} className="w-full h-full object-cover" />
              {isEditing && (
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm transition-all">
                  <Camera className="text-white mb-2" size={32} />
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">Cambiar Portada</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFileToUpload(file);
                  setEditForm({...editForm, cover: URL.createObjectURL(file)});
                }
              }} />
            </div>

            {/* Collection Info */}
            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-2">
                <span className="badge badge-primary badge-outline font-black text-[10px] uppercase tracking-[0.2em] px-3 py-3">
                  {collectionInfo.type}
                </span>
                {isEditing ? (
                  <input 
                    className="input input-ghost w-full text-4xl md:text-6xl font-serif font-black px-0 focus:bg-transparent border-b-2 border-primary/30 rounded-none h-auto pb-2"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  />
                ) : (
                  <h1 className="text-4xl md:text-6xl font-serif font-black leading-tight tracking-tight">{collectionInfo.title}</h1>
                )}
              </div>

              {isEditing ? (
                <textarea 
                  className="textarea textarea-ghost w-full text-lg opacity-70 px-0 focus:bg-transparent border-l-4 border-primary/30 pl-4 rounded-none h-32 resize-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
              ) : (
                <p className="text-xl opacity-60 leading-relaxed max-w-2xl border-l-4 border-white/10 pl-6 italic font-light">
                  {collectionInfo.description || "Esta colección no tiene descripción aún."}
                </p>
              )}

              {/* Stats & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-white/5">
                <div className="flex gap-10">
                  <div className="text-center md:text-left">
                    <span className="block text-2xl font-black">{items.length}</span>
                    <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Items</span>
                  </div>
                  <div className="text-center md:text-left">
                    <span className="block text-2xl font-black">{collectionInfo.stats.likes}</span>
                    <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Likes</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {isOwner ? (
                    isEditing ? (
                      <>
                        <button onClick={handleSaveEditing} className="btn btn-primary rounded-full px-8 shadow-lg shadow-primary/20" disabled={isUploading}>
                          {isUploading ? <span className="loading loading-spinner loading-xs"></span> : "Guardar Cambios"}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn btn-ghost rounded-full">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => {
                          setEditForm({title: collectionInfo.title, description: collectionInfo.description, cover: collectionInfo.cover});
                          setIsEditing(true);
                        }} className="btn btn-outline btn-sm rounded-full gap-2 px-5">
                          <Settings size={16} /> Editar
                        </button>
                        <button onClick={() => setIsAddItemOpen(true)} className="btn btn-primary btn-sm rounded-full gap-2 px-5 shadow-lg shadow-primary/20">
                          <Plus size={16} /> Añadir Item
                        </button>
                      </>
                    )
                  ) : (
                    <button 
                      onClick={handleSaveCollection} 
                      disabled={isSaved}
                      className={`btn btn-sm rounded-full gap-2 px-8 transition-all duration-500 ${
                        isSaved ? "btn-success btn-outline opacity-100" : "btn-primary shadow-lg shadow-primary/20"
                      }`}
                    >
                      {isSaved ? <><Check size={18} /> Guardada</> : <><BookmarkPlus size={18} /> Guardar Colección</>}
                    </button>
                  )}
                  <button className="btn btn-square btn-ghost btn-sm rounded-full hover:bg-white/5"><Share2 size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <main className="max-w-6xl mx-auto px-4 mt-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black tracking-tight">Contenido de la obra</h2>
          <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {items.map((item) => (
            <div key={item.id} className="group flex flex-col gap-4">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-base-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/5">
                <ItemCover src={item.cover} title={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                {/* BOTÓN SUPERIOR DERECHO (PLUS O TRASH) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  {isOwner ? (
                    <button onClick={() => handleDeleteItem(item.id)} className="btn btn-square btn-xs btn-error text-white border-none shadow-xl hover:scale-110">
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSelectedItemForSave(item)}
                      className="btn btn-square btn-xs btn-primary border-none shadow-xl hover:scale-110"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              
              <div className="px-1 space-y-1">
                <h3 className="font-bold text-sm leading-tight truncate group-hover:text-primary transition-colors cursor-default">{item.title}</h3>
                <p className="text-[11px] opacity-40 uppercase tracking-widest font-bold truncate">{item.author}</p>
              </div>
            </div>
          ))}

          {isOwner && (
            <button 
              onClick={() => setIsAddItemOpen(true)}
              className="aspect-[2/3] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 opacity-30 hover:opacity-100 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Añadir Nuevo</span>
            </button>
          )}
        </div>
      </main>

      {/* MODALES */}
      {selectedItemForSave && (
        <AddToCollectionModal 
          isOpen={!!selectedItemForSave} 
          onClose={() => setSelectedItemForSave(null)} 
          item={{
            id: selectedItemForSave.reference_id,
            type: selectedItemForSave.item_type,
            title: selectedItemForSave.title,
            image: selectedItemForSave.cover, // Para que no pierda la foto
            display_image: selectedItemForSave.cover,
            custom_image: selectedItemForSave.cover,
            cover: selectedItemForSave.cover,
            subtitle: selectedItemForSave.author
          }} 
        />
      )}

      <AddItemModal 
        isOpen={isAddItemOpen} 
        onClose={() => setIsAddItemOpen(false)} 
        collectionType={collectionInfo?.type} 
        onAddItem={(newItem) => setItems(prev => [...prev, newItem])} 
      />

      <NavMobile />
    </div>
  );
};

export default CollectionPage;