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
  X,
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

  // Estados de datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // Estados de interfaz
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", cover: "" });

  // Modales
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedItemForSave, setSelectedItemForSave] = useState(null);

  // 1. CARGA INICIAL COMPLETA
  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/collections/${id}`);
        const data = res.data;
        
        // Sincronizar estado de guardado
        setIsSaved(!!data.is_saved);

        setCollectionInfo({
          id: data.collection_id || data.id,
          title: data.collection_name || data.title,
          description: data.collection_description || data.description || "",
          type: data.collection_type || data.type,
          cover: data.cover_url || data.collection_image,
          creatorId: data.creator_id,
          creatorName: data.creator_username,
          stats: { items: data.items ? data.items.length : 0, likes: data.likes || 0 },
        });

        if (data.items) {
          setItems(data.items.map(item => ({
            id: item.item_id || item.id,
            title: item.display_title || item.custom_title || "Sin título",
            author: item.display_subtitle || item.custom_subtitle || "Desconocido",
            cover: item.display_image || item.custom_image,
          })));
        }
      } catch (err) {
        console.error("Error cargando colección:", err);
        setError("No se pudo cargar la colección.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCollection();
  }, [id]);

  const isOwner = user && collectionInfo && String(user.id || user.userId) === String(collectionInfo.creatorId);

  // 2. LÓGICA DE GUARDADO (LA QUE FALLABA)
  const handleSaveCollection = async () => {
    try {
      // Usamos el ID de la URL directamente para asegurar que no sea undefined
      const res = await api.post(`/collections/save/${id}`);
      
      // Si el backend responde con éxito, actualizamos localmente
      if (res.status === 200 || res.status === 201) {
        setIsSaved(true);
        setCollectionInfo(prev => ({
          ...prev,
          stats: { ...prev.stats, likes: (prev.stats.likes || 0) + 1 }
        }));
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // 3. GESTIÓN DE EDICIÓN Y SUBIDA
  const handleStartEditing = () => {
    setEditForm({
      title: collectionInfo.title,
      description: collectionInfo.description,
      cover: collectionInfo.cover,
    });
    setIsEditing(true);
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
      setFileToUpload(null);
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("¿Eliminar de la colección?")) {
      try {
        await api.delete(`/collections/items/${itemId}`);
        setItems(prev => prev.filter(i => i.id !== itemId));
      } catch (error) {
        console.error("Error borrando item:", error);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-100"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (error || !collectionInfo) return <div className="min-h-screen flex items-center justify-center bg-base-100 flex-col gap-4"><h1>{error}</h1><Link to="/feed" className="btn btn-primary">Volver</Link></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* HEADER DINÁMICO */}
      <div className="relative">
        <div className="absolute inset-0 h-[500px] overflow-hidden -z-10 opacity-30">
          <img src={isEditing ? editForm.cover : collectionInfo.cover} className="w-full h-full object-cover blur-3xl" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-100/80 to-base-100"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link to={isOwner ? "/profile/me" : `/profile/${collectionInfo.creatorId}`} className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-8 transition-all">
            <ArrowLeft size={16} /> {isOwner ? "Mi Perfil" : `Perfil de ${collectionInfo.creatorName}`}
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* PORTADA CON OPCIÓN DE CÁMARA SI EDITA */}
            <div className="relative group flex-none w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-base-200">
              <ItemCover src={isEditing ? editForm.cover : collectionInfo.cover} title={collectionInfo.title} className="w-full h-full object-cover" />
              {isEditing && (
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-100 transition-opacity backdrop-blur-sm">
                  <Camera className="text-white mb-2" size={32} />
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">Cambiar Portada</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFileToUpload(file);
                  setEditForm({...editForm, cover: URL.createObjectURL(file)});
                }
              }} className="hidden" accept="image/*" />
            </div>

            {/* INFO Y CONTROLES */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-3">
                <span className="badge badge-primary badge-outline font-bold text-[10px] uppercase tracking-widest">{collectionInfo.type}</span>
              </div>

              {isEditing ? (
                <input 
                  className="input input-ghost w-full text-4xl md:text-5xl font-serif font-bold px-0 focus:bg-transparent border-b-2 border-primary/30 rounded-none h-auto"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  autoFocus
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">{collectionInfo.title}</h1>
              )}

              {isEditing ? (
                <textarea 
                  className="textarea textarea-ghost w-full text-lg opacity-70 px-0 focus:bg-transparent border-l-4 border-primary/30 pl-4 rounded-none h-32 resize-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
              ) : (
                <p className="text-lg opacity-60 leading-relaxed max-w-2xl border-l-4 border-white/10 pl-4 whitespace-pre-wrap">
                  {collectionInfo.description || "Sin descripción."}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex gap-8">
                  <div className="text-center md:text-left"><span className="block text-xl font-bold">{items.length}</span><span className="text-[10px] opacity-40 uppercase tracking-widest">Items</span></div>
                  <div className="text-center md:text-left"><span className="block text-xl font-bold">{collectionInfo.stats.likes}</span><span className="text-[10px] opacity-40 uppercase tracking-widest">Likes</span></div>
                </div>

                <div className="flex gap-3">
                  {isOwner ? (
                    isEditing ? (
                      <>
                        <button onClick={handleSaveEditing} className="btn btn-primary btn-sm rounded-full px-6" disabled={isUploading}>
                          {isUploading ? <span className="loading loading-spinner"></span> : "Guardar Cambios"}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm rounded-full">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={handleStartEditing} className="btn btn-outline btn-sm rounded-full gap-2"><Settings size={16} /> Editar</button>
                        <button onClick={() => setIsAddItemOpen(true)} className="btn btn-primary btn-sm rounded-full gap-2 shadow-lg shadow-primary/20"><Plus size={16} /> Añadir Item</button>
                      </>
                    )
                  ) : (
                    <button 
                      onClick={handleSaveCollection} 
                      disabled={isSaved}
                      className={`btn btn-sm rounded-full gap-2 transition-all duration-500 ${isSaved ? "btn-ghost bg-success/10 text-success border-success/20" : "btn-primary shadow-lg shadow-primary/20"}`}
                    >
                      {isSaved ? <><Check size={18} /> Guardada</> : <><BookmarkPlus size={18} /> Guardar Colección</>}
                    </button>
                  )}
                  <button className="btn btn-square btn-ghost btn-sm rounded-full"><Share2 size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO DE LA COLECCIÓN */}
      <main className="max-w-6xl mx-auto px-4 mt-16">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">Contenido <span className="text-xs opacity-30 font-normal">/ {items.length}</span></h2>

        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl opacity-30 italic">Esta colección aún no tiene elementos.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {items.map((item) => (
              <div key={item.id} className="group flex flex-col gap-3">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-base-300 shadow-lg">
                  <ItemCover src={item.cover} title={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOwner ? (
                      <button onClick={() => handleDeleteItem(item.id)} className="btn btn-square btn-xs btn-error text-white border-none shadow-lg"><Trash2 size={14} /></button>
                    ) : (
                      <button onClick={() => setSelectedItemForSave(item)} className="btn btn-square btn-xs btn-primary border-none shadow-lg"><Plus size={14} /></button>
                    )}
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="font-bold text-sm leading-tight truncate group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-[11px] opacity-50 truncate">{item.author}</p>
                </div>
              </div>
            ))}
            {isOwner && (
              <button onClick={() => setIsAddItemOpen(true)} className="aspect-[2/3] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 opacity-30 hover:opacity-100 hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Plus size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Añadir</span>
              </button>
            )}
          </div>
        )}
      </main>

      <AddToCollectionModal isOpen={!!selectedItemForSave} item={selectedItemForSave} onClose={() => setSelectedItemForSave(null)} />
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