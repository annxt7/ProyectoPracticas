import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Settings, Trash2, Camera, Heart, Share2 } from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover";
import AddItemModal from "../components/AddItemModal";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

// Normalizador idéntico al tuyo
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
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [items, setItems] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", cover: "" });
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await api.get(`/collections/${id}`);
        const data = res.data;
        setCollectionInfo(normalizeCollection(data));
        
        if (data.items) {
          setItems(data.items.map(item => ({
            id: item.item_id,
            title: item.custom_title || item.display_title || "Sin título",
            author: item.custom_subtitle || item.display_subtitle || "Desconocido",
            cover: item.custom_image || item.display_image || null,
            item_type: item.item_type
          })));
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id]);

  const isOwner = authUser && collectionInfo && 
                  Number(authUser.id || authUser.user_id) === collectionInfo.creatorId;

  const handleAddNewItem = async (newItem) => {
    try {
      // Enviamos el objeto mapeado a tu tabla SQL
      const payload = {
        item_type: newItem.item_type || collectionInfo.type,
        custom_title: newItem.title,
        custom_subtitle: newItem.subtitle || newItem.author,
        custom_image: newItem.cover || newItem.image,
        custom_description: newItem.description || "",
        reference_id: newItem.reference_id || null
      };

      const res = await api.post(`/collections/${id}/items`, payload);
      
      if (res.data) {
        // Añadimos al estado local inmediatamente
        const newEntry = {
          id: res.data.item_id || Date.now(),
          title: payload.custom_title,
          author: payload.custom_subtitle,
          cover: payload.custom_image
        };
        setItems([...items, newEntry]);
        setIsAddItemOpen(false);
      }
    } catch (err) {
      alert("Error al guardar en la base de datos");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner"></span></div>;

  return (
    <div className="min-h-screen pb-24 bg-base-100">
      <NavDesktop />
      
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="w-64 aspect-square rounded-2xl overflow-hidden shadow-xl bg-base-300">
            <ItemCover src={collectionInfo.cover} title={collectionInfo.title} className="w-full h-full" />
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold">{collectionInfo.title}</h1>
            <p className="opacity-60 mt-2">{collectionInfo.description}</p>
            
            <div className="flex gap-3 mt-6">
              {isOwner && (
                <button onClick={() => setIsAddItemOpen(true)} className="btn btn-primary btn-sm rounded-full">
                  <Plus size={16} /> Añadir Item
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-base-300 mb-2">
                <ItemCover src={item.cover} title={item.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-sm truncate">{item.title}</h3>
              <p className="text-[10px] opacity-50">{item.author}</p>
            </div>
          ))}
        </div>
      </div>

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