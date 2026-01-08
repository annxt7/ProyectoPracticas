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
} from "lucide-react";
import NavDesktop from "../components/NavDesktop";
import NavMobile from "../components/NavMobile";
import api from "../services/api"; // Asegúrate de importar tu cliente API configurado

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

        // 1. SUBIR FOTO (Si el usuario seleccionó una)
        if (formData.cover) {
            const uploadData = new FormData();
            uploadData.append('imagen', formData.cover); // 'imagen' debe coincidir con tu middleware multer
            
            const uploadRes = await api.post('/files/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            finalCoverUrl = uploadRes.data.url; 
            console.log("Foto subida a Cloudflare:", finalCoverUrl);
        }

        // 2. CREAR COLECCIÓN EN SQL
        // Usamos las claves que espera el backend: collection_name, cover_url, etc.
        const payload = {
            collection_name: formData.title,
            collection_description: formData.description,
            collection_type: formData.type,
            cover_url: finalCoverUrl, // <--- AQUÍ ENVIAMOS LA URL A LA COLUMNA CORRECTA
            is_private: false 
        };

        const res = await api.post("/collections", payload);

        // 3. REDIRIGIR A LA PÁGINA REAL
        if (res.data.success) {
            console.log("Colección creada ID:", res.data.collectionId);
            // Navegamos usando el ID real que nos devolvió la base de datos
            navigate(`/collection/${res.data.collectionId}`);
        }

    } catch (error) {
        console.error("Error creando colección:", error);
        alert("Hubo un error al guardar la colección.");
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
             {/* VISTA PREVIA (IZQUIERDA) - SIN CAMBIOS */}
             <div className="hidden lg:block sticky top-24">
                <div className="mockup-window border border-base-300 bg-base-200/50 p-8">
                    <div className="flex justify-center">
                        <div className="w-64 aspect-[4/5] rounded-2xl overflow-hidden relative shadow-2xl group bg-base-100 ring-1 ring-base-200">
                            {formData.coverPreview ? (
                                <img src={formData.coverPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-base-200 flex flex-col items-center justify-center text-base-content/20">
                                    <ImageIcon size={48} />
                                    <span className="text-xs font-bold mt-2 uppercase tracking-widest">Sin Portada</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                                <p className="text-white font-serif font-bold truncate text-xl">{formData.title || "Título..."}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">0 items</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FORMULARIO (DERECHA) */}
            <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                 {/* 1. PORTADA */}
                 <div className="space-y-3">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-wider">Portada</label>
                    <div onClick={() => fileInputRef.current.click()} className={`w-full aspect-video md:aspect-[3/1] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${formData.coverPreview ? 'border-primary/50 bg-primary/5' : 'border-base-300 hover:border-primary hover:bg-base-200'}`}>
                        {formData.coverPreview ? (
                             <img src={formData.coverPreview} alt="Selected" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="text-center p-6"><ImageIcon size={24} className="mx-auto mb-2"/><span className="text-sm font-bold">Subir imagen</span></div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    </div>
                </div>

                {/* 2. DATOS */}
                <div className="form-control">
                    <label className="label"><span className="label-text font-bold">Nombre</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered w-full focus:input-primary" required />
                </div>

                <div className="form-control">
                        <label className="label"><span className="label-text font-bold">Descripción (Opcional)</span></label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="textarea textarea-bordered h-24 text-base resize-none w-full mt-1 focus:textarea-primary" 
                            placeholder="¿De qué trata esta colección?"
                        ></textarea>
                </div>

                 {/* 3. TIPO DE COLECCIÓN */}
                <div className="space-y-3">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-wider">Categoría</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {collectionTypes.map((type) => (
                            <div key={type.id} onClick={() => setFormData({...formData, type: type.id})} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === type.id ? 'border-primary bg-primary/10 text-primary' : 'border-base-200 hover:border-base-300 opacity-60 hover:opacity-100'}`}>
                                {type.icon}
                                <span className="text-xs font-bold">{type.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                 <div className="pt-4 flex items-center justify-end gap-4">
                     <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost" disabled={isLoading}>Cancelar</button>
                     <button type="submit" className="btn btn-primary px-8 rounded-full" disabled={!formData.title || isLoading}>
                        {isLoading ? <span className="loading loading-spinner"></span> : "Crear Colección"}
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