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
import ItemCover from "../components/ItemCover"; // Asegúrate de que la ruta sea correcta
import AddToCollectionModal from "../components/AddToCollectionModal";
import AddItemModal from "../components/AddItemModal";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";
import { ca } from "zod/v4/locales";

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

  // Estados de interfaz
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", cover: "" });

  // Modales
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedItemForSave, setSelectedItemForSave] = useState(null);

  // 1. CARGAR DATOS
  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/collections/${id}`);
        const data = res.data;
        
        setCollectionInfo({
          id: data.collection_id,
          title: data.collection_name,
          description: data.collection_description || "",
          type: data.collection_type,
          cover: data.cover_url || data.collection_image, // Si es null, ItemCover mostrará degradado
          creatorId: data.creator_id,
          creatorName: data.creator_username,
          stats: { items: data.items ? data.items.length : 0, likes: data.likes || 0 },
        });

        if (data.items && Array.isArray(data.items)) {
          const mappedItems = data.items.map((item) => ({
            id: item.item_id,
            title: item.display_title || item.custom_title || "Sin título",
            author: item.display_subtitle || item.custom_subtitle || "Desconocido",
            // CAMBIO 1: Pasamos null en vez de placeholder para que active el degradado
            cover: item.display_image || null, 
            year: "",
          }));
          setItems(mappedItems);
        } else {
          setItems([]);
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

  const handleStartEditing = () => {
    setEditForm({
      title: collectionInfo.title,
      description: collectionInfo.description,
      cover: collectionInfo.cover,
    });
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setFileToUpload(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      // Creamos una URL temporal para ver la foto al instante
      setEditForm({ ...editForm, cover: URL.createObjectURL(file) });
    }
  };

  const handleSaveEditing = async () => {
    setIsUploading(true);
    try {
      let finalCoverUrl = collectionInfo.cover;
      
      // Si hay archivo nuevo, lo subimos
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("imagen", fileToUpload);
        const uploadRes = await api.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalCoverUrl = uploadRes.data.url;
      }
      
      const payload = {
        collection_name: editForm.title,
        collection_description: editForm.description,
        cover_url: finalCoverUrl,
      };

      await api.put(`/collections/${collectionInfo.id}`, payload);

      setCollectionInfo((prev) => ({
        ...prev,
        title: editForm.title,
        description: editForm.description,
        cover: finalCoverUrl,
      }));

      setIsEditing(false);
      setFileToUpload(null);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al actualizar la colección.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("¿Eliminar de la colección?")) {
      try {
        await api.delete(`/collections/items/${itemId}`);
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      } catch (error) {
        console.error("Error borrando item:", error);
      }
    }
  };
  const handleSave= async(collection_id)=>{
    try{
      await api.post(`/collections/save/${collection_id}`);
    }catch(error){
      console.error("Error guardando colección:", error);
    }
  }

  const handleAddItem = async (newItem) => {
    try {
      let finalCoverUrl = newItem.cover;
      if (newItem.isCustom && newItem.coverFile) {
        const formData = new FormData();
        formData.append("imagen", newItem.coverFile);
        const uploadRes = await api.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalCoverUrl = uploadRes.data.url;
      }
      const payload = {
        item_type: newItem.isCustom ? "Custom" : newItem.item_type || collectionInfo.type,
        reference_id: newItem.isCustom ? null : newItem.reference_id,
        custom_title: newItem.title,
        custom_subtitle: newItem.subtitle,
        custom_description: newItem.description || "",
        custom_image: finalCoverUrl,
      };

      const res = await api.post(`/collections/${collectionInfo.id}/items`, payload);

      if (res.data.success) {
        const itemFormatted = {
          id: res.data.itemId,
          title: newItem.title,
          author: newItem.subtitle,
          cover: finalCoverUrl,
        };
        setItems((prev) => [...prev, itemFormatted]);
      }
    } catch (error) {
      console.error("Error guardando item:", error);
      alert("Error al guardar item.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error || !collectionInfo) return <div className="min-h-screen flex items-center justify-center flex-col gap-4"><h1>Colección no encontrada</h1><Link to="/feed" className="btn">Volver al inicio</Link></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* HEADER / PORTADA */}
      <div className="relative bg-base-100">
        {/* Fondo borroso (Background) */}
        <div className="absolute inset-0 h-80 overflow-hidden -z-10 opacity-30">
          <img
            
            src={isEditing ? editForm.cover : (collectionInfo.cover || "https://via.placeholder.com/800?text=_")}
            className="w-full h-full object-cover blur-3xl transition-all duration-500"
            alt=""
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-base-100/80 to-base-100"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          <div className="mb-6">
            <Link
              to={isOwner ? "/profile/me" : `/profile/${collectionInfo.creatorId}`}
              className="inline-flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 hover:text-primary transition-all"
            >
              <ArrowLeft size={16} /> {isOwner ? "Volver a mi perfil" : `Volver al perfil de ${collectionInfo.creatorName || "Usuario"}`}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* --- FOTO PORTADA PRINCIPAL --- */}
            <div className="flex-none w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/80 bg-base-200 relative group">
              <ItemCover 
                src={isEditing ? editForm.cover : collectionInfo.cover}
                title={isEditing ? editForm.title : collectionInfo.title}
                className="w-full h-full object-cover"
              />
              
              {isEditing && (
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <Camera className="text-white mb-2" size={32} />
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Cambiar</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            {/* INFO Y FORMULARIO */}
            <div className="flex-1 w-full space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs opacity-50 uppercase tracking-widest">Creado por {collectionInfo.creatorName || "Desconocido"}</span>
                  <span className="badge badge-outline text-xs">{collectionInfo.type}</span>
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    className="input input-ghost w-full text-4xl md:text-5xl font-bold font-serif px-0 h-auto focus:bg-transparent focus:text-primary border-b-2 border-white/40 rounded-none"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight text-base-content">{collectionInfo.title}</h1>
                )}
              </div>

              {isEditing ? (
                <textarea
                  className="textarea textarea-ghost w-full text-lg leading-relaxed px-0 h-32 resize-none focus:bg-transparent border-l-4 border-white/40 rounded-none pl-4"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              ) : (
                <p className="text-lg opacity-80 leading-relaxed max-w-2xl border-l-4 border-white/40 pl-4 whitespace-pre-wrap">{collectionInfo.description || "Sin descripción."}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/40">
                <div className="flex gap-6 text-sm">
                  <div className="text-center"><span className="block font-bold text-lg">{items.length}</span><span className="opacity-60">Items</span></div>
                  <div className="text-center"><span className="block font-bold text-lg">{collectionInfo.stats.likes}</span><span className="opacity-60">Likes</span></div>
                </div>

                <div className="flex gap-3">
                  {isOwner ? (
                    <>
                      {isEditing ? (
                        <>
                          <button onClick={handleSaveEditing} className="btn btn-primary btn-sm gap-2 rounded-full" disabled={isUploading || !editForm.title.trim()}>
                            {isUploading ? <span className="loading loading-spinner"></span> : <><Check size={18} /> Guardar</>}
                          </button>
                          <button onClick={handleCancelEditing} className="btn btn-ghost btn-sm gap-2 rounded-full"><X size={18} /> Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button onClick={handleStartEditing} className="btn btn-outline btn-sm gap-2 rounded-full"><Settings size={18} /> Editar</button>
                          <button onClick={() => setIsAddItemOpen(true)} className="btn btn-primary btn-sm gap-2 rounded-full shadow-lg"><Plus size={18} /> Añadir Item</button>
                        </>
                      )}
                    </>
                  ) : (
                    <button onClick={()=>handleSave(collectionInfo.id)} className="btn btn-primary btn-sm gap-2 rounded-full"><BookmarkPlus size={18} /> Guardar Colección</button>
                  )}
                  {!isEditing && <button className="btn btn-square btn-ghost btn-sm rounded-full"><Share2 size={18} /></button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          Contenido <span className="text-xs font-normal opacity-50 bg-base-200 px-2 py-1 rounded-full">{items.length}</span>
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-20 opacity-50 border-2 border-dashed rounded-xl">
            <p>Esta colección está vacía.</p>
            {isOwner && <button onClick={() => setIsAddItemOpen(true)} className="btn btn-link text-primary">¡Añade algo!</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {items.map((item) => (
              <div key={item.id} className="group relative flex flex-col gap-2">
                <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-base-200 shadow-sm transition-all duration-300 group-hover:shadow-md">
                  <ItemCover 
                    src={item.cover} 
                    title={item.title} 
                    className="w-full h-full object-cover" 
                  />
                  
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOwner ? (
                      <button onClick={() => handleDelete(item.id)} className="btn btn-square btn-sm btn-error text-white border-none"><Trash2 size={16} /></button>
                    ) : (
                      <button onClick={() => setSelectedItemForSave(item)} className="btn btn-square btn-sm btn-white text-primary border-none"><Plus size={18} /></button>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight truncate pr-2 group-hover:text-primary transition-colors cursor-pointer" title={item.title}>{item.title}</h3>
                  <p className="text-xs opacity-60 truncate">{item.author}</p>
                </div>
              </div>
            ))}
            
            {isOwner && (
              <div onClick={() => setIsAddItemOpen(true)} className="aspect-2/3 rounded-xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-base-200/50 transition-all group">
                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors"><Plus size={24} /></div>
                <span className="text-xs font-bold uppercase mt-2 opacity-40 group-hover:opacity-100">Añadir</span>
              </div>
            )}
          </div>
        )}
      </main>

      <AddToCollectionModal isOpen={!!selectedItemForSave} item={selectedItemForSave} onClose={() => setSelectedItemForSave(null)} />
      <AddItemModal 
        isOpen={isAddItemOpen} 
        onClose={() => setIsAddItemOpen(false)} 
        collectionType={collectionInfo.type} 
        onAddItem={handleAddItem} 
      />
      <NavMobile />
    </div>
  );
};

export default CollectionPage;