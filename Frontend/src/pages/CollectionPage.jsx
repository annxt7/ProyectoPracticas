import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

// --- NORMALIZADORES (Basados en tu lógica) ---
const normalizeCollection = (c) => {
  if (!c) return null;
  return {
    id: Number(c.collection_id || c.id),
    creatorId: Number(c.user_id || c.creator_id),
    title: c.collection_name || c.title || "Sin título",
    description: c.collection_description || c.description || "",
    type: c.collection_type || c.type,
    cover: c.cover_url || c.cover,
    author: (c.username || c.author || "usuario").replace(/^@/, '').toLowerCase()
  };
};

const CollectionPage = () => {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
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

        const normalized = normalizeCollection(data);
        setCollectionInfo(normalized);
        setLikeCount(data.likes || 0);

        if (data.items) {
          setItems(
            data.items.map((item) => ({
              id: item.item_id,
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

  const isOwner = authUser && collectionInfo && 
                  Number(authUser.id || authUser.user_id) === collectionInfo.creatorId;

  // --- FUNCIÓN PARA CREAR/AÑADIR ITEMS CORREGIDA ---
  const handleAddNewItem = async (newItem) => {
    try {
      // 1. Preparamos el objeto siguiendo EXACTAMENTE tu tabla SQL
      const payload = {
        item_type: newItem.item_type || collectionInfo.type,
        // IDs de referencia externos (si vienen de API)
        music_id: newItem.item_type === 'Music' ? newItem.reference_id : null,
        book_id: newItem.item_type === 'Books' ? newItem.reference_id : null,
        movie_id: newItem.item_type === 'Movies' ? newItem.reference_id : null,
        show_id: newItem.item_type === 'Shows' ? newItem.reference_id : null,
        game_id: newItem.item_type === 'Games' ? newItem.reference_id : null,
        // Campos Custom de tu tabla
        custom_title: newItem.title,
        custom_subtitle: newItem.subtitle || newItem.author,
        custom_image: newItem.cover || newItem.image,
        custom_description: newItem.description || ""
      };

      const response = await api.post(`/collections/${id}/items`, payload);

      if (response.data) {
        // Actualizamos el estado local para mostrar el nuevo item sin recargar toda la página
        const addedItem = {
          id: response.data.item_id || Date.now(),
          title: payload.custom_title,
          author: payload.custom_subtitle,
          cover: payload.custom_image,
          item_type: payload.item_type
        };
        setItems(prev => [...prev, addedItem]);
        setIsAddItemOpen(false);
      }
    } catch (error) {
      console.error("Error al añadir item:", error);
      alert("Error al guardar el item. Revisa la consola.");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner"></span></div>;

  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content">
      <NavDesktop />
      
      <div className="relative">
        <div className="absolute inset-0 h-[400px] overflow-hidden -z-10 opacity-20">
          <img src={collectionInfo.cover} className="w-full h-full object-cover blur-3xl" alt="" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link to={`/profile/${collectionInfo.creatorId}`} className="inline-flex items-center gap-2 text-sm opacity-60 mb-8">
            <ArrowLeft size={16} /> Perfil de {collectionInfo.author}
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative w-64 aspect-square rounded-2xl overflow-hidden shadow-2xl bg-base-300">
              <ItemCover src={isEditing ? editForm.cover : collectionInfo.cover} title={collectionInfo.title} className="w-full h-full" />
              {isEditing && (
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer">
                  <Camera className="text-white" size={32} />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (file) { setFileToUpload(file); setEditForm({...editForm, cover: URL.createObjectURL(file)}); }
              }} />
            </div>

            <div className="flex-1">
              {isEditing ? (
                <input className="input input-ghost text-4xl font-bold w-full px-0" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              ) : (
                <h1 className="text-4xl font-bold">{collectionInfo.title}</h1>
              )}
              <p className="mt-4 opacity-70">{collectionInfo.description}</p>
              
              <div className="flex gap-3 mt-6">
                {isOwner && !isEditing && (
                  <>
                    <button onClick={() => setIsAddItemOpen(true)} className="btn btn-primary btn-sm rounded-full px-6">Añadir Item</button>
                    <button onClick={() => { setEditForm({title: collectionInfo.title, description: collectionInfo.description, cover: collectionInfo.cover}); setIsEditing(true); }} className="btn btn-outline btn-sm rounded-full">Editar</button>
                  </>
                )}
                {isEditing && <button onClick={handleSaveEditing} className="btn btn-primary btn-sm rounded-full" disabled={isUploading}>Guardar Cambios</button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-base-300 mb-2">
                <ItemCover src={item.cover} title={item.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-sm truncate">{item.title}</h3>
              <p className="text-[10px] opacity-50 uppercase">{item.author}</p>
            </div>
          ))}
        </div>
      </main>

      <AddItemModal 
        isOpen={isAddItemOpen} 
        onClose={() => setIsAddItemOpen(false)} 
        collectionType={collectionInfo?.type}
        onAddItem={handleAddNewItem} 
      />
      <NavMobile />
    </div>
  );
};

export default CollectionPage;