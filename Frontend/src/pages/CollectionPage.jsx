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

  // 1. CARGA DE DATOS Y PERSISTENCIA
  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/collections/${id}`);
        const data = res.data;
        
        // Persistencia del botón de guardado
        setIsSaved(!!data.is_saved);

        setCollectionInfo({
          id: data.collection_id || data.id,
          title: data.collection_name || data.title,
          description: data.collection_description || data.description || "",
          type: data.collection_type || data.type,
          cover: data.cover_url || data.collection_image,
          creatorId: data.creator_id,
          creatorName: data.creator_username,
          stats: { 
            items: data.items ? data.items.length : 0, 
            likes: data.likes || 0 
          },
        });

        if (data.items) {
          setItems(data.items.map(item => {
            // Identificar el ID de referencia real del catálogo
            const refId = item.music_id || item.book_id || item.movie_id || item.show_id || item.game_id;
            
            return {
              id: item.item_id || item.id,
              title: item.display_title || item.custom_title || "Sin título",
              author: item.display_subtitle || item.custom_subtitle || "Desconocido",
              cover: item.display_image || item.custom_image,
              item_type: item.item_type,
              reference_id: refId,
              is_custom: !refId // Si no hay refId, es un item manual
            };
          }));
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

  // 2. LOGICA DE GUARDADO DE COLECCIÓN
  const handleSaveCollection = async () => {
    if (isSaved) return;
    setIsSaved(true);
    try {
      await api.post(`/collections/save/${id}`);
    } catch (error) {
      setIsSaved(false);
      console.error("Error al guardar colección:", error);
    }
  };

  // 3. LOGICA DE EDICIÓN
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
    if (window.confirm("¿Eliminar este item?")) {
      try {
        await api.delete(`/collections/items/${itemId}`);
        setItems(prev => prev.filter(i => i.id !== itemId));
      } catch (error) {
        console.error("Error borrando item:", error);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-100"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content">
      <NavDesktop />

      {/* --- HERO SECTION CON BLUR --- */}
      <div className="relative">
        <div className="absolute inset-0 h-[450px] overflow-hidden -z-10 opacity-25">
          <img src={isEditing ? editForm.cover : collectionInfo.cover} className="w-full h-full object-cover blur-3xl" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base-100"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link to={isOwner ? "/profile/me" : `/profile/${collectionInfo.creatorId}`} className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-8 transition-all">
            <ArrowLeft size={16} /> {isOwner ? "Mi Perfil" : `Perfil de ${collectionInfo.creatorName}`}
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* PORTADA COLECCIÓN */}
            <div className="relative group w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-base-300">
              <ItemCover src={isEditing ? editForm.cover : collectionInfo.cover} title={collectionInfo.title} className="w-full h-full object-cover" />
              {isEditing && (
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                  <Camera className="text-white mb-1" size={32} />
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">Cambiar</span>
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

            {/* INFO COLECCIÓN */}
            <div className="flex-1 space-y-4 w-full">
              <span className="badge badge-primary badge-outline font-bold text-[10px] uppercase tracking-widest px-3">{collectionInfo.type}</span>
              
              {isEditing ? (
                <input className="input input-ghost w-full text-4xl font-serif font-bold px-0 focus:bg-transparent border-b border-primary/30 h-auto" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} />
              ) : (
                <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">{collectionInfo.title}</h1>
              )}

              {isEditing ? (
                <textarea className="textarea textarea-ghost w-full text-lg opacity-70 px-0 focus:bg-transparent border-l-2 border-primary/30 pl-4 h-24 resize-none" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
              ) : (
                <p className="text-lg opacity-60 max-w-2xl border-l-2 border-white/10 pl-4 italic">{collectionInfo.description || "Sin descripción."}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex gap-8">
                  <div><span className="block text-xl font-bold">{items.length}</span><span className="text-[10px] opacity-40 uppercase font-bold">Items</span></div>
                  <div><span className="block text-xl font-bold">{collectionInfo.stats.likes}</span><span className="text-[10px] opacity-40 uppercase font-bold">Likes</span></div>
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
                        <button onClick={() => { setEditForm({title: collectionInfo.title, description: collectionInfo.description, cover: collectionInfo.cover}); setIsEditing(true); }} className="btn btn-outline btn-sm rounded-full gap-2 px-4"><Settings size={16} /> Editar</button>
                        <button onClick={() => setIsAddItemOpen(true)} className="btn btn-primary btn-sm rounded-full gap-2 px-4 shadow-lg shadow-primary/20"><Plus size={16} /> Añadir</button>
                      </>
                    )
                  ) : (
                    <button onClick={handleSaveCollection} disabled={isSaved} className={`btn btn-sm rounded-full gap-2 px-6 transition-all duration-500 ${isSaved ? "btn-success btn-outline opacity-100" : "btn-primary shadow-lg"}`}>
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

      {/* --- GRID DE ITEMS --- */}
      <main className="max-w-6xl mx-auto px-4 mt-16">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-4">Contenido <div className="h-px flex-1 bg-white/5"></div></h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group flex flex-col gap-3">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-base-300 shadow-lg border border-white/5">
                <ItemCover src={item.cover} title={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                {/* BOTÓN PLUS (ESQUINA SUPERIOR DERECHA) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {isOwner ? (
                    <button onClick={() => handleDeleteItem(item.id)} className="btn btn-square btn-xs btn-error shadow-xl"><Trash2 size={14} /></button>
                  ) : (
                    <button 
                      onClick={() => setSelectedItemForSave(item)}
                      className="btn btn-square btn-xs btn-primary shadow-xl hover:scale-110"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="px-1">
                <h3 className="font-bold text-sm truncate leading-none mb-1">{item.title}</h3>
                <p className="text-[11px] opacity-40 uppercase tracking-wider truncate font-bold">{item.author}</p>
              </div>
            </div>
          ))}
          {isOwner && (
            <button onClick={() => setIsAddItemOpen(true)} className="aspect-[2/3] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 opacity-30 hover:opacity-100 hover:bg-white/5 transition-all">
              <Plus size={32} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Añadir</span>
            </button>
          )}
        </div>
      </main>

      {/* --- MODALES CON LÓGICA DE COINCIDENCIA EXACTA --- */}
      {selectedItemForSave && (
        <AddToCollectionModal 
          isOpen={!!selectedItemForSave} 
          onClose={() => setSelectedItemForSave(null)} 
          item={{
            // Intentamos pasar el ID del catálogo original
            id: selectedItemForSave.reference_id, 
            type: selectedItemForSave.item_type,
            title: selectedItemForSave.title,
            subtitle: selectedItemForSave.author,
            // Pasamos la imagen en todas las variantes posibles
            image: selectedItemForSave.cover,
            display_image: selectedItemForSave.cover,
            custom_image: selectedItemForSave.cover,
            cover: selectedItemForSave.cover,
            // Flag para indicar si es una entrada manual
            is_custom: selectedItemForSave.is_custom
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