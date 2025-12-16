import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  X,
  Image as ImageIcon,
  Database,
  PenTool,
  Camera, // Nos aseguramos de usar Camera
} from "lucide-react";
import ItemCover from "./ItemCover";

const MOCK_DB = {
  Music: [
    {
      id: 1,
      title: "Bohemian Rhapsody",
      subtitle: "Queen",
      year: 1975,
      cover:
        "https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png",
    },
    {
      id: 2,
      title: "Hotel California",
      subtitle: "Eagles",
      year: 1976,
      cover:
        "https://upload.wikimedia.org/wikipedia/en/4/49/Hotel_California.jpg",
    },
  ],
  Movies: [
    {
      id: 1,
      title: "Inception",
      subtitle: "Christopher Nolan",
      year: 2010,
      cover:
        "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    },
    {
      id: 2,
      title: "Interstellar",
      subtitle: "Christopher Nolan",
      year: 2014,
      cover:
        "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    },
  ],
};

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

  // Estado para el formulario manual (match con tabla Items)
  const [customForm, setCustomForm] = useState(INITIAL_FORM_STATE);

  // Referencia al input de archivo para poder resetearlo y activarlo
  const fileInputRef = useRef(null);

  // Efecto: Cuando escribes, simula búsqueda en la BD correcta
  useEffect(() => {
    if (
      mode === "search" &&
      searchTerm.length > 1 &&
      collectionType !== "Custom"
    ) {
      const db = MOCK_DB[collectionType] || [];
      const results = db.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, collectionType, mode]);

  // Si abrimos una colección "Custom" pura, vamos directo al modo manual
  // Y reseteamos al cerrar
  useEffect(() => {
    if (isOpen) {
      if (collectionType === "Custom") {
        setMode("custom");
      } else {
        setMode("search"); // Reset por defecto
      }
    } else {
      // RESETEAR AL CERRAR
      const timer = setTimeout(() => {
        setCustomForm(INITIAL_FORM_STATE);
        setSearchTerm("");
        setSearchResults([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, collectionType]);

  if (!isOpen) return null;

  // Lógica para añadir item de la BD
  const handleAddFromDB = (item) => {
    console.log("Añadiendo desde BD:", item);
    onAddItem(item);
    onClose();
  };

  // Lógica para añadir item manual
  const handleAddCustom = (e) => {
    e.preventDefault();
    const newItem = {
      title: customForm.title,
      subtitle: customForm.subtitle,
      cover: customForm.coverPreview, // Usamos la preview o el ItemCover lo gestionará
      isCustom: true,
    };
    console.log("Añadiendo Custom:", newItem);
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
        {/* HEADER */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100">
          <h3 className="font-bold text-lg flex items-center gap-2">
            {mode === "search" ? <Database size={18} /> : <PenTool size={18} />}
            {mode === "search"
              ? `Buscar en catálogo: ${collectionType}`
              : "Añadir elemento manual"}
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* TABS DE MODO (Solo si no es una colección 100% custom) */}
        {collectionType !== "Custom" && (
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
        )}

        {/* CONTENIDO SCROLLABLE */}
        <div className="overflow-y-auto p-4 flex-1">
          {/* === MODO BUSCADOR === */}
          {mode === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  size={20}
                />
                <input
                  type="text"
                  placeholder={`Escribe el nombre de la ${
                    collectionType === "Music" ? "canción" : "película"
                  }...`}
                  className="input input-bordered w-full pl-10 focus:input-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Resultados */}
              <div className="space-y-2">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-base-300"
                    onClick={() => handleAddFromDB(item)}
                  >
                    <img
                      src={item.cover}
                      alt=""
                      className="w-12 h-16 object-cover rounded-md bg-base-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{item.title}</p>
                      <p className="text-xs opacity-60">
                        {item.subtitle} • {item.year}
                      </p>
                    </div>
                    <button className="btn btn-sm btn-circle btn-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} />
                    </button>
                  </div>
                ))}

                {searchTerm && searchResults.length === 0 && (
                  <div className="text-center py-8 opacity-60">
                    <p>No encontramos nada en la base de datos.</p>
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
                
                {/* --- ZONA DE PORTADA OPTIMIZADA PARA MÓVIL --- */}
                {/* Usamos ItemCover y Badge fijo de cámara */}
                <div 
                  className="w-24 h-32 bg-base-200 rounded-xl overflow-hidden relative border border-base-300 shadow-sm cursor-pointer group"
                  onClick={() => fileInputRef.current.click()}
                >
                    {/* 1. Componente Visual */}
                    <ItemCover 
                        src={customForm.coverPreview} 
                        title={customForm.title || "?"} 
                    />

                    {/* 2. Badge de Cámara (Siempre visible, perfecto para móvil) */}
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm z-10 shadow-md border border-white/10">
                         <Camera size={14} />
                    </div>

                    {/* 3. Input Oculto */}
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
                    <label className="text-xs font-bold uppercase opacity-60 ml-1">
                      Título *
                    </label>
                    <input
                      required
                      type="text"
                      className="input input-bordered input-sm w-full focus:input-primary"
                      placeholder="Ej: Mi canción favorita"
                      value={customForm.title}
                      onChange={(e) =>
                        setCustomForm({ ...customForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 ml-1">
                      {collectionType === "Music"
                        ? "Artista"
                        : collectionType === "Books"
                        ? "Autor"
                        : "Subtítulo"}{" "}
                      *
                    </label>
                    <input
                      required
                      type="text"
                      className="input input-bordered input-sm w-full focus:input-primary"
                      placeholder={
                        collectionType === "Music"
                          ? "Ej: Queen"
                          : "Ej: Nombre del autor"
                      }
                      value={customForm.subtitle}
                      onChange={(e) =>
                        setCustomForm({
                          ...customForm,
                          subtitle: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase opacity-60 ml-1">
                  Nota / Descripción
                </label>
                <textarea
                  className="textarea textarea-bordered w-full text-sm focus:textarea-primary"
                  rows="3"
                  placeholder="¿Por qué añades esto?"
                  value={customForm.description}
                  onChange={(e) =>
                    setCustomForm({
                      ...customForm,
                      description: e.target.value,
                    })
                  }
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