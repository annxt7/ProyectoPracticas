import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Share2,
  Settings,
  Heart,
  BookmarkPlus,
  Trash2,
  Camera,
  Check,
  X,
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover.jsx";
import { uploadFileToCloudinary } from "../services/upload.js";
import AddToCollectionModal from "../components/AddToCollectionModal";
import AddItemModal from "../components/AddItemModal";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext"; // <--- IMPORTANTE

const CollectionPage = () => {
  const { id } = useParams(); // El ID de la colección (de la URL)
  const { user } = useAuth(); // Tu usuario logueado
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado de la colección (Empieza vacío, no con datos falsos)
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [items, setItems] = useState([]);

  // Estados de edición
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", cover: "" });

  // Modales
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedItemForSave, setSelectedItemForSave] = useState(null);

  // 1. CARGAR DATOS REALES DEL BACKEND
  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/collections/${id}`);
        const data = res.data;

        // A. Guardar Info de la Colección (Mapeamos nombres de DB a Frontend)
        setCollectionInfo({
            id: data.collection_id,
            title: data.collection_name, // DB: collection_name -> UI: title
            description: data.collection_description || "",
            type: data.collection_type,
            cover: data.cover_url || data.collection_image, // A veces se guarda con un nombre u otro
            creatorId: data.user_id, // Para saber si soy el dueño
            stats: { items: data.items ? data.items.length : 0, likes: data.likes || 0 }
        });

        // B. Guardar Items (Mapeamos lo que viene del LEFT JOIN complejo del backend)
        // El backend devuelve: display_title, display_subtitle, display_image
        if (data.items) {
            const mappedItems = data.items.map(item => ({
                id: item.item_id,
                title: item.display_title || item.custom_title || "Sin título",
                author: item.display_subtitle || item.custom_subtitle || "Desconocido",
                cover: item.display_image || "https://via.placeholder.com/300x450?text=No+Image",
                year: "", // Si tu query devuelve año, ponlo aquí
            }));
            setItems(mappedItems);
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

  // 2. CALCULAR SI SOY EL DUEÑO
  const isOwner = user && collectionInfo && (user.id === collectionInfo.creatorId || user.userId === collectionInfo.creatorId);

  // --- FUNCIONES DE EDICIÓN ---

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
      const previewUrl = URL.createObjectURL(file);
      setEditForm({ ...editForm, cover: previewUrl });
    }
  };

  const handleSaveEditing = async () => {
    setIsUploading(true);
    try {
      let finalCoverUrl = collectionInfo.cover;
      
      // 1. Si hay foto nueva, subirla
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("imagen", fileToUpload);
        const uploadRes = await api.post("/files/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        finalCoverUrl = uploadRes.data.url;
      }

      // 2. Actualizar en Base de Datos (Necesitarás una ruta PUT /collections/:id en el backend)
      // Por ahora actualizamos el estado local para que se vea el cambio
      // TODO: Crear endpoint backend: router.put("/:id", ...)
      
      // Actualizamos estado local
      setCollectionInfo({
        ...collectionInfo,
        title: editForm.title,
        description: editForm.description,
        cover: finalCoverUrl,
      });

      setIsEditing(false);
      setFileToUpload(null);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar cambios");
    } finally {
      setIsUploading(false);
    }
  };

  // --- FUNCIONES DE ITEMS ---

  const handleDelete = async (itemId) => {
    if (window.confirm("¿Eliminar de la colección?")) {
      try {
          // Llamada API real para borrar (Necesitas endpoint DELETE /items/:itemId)
          // await api.delete(`/collections/items/${itemId}`); 
          
          // Actualizar UI
          setItems(items.filter((i) => i.id !== itemId));
      } catch (error) {
          console.error("Error borrando item:", error);
      }
    }
  };

  const handleAddItemToState = (newItem) => {
    // Cuando el modal añade un item, lo metemos en la lista visualmente
    // (El modal ya hace la llamada a la API para guardarlo)
    const itemFormatted = {
      id: Date.now(), // ID temporal hasta recargar
      title: newItem.title,
      author: newItem.subtitle || newItem.author,
      cover: newItem.cover,
    };
    setItems([...items, itemFormatted]);
  };


  // --- RENDERIZADO ---

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error || !collectionInfo) return <div className="min-h-screen flex items-center justify-center flex-col gap-4"><h1>Colección no encontrada</h1><Link to="/feed" className="btn">Volver al inicio</Link></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />
      
      {/* HERO SECTION */}
      <div className="relative bg-base-100">
        {/* Fondo borroso */}
        <div className="absolute inset-0 h-80 overflow-hidden -z-10 opacity-30">
          <img
            src={isEditing ? editForm.cover : (collectionInfo.cover || "https://via.placeholder.com/800")}
            className="w-full h-full object-cover blur-3xl transition-all duration-500"
            alt=""
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-base-100/80 to-base-100"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          <div className="mb-6">
            <Link
              to={isOwner ? "/profile/me" : "#"} // Si es otro usuario, idealmente ir a /profile/SU_ID
              className="inline-flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 hover:text-primary transition-all"
            >
              <ArrowLeft size={16} /> Volver
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* PORTADA */}
            <div className="flex-none w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/80 bg-base-200 relative group">
              <img
                src={isEditing ? editForm.cover : (collectionInfo.cover || "https://via.placeholder.com/400?text=Sin+Portada")}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                  <Camera className="text-white mb-2" size={32} />
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Cambiar</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            {/* INFORMACIÓN TEXTO */}
            <div className="flex-1 w-full space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                   {/* Ojo: collectionInfo.creatorId es un ID, no un nombre. Para mostrar nombre necesitas JOIN en backend */}
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
                  <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight text-base-content">
                    {collectionInfo.title}
                  </h1>
                )}
              </div>

              {isEditing ? (
                <textarea
                  className="textarea textarea-ghost w-full text-lg leading-relaxed px-0 h-32 resize-none focus:bg-transparent border-l-4 border-white/40 rounded-none pl-4"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              ) : (
                <p className="text-lg opacity-80 leading-relaxed max-w-2xl border-l-4 border-white/40 pl-4 whitespace-pre-wrap">
                  {collectionInfo.description || "Sin descripción."}
                </p>
              )}

              {/* BOTONES ACCIÓN */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/40">
                <div className="flex gap-6 text-sm">
                   <div className="text-center"><span className="block font-bold text-lg">{items.length}</span><span className="opacity-60">Items</span></div>
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
                     <button className="btn btn-primary btn-sm gap-2 rounded-full"><BookmarkPlus size={18} /> Guardar Colección</button>
                  )}
                  {!isEditing && <button className="btn btn-square btn-ghost btn-sm rounded-full"><Share2 size={18} /></button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
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
                        {/* Usamos ItemCover o img directa */}
                        {item.cover ? (
                            <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                             <ItemCover title={item.title} />
                        )}

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
             {/* Tarjeta de añadir al final */}
            {isOwner && (
                <div onClick={() => setIsAddItemOpen(true)} className="aspect-2/3 rounded-xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-base-200/50 transition-all group">
                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors"><Plus size={24} /></div>
                <span className="text-xs font-bold uppercase mt-2 opacity-40 group-hover:opacity-100">Añadir</span>
                </div>
            )}
            </div>
        )}
      </main>

      {/* MODALES */}
      <AddToCollectionModal isOpen={!!selectedItemForSave} item={selectedItemForSave} onClose={() => setSelectedItemForSave(null)} />
      
      {/* Pasar collection_id al modal para que sepa dónde guardar */}
      <AddItemModal 
        isOpen={isAddItemOpen} 
        onClose={() => setIsAddItemOpen(false)} 
        collectionType={collectionInfo.type} 
        collectionId={collectionInfo.id} 
        onAddItem={handleAddItemToState} 
      />
      
      <NavMobile />
    </div>
  );
};

export default CollectionPage;