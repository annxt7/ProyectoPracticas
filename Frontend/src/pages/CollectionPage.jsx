import React, { useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Share2,
  Settings,
  Heart,
  BookmarkPlus,
  Trash2,
  Camera, // Icono para la foto
  Check, // Icono para guardar
  X, // Icono para cancelar
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import ItemCover from "../components/ItemCover.jsx";

// Modales de Items (ya no necesitamos el EditCollectionModal)
import AddToCollectionModal from "../components/AddToCollectionModal";
import AddItemModal from "../components/AddItemModal";

const CollectionPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Verificamos si venimos de "Crear Colección"
  const incomingData = location.state?.newCollectionData;

  const isOwner = true;

  const defaultCollection = {
    title: "Cinema Paradiso",
    description:
      "Una selección curada de películas italianas que definieron una época.",
    type: "Movies",
    creator: {
      username: "Usuario_07",
      name: "Usuario_07",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    },
    cover:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200",
    stats: { items: 6, followers: 340, likes: 85 },
  };

  // ESTADO PRINCIPAL DE LA COLECCIÓN
  const [collectionInfo, setCollectionInfo] = useState(
    incomingData
      ? {
          title: incomingData.title,
          description: incomingData.description,
          type: incomingData.type,
          creator: {
            username: "Yo",
            name: "Yo Mismo",
            avatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
          },
          cover: incomingData.coverPreview || "https://via.placeholder.com/800",
          stats: { items: 0, followers: 0, likes: 0 },
        }
      : defaultCollection
  );

  const [items, setItems] = useState(
    incomingData
      ? []
      : [
          {
            id: 1,
            title: "La Dolce Vita",
            author: "Fellini",
            year: "1960",
            cover:
              "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400",
          },
          {
            id: 2,
            title: "8½",
            author: "Fellini",
            year: "1963",
            cover:
              "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400",
          },
          {
            id: 3,
            title: "Cinema Paradiso",
            author: "Tornatore",
            year: "1988",
            cover:
              "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400",
          },
        ]
  );

  // --- ESTADOS DE EDICIÓN (INLINE) ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    cover: "",
  });

  // --- ESTADOS PARA MODALES ---
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedItemForSave, setSelectedItemForSave] = useState(null);

  // --- HANDLERS DE EDICIÓN ---

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
    setEditForm({ title: "", description: "", cover: "" }); // Reset
  };

  const handleSaveEditing = () => {
    setCollectionInfo({
      ...collectionInfo,
      title: editForm.title,
      description: editForm.description,
      cover: editForm.cover,
    });
    setIsEditing(false);
    // AQUÍ HARÍAS LA LLAMADA PUT A LA API
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEditForm({ ...editForm, cover: url });
    }
  };

  // --- HANDLERS DE ITEMS ---
  const handleDelete = (itemId) => {
    if (window.confirm("¿Eliminar de la colección?")) {
      setItems(items.filter((i) => i.id !== itemId));
    }
  };

  const handleAddItemToState = (newItem) => {
    const itemFormatted = {
      id: Date.now(),
      title: newItem.title,
      author: newItem.subtitle || newItem.author,
      year: newItem.year || new Date().getFullYear(),
      cover: newItem.cover,
    };
    setItems([...items, itemFormatted]);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* --- HEADER --- */}
      <div className="relative bg-base-100">
        {/* Banner Blur Background (Usa la imagen actual o la editada en tiempo real) */}
        <div className="absolute inset-0 h-80 overflow-hidden -z-10 opacity-30">
          <img
            src={isEditing ? editForm.cover : collectionInfo.cover}
            className="w-full h-full object-cover blur-3xl transition-all duration-500"
            alt=""
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-base-100/80 to-base-100"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to={
                isOwner
                  ? "/profile/me"
                  : `/profile/${collectionInfo.creator.username}`
              }
              className="inline-flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 hover:text-primary transition-all"
            >
              <ArrowLeft size={16} />
              {isOwner
                ? "Volver a mi perfil"
                : `Volver al perfil de ${collectionInfo.creator.name}`}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* --- PORTADA DE LA COLECCIÓN --- */}
            <div className="flex-none w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/80 bg-base-200 relative group">
              <img
                src={isEditing ? editForm.cover : collectionInfo.cover}
                alt="Cover"
                className="w-full h-full object-cover"
              />

              {/* Overlay de Edición de Foto (Solo visible si isEditing es true) */}
              {isEditing && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                  <Camera className="text-white mb-2" size={32} />
                  <span className="text-white text-xs font-bold uppercase tracking-widest">
                    Cambiar
                  </span>
                </div>
              )}
              {/* Input oculto */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* --- INFO TEXTO (INLINE EDITING) --- */}
            <div className="flex-1 w-full space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs opacity-50 uppercase tracking-widest">
                    Creado por {collectionInfo.creator.name}
                  </span>
                  <span className="badge badge-outline text-xs">
                    {collectionInfo.type}
                  </span>
                </div>

                {/* TÍTULO EDITABLE */}
                {isEditing ? (
                  <input
                    type="text"
                    className="input input-ghost w-full text-4xl md:text-5xl font-bold font-serif px-0 h-auto focus:bg-transparent focus:text-primary border-b-2 border-white/40 rounded-none placeholder-base-content/30"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    autoFocus
                  />
                ) : (
                  <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight text-base-content">
                    {collectionInfo.title}
                  </h1>
                )}
              </div>

              {/* DESCRIPCIÓN EDITABLE */}
              {isEditing ? (
                <textarea
                  className="textarea textarea-ghost w-full text-lg leading-relaxed px-0 h-32 resize-none focus:bg-transparent border-l-4 border-white/40 rounded-none pl-4"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              ) : (
                <p className="text-lg opacity-80 leading-relaxed max-w-2xl border-l-4 border-white/40 pl-4 whitespace-pre-wrap">
                  {collectionInfo.description}
                </p>
              )}

              {/* Stats & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/40">
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <span className="block font-bold text-lg">
                      {items.length}
                    </span>
                    <span className="opacity-60">Items</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">
                      {collectionInfo.stats.likes}
                    </span>
                    <span className="opacity-60">Likes</span>
                  </div>
                </div>

                {/* BOTONERA DE ACCIONES */}
                <div className="flex gap-3">
                  {isOwner ? (
                    /* MODO DUEÑO */
                    <>
                      {isEditing ? (
                        /* BOTONES DE GUARDAR / CANCELAR */
                        <>
                          <button
                            onClick={handleSaveEditing}
                            className="btn btn-primary btn-sm gap-2 rounded-full"
                            disabled={!editForm.title.trim()}
                          >
                            <Check size={18} /> Guardar
                          </button>
                          <button
                            onClick={handleCancelEditing}
                            className="btn btn-ghost btn-sm gap-2 rounded-full"
                          >
                            <X size={18} /> Cancelar
                          </button>
                        </>
                      ) : (
                        /* BOTONES NORMALES */
                        <>
                          <button
                            onClick={handleStartEditing}
                            className="btn btn-outline btn-sm gap-2 rounded-full"
                          >
                            <Settings size={18} /> Editar Info
                          </button>
                          <button
                            onClick={() => setIsAddItemOpen(true)}
                            className="btn btn-primary btn-sm gap-2 rounded-full shadow-lg shadow-primary/20"
                          >
                            <Plus size={18} /> Añadir Item
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    /* ACCIONES VISITANTE */
                    <>
                      <button className="btn btn-outline btn-sm gap-2 rounded-full hover:bg-pink-50 hover:border-pink-200 hover:text-pink-500 transition-colors">
                        <Heart size={18} /> Me gusta
                      </button>
                      <button className="btn btn-primary btn-sm gap-2 rounded-full">
                        <BookmarkPlus size={18} /> Seguir
                      </button>
                    </>
                  )}

                  {/* Botón compartir siempre visible */}
                  {!isEditing && (
                    <button className="btn btn-square btn-ghost btn-sm rounded-full">
                      <Share2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- GRID DE ITEMS --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          Contenido
          <span className="text-xs font-normal opacity-50 bg-base-200 px-2 py-1 rounded-full">
            {items.length}
          </span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
          {items.map((item) => (
            <div key={item.id} className="group relative flex flex-col gap-2">
              <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-base-200 shadow-sm transition-all duration-300 group-hover:shadow-md">
                <ItemCover src={item.cover} title={item.title} />

                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isOwner ? (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-square btn-sm btn-error text-white shadow-md border-none"
                      title="Eliminar de mi colección"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedItemForSave(item)}
                      className="btn btn-square btn-sm btn-white text-primary shadow-md border-none hover:bg-primary hover:text-white"
                      title="Añadir a mi colección"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm leading-tight truncate pr-2 group-hover:text-primary transition-colors cursor-pointer">
                  {item.title}
                </h3>
                <p className="text-xs opacity-60 truncate">
                  {item.author} • {item.year}
                </p>
              </div>
            </div>
          ))}

          {isOwner && (
            <div
              onClick={() => setIsAddItemOpen(true)}
              className="aspect-2/3 rounded-xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-base-200/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus size={24} />
              </div>
              <span className="text-xs font-bold uppercase mt-2 opacity-40 group-hover:opacity-100">
                Añadir
              </span>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALES --- */}
      <AddToCollectionModal
        isOpen={!!selectedItemForSave}
        item={selectedItemForSave}
        onClose={() => setSelectedItemForSave(null)}
      />

      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        collectionType={collectionInfo.type}
        onAddItem={handleAddItemToState}
      />
      <NavMobile />
    </div>
  );
};

export default CollectionPage;
