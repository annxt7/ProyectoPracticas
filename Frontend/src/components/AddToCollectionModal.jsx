import React, { useState, useEffect } from 'react';
import { X, Plus, FolderOpen, Check, Loader2 } from 'lucide-react';

const AddToCollectionModal = ({ item, isOpen, onClose }) => {
  const [collections, setCollections] = useState([
    { id: 101, name: "Películas para llorar", count: 12 },
    { id: 102, name: "Cine Italiano", count: 5 },
    { id: 103, name: "Favoritos 2024", count: 28 },
    { id: 104, name: "Watchlist", count: 0 },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  
  const [isSuccess, setIsSuccess] = useState(false);

  // Resetea todo cuando el modal se abre/cierra externamente
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsCreating(false);
        setNewCollectionName("");
        setIsSuccess(false);
      }, 200); // Pequeño delay para que no se vea el reseteo mientras cierra
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  // Lógica unificada de éxito
  const triggerSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleSave = (collectionName) => {
    console.log(`Guardando "${item.title}" en: ${collectionName}`);
    triggerSuccess();
  };

  const handleCreateAndSave = (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    const newCollection = {
        id: Date.now(),
        name: newCollectionName,
        count: 1
    };

    setCollections([...collections, newCollection]);
    console.log(`Colección creada y elemento guardado.`);
    
    // Lanzamos la animación
    triggerSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Caja del Modal */}
      <div className="relative bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 min-h-[300px] flex flex-col">
        
        {isSuccess ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100 z-10 ">
             <div className="w-20 h-20 bg-stone-300 rounded-full flex items-center justify-center text-stone-600 mb-4 animate-bounce">
                <Check size={40} strokeWidth={4} />
             </div>
             <h3 className="text-xl font-bold text-base-content">¡Guardado!</h3>
             <p className="text-sm opacity-60 mt-1">Tu colección ha sido actualizada</p>
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
                <div className="w-12 h-16 rounded overflow-hidden flex-none">
                    <img src={item.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{item.title}</p>
                    <p className="text-xs opacity-60">{item.author}</p>
                </div>
            </div>

            {/* Lista de Colecciones */}
            <div className="p-2 flex-1 overflow-y-auto max-h-60">
                {collections.map((col) => (
                    <button 
                        key={col.id}
                        onClick={() => handleSave(col.name)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-base-200 transition-colors text-left group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-base-200 group-hover:bg-white flex items-center justify-center text-base-content/50 group-hover:text-primary transition-colors">
                            <FolderOpen size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{col.name}</p>
                            <p className="text-xs opacity-50">{col.count} items</p>
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
                            placeholder="Nombre..." 
                            className="input input-bordered input-sm w-full focus:outline-none focus:border-primary"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-sm btn-square"
                            disabled={!newCollectionName.trim()}
                        >
                        <Check size={18} />
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