import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  X,
  Database,
  PenTool,
  Camera,
  Loader2,
} from "lucide-react";
import ItemCover from "./ItemCover";
import api from "../services/api";

// Estado Inicial Limpio
const INITIAL_FORM_STATE = {
  title: "",
  subtitle: "",
  description: "",
  cover: null,
  coverPreview: "",
};

const AddItemModal = ({ isOpen, onClose, collectionType, onAddItem }) => {
  const [mode, setMode] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [customForm, setCustomForm] = useState(INITIAL_FORM_STATE);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (mode !== "search" || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const categoryToSend = collectionType === "Custom" ? "General" : collectionType;
        const response = await api.get("/catalog/search", {
          params: { 
            category: categoryToSend, 
            query: searchTerm 
          }
        });

        // 3. Mapeo de datos (Backend -> Frontend)
        const itemsAdapted = response.data.map((item) => ({
            ...item,
            // Aseguramos que subtitle tenga contenido
            subtitle: item.subtitle || item.artist || item.author || item.developer || item.director || "Desconocido", 
            
            // MAPEO DE IMAGEN ROBUSTO:
            // Buscamos cualquier campo que pueda contener la imagen
            cover: item.image || item.cover_url || item.poster_url,      
            
            year: item.release_year || item.year,
            realType: item.type 
        }));

        setSearchResults(itemsAdapted);
      } catch (error) {
        console.error("Error buscando:", error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms de espera

    // Limpieza del timeout (Cancelación si el usuario sigue escribiendo)
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, collectionType, mode]); // Dependencias

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setMode("search");
    } else {
      const timer = setTimeout(() => {
        setCustomForm(INITIAL_FORM_STATE);
        setSearchTerm("");
        setSearchResults([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- MANEJADORES ---
  const handleAddFromDB = (item) => {
    const itemToSend = {
        ...item,
        // En Custom guardamos el tipo real, en específicas forzamos el tipo de la colección
        item_type: collectionType === "Custom" ? item.realType : collectionType,
        reference_id: item.id
    };
    onAddItem(itemToSend); 
    onClose();
  };

 const handleAddCustom = (e) => {
    e.preventDefault();
    const newItem = {
      title: customForm.title,
      subtitle: customForm.subtitle,
      description: customForm.description,
      cover: customForm.cover, 
      coverFile: customForm.cover, 
      isCustom: true,
      item_type: "Custom" 
    };
    onAddItem(newItem);
    onClose();
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomForm({
        ...customForm,
        cover: file,
        coverPreview: URL.createObjectURL(file),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100">
          <h3 className="font-bold text-lg flex items-center gap-2">
            {mode === "search" ? <Database size={18} /> : <PenTool size={18} />}
            {mode === "search"
              ? collectionType === "Custom" ? "Buscar en todo el catálogo" : `Buscar en: ${collectionType}`
              : "Añadir elemento manual"}
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-base-200">
            <button
              onClick={() => setMode("search")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                mode === "search"
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-base-content/50 hover:bg-base-200"
              }`}
            >
              Buscar en Base de Datos
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                mode === "custom"
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-base-content/50 hover:bg-base-200"
              }`}
            >
              Crear Manualmente
            </button>
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          
          {mode === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                <input
                  type="text"
                  placeholder={
                    collectionType === "Custom" 
                    ? "Busca pelis, juegos, música..." 
                    : `Buscar ${collectionType}...`
                  }
                  className="input input-bordered w-full pl-10 focus:input-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />     
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-primary" size={20} />
                    </div>
                )}
              </div>
              <div className="space-y-2">
                {searchResults.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`} 
                    className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-base-300"
                    onClick={() => handleAddFromDB(item)}
                  >
                    <div className="w-12 h-16 rounded-md overflow-hidden bg-base-300 flex-none relative">
                        <ItemCover src={item.cover} title={item.title} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs opacity-60">
                        {collectionType === "Custom" && (
                            <span className="badge badge-xs badge-ghost font-normal px-1">{item.type}</span>
                        )}
                        <span className="truncate">
                            {item.subtitle} {item.year && `• ${item.year}`}
                        </span>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-circle btn-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} />
                    </button>
                  </div>
                ))}

                {!loading && searchTerm.length > 1 && searchResults.length === 0 && (
                  <div className="text-center py-8 opacity-60">
                    <p>No encontramos nada.</p>
                    <button
                      onClick={() => setMode("custom")}
                      className="btn btn-link btn-sm text-primary"
                    >
                      Añádelo manualmente
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === MODO CUSTOM (FORMULARIO) === */}
          {mode === "custom" && (
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div className="flex gap-4 items-start">
                <div 
                  className="w-24 h-32 bg-base-200 rounded-xl overflow-hidden relative border border-base-300 shadow-sm cursor-pointer group"
                  onClick={() => fileInputRef.current.click()}
                >
                    <ItemCover 
                        src={customForm.coverPreview} 
                        title={customForm.title || "?"} 
                    />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm z-10 shadow-md border border-white/10">
                          <Camera size={14} />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 ml-1">Título *</label>
                    <input
                      required
                      type="text"
                      className="input input-bordered input-sm w-full focus:input-primary"
                      placeholder="Ej: Mi item personal"
                      value={customForm.title}
                      onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 ml-1">
                      Subtítulo (Autor/Info) *
                    </label>
                    <input
                      required
                      type="text"
                      className="input input-bordered input-sm w-full focus:input-primary"
                      placeholder="Ej: Detalles..."
                      value={customForm.subtitle}
                      onChange={(e) => setCustomForm({ ...customForm, subtitle: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase opacity-60 ml-1">Nota</label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm focus:textarea-primary"
                  rows="3"
                  placeholder="Descripción opcional..."
                  value={customForm.description}
                  onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn btn-primary w-full gap-2">
                  <Plus size={18} /> Añadir a la colección
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;