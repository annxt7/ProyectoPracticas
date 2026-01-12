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
          stats: { items: data.items ? data.items.length : 0, likes: data.likes || 0 },
        });

        if (data.items) {
          setItems(data.items.map(item => ({
            id: item.item_id || item.id,
            title: item.display_title || item.custom_title || "Sin título",
            author: item.display_subtitle || item.custom_subtitle || "Desconocido",
            cover: item.display_image || item.custom_image,
            // Guardamos el tipo y ID de referencia por si el modal los necesita
            item_type: item.item_type,
            reference_id: item.music_id || item.book_id || item.movie_id || item.show_id || item.game_id
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

  const handleSaveCollection = async () => {
    if (isSaved) return;
    setIsSaved(true);
    try {
      await api.post(`/collections/save/${id}`);
    } catch (error) {
      setIsSaved(false);
      console.error("Error al guardar:", error);
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
      alert("Error al actualizar.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-100"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-base-100">
      <NavDesktop />

      {/* HEADER HERO */}
      <div className="relative">
        <div className="absolute inset-0 h-[400px] overflow-hidden -z-10 opacity-20">
          <img src={collectionInfo.cover} className="w-full h-full object-cover blur-3xl" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base-100"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* PORTADA */}
            <div className="relative group w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-2xl bg-base-200">
              <ItemCover src={isEditing ? editForm.cover : collectionInfo.cover} title={collectionInfo.title} />
              {isEditing && (
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer">
                  <Camera className="text-white" size={32} />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (file) setEditForm({...editForm, cover: URL.createObjectURL(file)});
              }} />
            </div>

            {/* INFO */}
            <div className="flex-1 space-y-4">
              <span className="badge badge-primary badge-outline uppercase text-[10px] font-bold tracking-widest">{collectionInfo.type}</span>
              {isEditing ? (
                <input className="input input-ghost text-4xl font-bold w-full px-0 h-auto focus:bg-transparent" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              ) : (
                <h1 className="text-4xl md:text-5xl font-serif font-bold">{collectionInfo.title}</h1>
              )}
              
              {isEditing ? (
                <textarea className="textarea textarea-ghost w-full p-0 text-lg opacity-70 h-24 focus:bg-transparent" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              ) : (
                <p className="text-lg opacity-60 border-l-2 border-white/10 pl-4">{collectionInfo.description || "Sin descripción."}</p>
              )}

              <div className="flex flex-wrap items-center justify-between pt-6 border-t border-white/5">
                <div className="flex gap-6">
                  <div><span className="block text-xl font-bold">{items.length}</span><span className="text-[10px] opacity-40 uppercase">Elementos</span></div>
                </div>
                <div className="flex gap-2">
                  {isOwner ? (
                    isEditing ? (
                      <button onClick={handleSaveEditing} className="btn btn-primary btn-sm rounded-full px-6" disabled={isUploading}>Guardar</button>
                    ) : (
                      <>
                        <button onClick={() => { setEditForm({title: collectionInfo.title, description: collectionInfo.description, cover: collectionInfo.cover}); setIsEditing(true); }} className="btn btn-outline btn-sm rounded-full"><Settings size={16} /></button>
                        <button onClick={() => setIsAddItemOpen(true)} className="btn btn-primary btn-sm rounded-full"><Plus size={16} /> Añadir</button>
                      </>
                    )
                  ) : (
                    <button onClick={handleSaveCollection} disabled={isSaved} className={`btn btn-sm rounded-full gap-2 ${isSaved ? "btn-success btn-outline" : "btn-primary"}`}>
                      {isSaved ? <><Check size={18} /> Guardada</> : <><BookmarkPlus size={18} /> Guardar</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE ITEMS */}
      <main className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group flex flex-col gap-2">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-base-300 shadow-lg">
                <ItemCover src={item.cover} title={item.title} />
                
                {/* BOTONES FLOTANTES EN EL ITEM */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {isOwner ? (
                    <button 
                      onClick={async () => {
                        if(window.confirm("¿Eliminar?")) {
                          await api.delete(`/collections/items/${item.id}`);
                          setItems(prev => prev.filter(i => i.id !== item.id));
                        }
                      }}
                      className="btn btn-square btn-sm btn-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSelectedItemForSave(item)}
                      className="btn btn-circle btn-primary shadow-xl scale-90 group-hover:scale-100 transition-transform"
                    >
                      <Plus size={24} />
                    </button>
                  )}
                </div>
              </div>
              <div className="px-1">
                <h3 className="font-bold text-sm truncate">{item.title}</h3>
                <p className="text-xs opacity-50 truncate">{item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL PARA GUARDAR ITEM EN OTRA COLECCIÓN */}
      {selectedItemForSave && (
        <AddToCollectionModal 
          isOpen={!!selectedItemForSave} 
          onClose={() => setSelectedItemForSave(null)} 
          item={{
            id: selectedItemForSave.reference_id, // El ID de la obra original
            type: selectedItemForSave.item_type,
            title: selectedItemForSave.title,
            image: selectedItemForSave.cover
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