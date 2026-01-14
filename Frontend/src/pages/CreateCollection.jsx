import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Image as ImageIcon,
  Music,
  Book,
  Gamepad2,
  Tv,
  Film,
  Box,
  ArrowLeft,
  Info
} from "lucide-react";
import NavDesktop from "../components/NavDesktop";
import NavMobile from "../components/NavMobile";
import api from "../services/api";

const CreateCollection = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Movies",
    cover: null,
    coverPreview: null
  });

  const collectionTypes = [
    { id: "Movies", label: "Cine", icon: <Film size={20} /> },
    { id: "Books", label: "Libros", icon: <Book size={20} /> },
    { id: "Music", label: "Música", icon: <Music size={20} /> },
    { id: "Shows", label: "Series", icon: <Tv size={20} /> },
    { id: "Games", label: "Juegos", icon: <Gamepad2 size={20} /> },
    { id: "Custom", label: "Otro", icon: <Box size={20} /> },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, cover: file, coverPreview: url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalCoverUrl = null;

      if (formData.cover) {
        const uploadData = new FormData();
        uploadData.append('imagen', formData.cover);
        const uploadRes = await api.post('/files/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalCoverUrl = uploadRes.data.url;
      }

      const payload = {
        collection_name: formData.title,
        collection_description: formData.description,
        collection_type: formData.type,
        cover_url: finalCoverUrl,
        is_private: false
      };

      const res = await api.post("/collections", payload);

      if (res.data.success) {
        navigate(`/collection/${res.data.collection_id}`);
      }
    } catch (error) {
      console.error("Error al crear:", error);
      alert("Error: " + (error.response?.data?.sqlMessage || "No se pudo crear"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pb-24 md:pb-10 text-base-content font-sans">
      <NavDesktop />
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold font-serif">Nueva Colección</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* VISTA PREVIA (IZQUIERDA) - MEJORADA PARA EVITAR CONFUSIÓN */}
          <div className="hidden lg:block sticky top-24">
            <div className="flex items-center justify-center gap-2 mb-4 opacity-40">
                <Info size={14} />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
                    Vista previa en tiempo real
                </p>
            </div>
            
            <div className="mockup-window border border-base-300 bg-base-200/40 p-10 relative overflow-visible">
              
              {/* Etiqueta flotante de Preview */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <span className="bg-primary text-primary-content text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl uppercase tracking-widest border-2 border-base-100 animate-bounce-slow">
                  Preview
                </span>
              </div>

              <div className="flex justify-center">
                {/* pointer-events-none evita que el usuario intente clickear la card */}
                <div className="w-64 aspect-4/5 rounded-2xl overflow-hidden relative shadow-2xl bg-base-100 ring-1 ring-base-200 pointer-events-none transition-all duration-500 hover:scale-[1.02] group">
                  
                  {formData.coverPreview ? (
                    <img src={formData.coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-base-200 flex flex-col items-center justify-center text-base-content/20">
                      <ImageIcon size={48} />
                      <span className="text-xs font-bold mt-2 uppercase tracking-widest">Esperando Portada</span>
                    </div>
                  )}

                  {/* Overlay con degradado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <div className="mb-2">
                        <span className="bg-white/20 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-md uppercase font-bold tracking-tighter">
                            {collectionTypes.find(t => t.id === formData.type)?.label}
                        </span>
                    </div>
                    
                    <p className="text-white font-serif font-bold truncate text-xl leading-none">
                      {formData.title || "Título de colección..."}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                      <p className="text-white/50 text-[10px] font-medium uppercase tracking-widest">0 elementos</p>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    </div>
                  </div>

                  {/* Marca de agua sutil para reforzar que no es editable */}
                  <div className="absolute inset-0 flex items-center justify-center rotate-12 pointer-events-none opacity-[0.03]">
                      <span className="text-6xl font-black uppercase">Tribe</span>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-[11px] opacity-40 leading-relaxed">
                Esta es la apariencia final de tu card.<br /> 
                <span className="font-bold">Edita los campos de la derecha</span> para ver los cambios.
              </p>
            </div>
          </div>

          {/* FORMULARIO (DERECHA) */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold opacity-70 uppercase tracking-wider">Portada de la colección</label>
              <div 
                onClick={() => fileInputRef.current.click()} 
                className={`w-full aspect-video md:aspect-[3/1] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${formData.coverPreview ? 'border-primary/50 bg-primary/5' : 'border-base-300 hover:border-primary hover:bg-base-200'}`}
              >
                {formData.coverPreview ? (
                  <img src={formData.coverPreview} alt="Selected" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon size={24} className="mx-auto mb-2 opacity-40"/>
                    <span className="text-sm font-bold">Haz clic para subir imagen</span>
                    <p className="text-[10px] opacity-50 mt-1">Recomendado: 4:5 o 16:9</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-bold text-base">Nombre de la colección</span></label>
              <input 
                type="text" 
                name="title" 
                placeholder="Ej: Mis películas favoritas de terror"
                value={formData.title} 
                onChange={handleChange} 
                className="input input-bordered w-full focus:input-primary bg-base-200/50 border-none h-14" 
                required 
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-bold text-base">Descripción</span></label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered h-28 text-base resize-none w-full bg-base-200/50 border-none focus:textarea-primary" 
                placeholder="Cuéntale a tu tribu de qué trata este espacio..."
              ></textarea>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold opacity-70 uppercase tracking-wider">Categoría</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {collectionTypes.map((type) => (
                  <div 
                    key={type.id} 
                    onClick={() => setFormData({...formData, type: type.id})} 
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === type.id ? 'border-primary bg-primary/10 text-primary' : 'border-base-200 bg-base-200/30 hover:border-base-300 opacity-60 hover:opacity-100'}`}
                  >
                    {type.icon}
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-6 flex items-center justify-end gap-4 border-t border-base-200">
              <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost font-bold" disabled={isLoading}>
                Descartar
              </button>
              <button type="submit" className="btn btn-primary px-10 rounded-full font-bold shadow-lg shadow-primary/20" disabled={!formData.title || isLoading}>
                {isLoading ? <span className="loading loading-spinner"></span> : "Publicar Colección"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <NavMobile />
    </div>
  );
};

export default CreateCollection;