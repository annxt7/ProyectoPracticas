import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Share2, Settings, BookmarkPlus, Trash2, Camera, Check, X } from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover";
import AddItemModal from "../components/AddItemModal";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

const CollectionPage = () => {
  const { id } = useParams(); // Este es el ID de la URL
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 1. CARGAR DATOS
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await api.get(`/collections/${id}`);
        const data = res.data;
        
        console.log("Datos recibidos:", data); // REVISA ESTO EN LA CONSOLA

        // Mapeamos los datos asegurándonos de usar los nombres correctos del backend
        setCollectionInfo({
          id: data.collection_id || data.id, 
          title: data.collection_name || data.title,
          description: data.collection_description || data.description,
          type: data.collection_type || data.type,
          cover: data.cover_url || data.collection_image,
          creatorId: data.creator_id,
          creatorName: data.creator_username,
          stats: { likes: data.likes || 0 }
        });

        // Verificamos si ya está guardada (asegúrate que el backend envíe is_saved)
        setIsSaved(!!data.is_saved);
        
        if (data.items) setItems(data.items);
      } catch (err) {
        console.error("Error al obtener colección:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id]);

  // 2. FUNCIÓN DE GUARDADO CORREGIDA
  const handleSaveCollection = async () => {
    // Si no hay ID o ya está guardada, no hacer nada
    if (!collectionInfo?.id || isSaved) return;

    try {
      console.log("Intentando guardar colección ID:", collectionInfo.id);
      
      const res = await api.post(`/collections/save/${collectionInfo.id}`);
      
      console.log("Respuesta del servidor al guardar:", res.data);

      // Si el servidor responde con éxito, cambiamos el estado visual
      if (res.status === 200 || res.status === 201 || res.data.success) {
        setIsSaved(true);
        setCollectionInfo(prev => ({
          ...prev,
          stats: { ...prev.stats, likes: (prev.stats.likes || 0) + 1 }
        }));
      }
    } catch (error) {
      console.error("Error detallado al guardar:", error.response?.data || error.message);
      alert("Error al guardar: " + (error.response?.data?.message || "Servidor no responde"));
    }
  };

  const isOwner = user && collectionInfo && String(user.id || user.userId) === String(collectionInfo.creatorId);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-100"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!collectionInfo) return <div className="min-h-screen flex items-center justify-center bg-base-100">Colección no encontrada</div>;

  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content">
      <NavDesktop />
      
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Portada */}
          <div className="w-full md:w-64 aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <ItemCover src={collectionInfo.cover} title={collectionInfo.title} />
          </div>

          {/* Info y Botones */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold font-serif">{collectionInfo.title}</h1>
              <p className="opacity-60 mt-2">{collectionInfo.description}</p>
            </div>

            <div className="flex items-center gap-4">
              {isOwner ? (
                <button className="btn btn-outline btn-sm rounded-full">
                  <Settings size={16} /> Configurar
                </button>
              ) : (
                /* BOTÓN DE GUARDAR */
                <button 
                  onClick={handleSaveCollection}
                  disabled={isSaved}
                  className={`btn btn-sm rounded-full gap-2 transition-all ${
                    isSaved 
                      ? "btn-disabled bg-success/20 text-success border-none" 
                      : "btn-primary px-6"
                  }`}
                >
                  {isSaved ? (
                    <><Check size={18} /> Guardada en tu biblioteca</>
                  ) : (
                    <><BookmarkPlus size={18} /> Guardar Colección</>
                  )}
                </button>
              )}
              <button className="btn btn-square btn-sm btn-ghost rounded-full"><Share2 size={18} /></button>
            </div>
          </div>
        </div>

        {/* Listado de Items */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map(item => (
            <div key={item.item_id || item.id} className="space-y-2">
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-base-200">
                <ItemCover src={item.display_image || item.custom_image} title={item.display_title} />
              </div>
              <p className="text-sm font-bold truncate">{item.display_title || item.custom_title}</p>
            </div>
          ))}
        </div>
      </div>

      <NavMobile />
    </div>
  );
};

export default CollectionPage;