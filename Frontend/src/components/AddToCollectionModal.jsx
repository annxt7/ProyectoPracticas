import React, { useState, useEffect } from 'react';
import { X, Plus, FolderOpen, Check, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddToCollectionModal = ({ item, isOpen, onClose }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar colecciones del usuario al abrir el modal
  useEffect(() => {
    const fetchMyCollections = async () => {
      if (isOpen && user) {
        try {
          const res = await api.get(`/collections/user/${user.id}`);
          setCollections(res.data || []);
        } catch (err) {
          console.error("Error cargando colecciones:", err);
        }
      }
    };
    fetchMyCollections();
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsCreating(false);
        setNewCollectionName("");
        setIsSuccess(false);
        setLoading(false);
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const triggerSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

// Guardar en colección existente
  const handleSaveToExisting = async (collectionId) => {
    setLoading(true);
    try {
      await api.post(`/collections/${collectionId}/items`, {
        reference_id: item.id,      // ID que viene del catálogo (Books, Music...)
        item_type: item.type,       // Ej: 'books'
        custom_title: item.title,   // Por si acaso el backend necesita fallback
        custom_subtitle: item.author,
        custom_image: item.cover
      });
      triggerSuccess();
    } catch (err) {
      console.error("Error al guardar item:", err);
      alert("Error al guardar en la colección");
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva colección y luego guardar el item
 const handleCreateAndSave = async (e) => {
    e.preventDefault();
    const cleanName = newCollectionName.trim();
    if (!cleanName) return;

    setLoading(true);
    try {
      const resCol = await api.post('/collections', {
        name: cleanName,
        type: item.type || 'custom', 
      });

      const newColId = resCol.data.collection_id;

      // 2. Guardar el item en la nueva colección
      await api.post(`/collections/${newColId}/items`, {
        reference_id: item.id,
        item_type: item.type,
        custom_title: item.title,
        custom_subtitle: item.author,
        custom_image: item.cover
      });

      triggerSuccess();
    } catch (err) {
      console.error("Error en creación/guardado:", err);
      alert("Hubo un problema al crear la colección");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Caja del Modal */}
      <div className="relative bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 min-h-[350px] flex flex-col">
        
        {isSuccess ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100 z-10 ">
             <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Check size={40} strokeWidth={4} />
             </div>
             <h3 className="text-xl font-bold">¡Añadido!</h3>
             <p className="text-sm opacity-60 mt-1">Se ha guardado en tu colección</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-base-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Guardar en...</h3>
              <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                <X size={20} />
              </button>
            </div>

            {/* Item Preview */}
            <div className="p-4 bg-base-200/50 flex items-center gap-3">
                <div className="w-12 h-16 rounded shadow-sm overflow-hidden flex-none bg-base-300">
                    <img src={item.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{item.title}</p>
                    <p className="text-xs opacity-60 truncate">{item.author}</p>
                </div>
            </div>

            {/* Lista de Colecciones */}
            <div className="p-2 flex-1 overflow-y-auto max-h-64">
                {loading && !isCreating && (
                  <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                )}
                
                {!loading && collections.length === 0 && !isCreating && (
                  <p className="text-center text-xs opacity-50 py-10">No tienes colecciones aún.</p>
                )}

                {collections.map((col) => (
                    <button 
                        key={col.collection_id}
                        onClick={() => handleSaveToExisting(col.collection_id)}
                        disabled={loading}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-base-200 transition-colors text-left group disabled:opacity-50"
                    >
                        <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center text-base-content/50 group-hover:text-primary transition-colors">
                            <FolderOpen size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{col.collection_name}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 text-primary">
                            <Plus size={18} />
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-base-200 bg-base-100">
                {!isCreating ? (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="btn btn-outline btn-block btn-sm border-dashed border-base-300 gap-2 normal-case text-base-content/70 hover:bg-base-200 hover:border-primary"
                    >
                        <Plus size={16} /> Crear nueva colección
                    </button>
                ) : (
                    <form onSubmit={handleCreateAndSave} className="flex gap-2 items-center animate-in slide-in-from-bottom-2">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Nombre de la colección..." 
                            className="input input-bordered input-sm w-full focus:outline-none focus:border-primary"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            disabled={loading}
                        />
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-sm btn-square"
                            disabled={!newCollectionName.trim() || loading}
                        >
                          {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setIsCreating(false)} 
                            className="btn btn-ghost btn-sm btn-square"
                        >
                            <X size={18} />
                        </button>
                    </form>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToCollectionModal;