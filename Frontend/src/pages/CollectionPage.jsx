import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookmarkPlus, Check, Share2, Settings } from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

const CollectionPage = () => {
  const { id } = useParams(); // ID de la URL
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // 1. CARGA DE DATOS
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/collections/${id}`);
        const data = res.data;

        console.log("DEBUG: Datos cargados:", data);

        // Guardamos todo el objeto de la colección
        setCollection(data);

        // Verificamos si ya está guardada. 
        // IMPORTANTE: Asegúrate que tu backend envíe 'is_saved' o 'saved'
        setIsSaved(data.is_saved === true || data.is_saved === 1);

      } catch (err) {
        console.error("DEBUG: Error al cargar:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  // 2. FUNCIÓN DE GUARDADO (CON LOGS DE CONTROL)
  const handleSave = async () => {
    // Evitar llamadas si no hay datos o ya está guardado
    if (!id) return console.error("DEBUG: No hay ID de colección");

    try {
      console.log("DEBUG: Intentando guardar ID:", id);
      
      const res = await api.post(`/collections/save/${id}`);
      
      console.log("DEBUG: Respuesta servidor:", res);

      // Si el servidor responde con éxito (200 o 201)
      if (res.status === 200 || res.status === 201) {
        setIsSaved(true);
        console.log("DEBUG: Estado isSaved actualizado a true");
      }
    } catch (err) {
      console.error("DEBUG: Fallo al guardar:", err.response?.data || err);
      alert("No se pudo guardar la colección");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-100"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!collection) return <div className="min-h-screen flex items-center justify-center">Colección no encontrada</div>;

  // Verificamos si el usuario actual es el creador
  const isOwner = user && (user.id === collection.creator_id || user.userId === collection.creator_id);

  return (
    <div className="min-h-screen pb-24 bg-base-100 text-base-content font-sans">
      <NavDesktop />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/feed" className="btn btn-ghost btn-sm mb-6 gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          {/* PORTADA */}
          <div className="w-64 h-64 flex-none rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <ItemCover 
              src={collection.cover_url || collection.collection_image} 
              title={collection.collection_name} 
            />
          </div>

          {/* INFORMACIÓN Y BOTONES */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <span className="text-primary text-xs font-bold uppercase tracking-widest">
                {collection.collection_type}
              </span>
              <h1 className="text-4xl font-black">{collection.collection_name}</h1>
              <p className="opacity-60">{collection.collection_description || "Sin descripción"}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {isOwner ? (
                <button className="btn btn-outline btn-sm rounded-full gap-2">
                  <Settings size={16} /> Configurar
                </button>
              ) : (
                /* BOTÓN DE GUARDADO DINÁMICO */
                <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`btn btn-sm rounded-full gap-2 transition-all px-6 ${
                    isSaved 
                    ? "btn-success btn-outline opacity-100 cursor-default" 
                    : "btn-primary shadow-lg shadow-primary/20"
                  }`}
                >
                  {isSaved ? (
                    <><Check size={18} /> Guardada</>
                  ) : (
                    <><BookmarkPlus size={18} /> Guardar Colección</>
                  )}
                </button>
              )}
              <button className="btn btn-square btn-sm btn-ghost rounded-full"><Share2 size={18} /></button>
            </div>
          </div>
        </div>

        {/* LISTA DE ITEMS (Simple para evitar errores) */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Contenido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {collection.items?.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-base-200">
                  <ItemCover src={item.display_image || item.custom_image} />
                </div>
                <p className="text-xs font-bold truncate">{item.display_title || item.custom_title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NavMobile />
    </div>
  );
};

export default CollectionPage;