import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, X, Database, PenTool, Camera, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next"; // 1. Importar
import ItemCover from "./ItemCover";
import api from "../services/api";

const INITIAL_FORM_STATE = {
  title: "",
  subtitle: "",
  description: "",
  cover: null,
  coverPreview: "",
};

const AddItemModal = ({ isOpen, onClose, collectionType, onAddItem }) => {
  const { t } = useTranslation(); // 2. Inicializar
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
          params: { category: categoryToSend, query: searchTerm },
        });

        const itemsAdapted = response.data.map((item) => ({
          ...item,
          subtitle: item.subtitle || item.artist || item.author || item.developer || item.director || t("addItem.unknown"), // 3. Traducir "Desconocido"
          cover: item.image || item.cover_url || item.poster_url,
          year: item.release_year || item.year,
          realType: item.type,
        }));

        setSearchResults(itemsAdapted);
      } catch (error) {
        console.error("Error buscando:", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, collectionType, mode, t]);

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

  const handleAddFromDB = (item) => {
    onAddItem({ ...item, item_type: collectionType === "Custom" ? item.realType : collectionType, reference_id: item.id });
    onClose();
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    onAddItem({ ...customForm, coverFile: customForm.cover, item_type: "Custom", isCustom: true });
    onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCustomForm({ ...customForm, cover: file, coverPreview: URL.createObjectURL(file) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER TRADUCIDO */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            {mode === "search" ? <Database size={18} /> : <PenTool size={18} />}
            {mode === "search"
              ? collectionType === "Custom"
                ? t("addItem.search_catalog")
                : t("addItem.search_in", { type: collectionType })
              : t("addItem.add_manual")}
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* TABS TRADUCIDAS */}
        <div className="flex border-b border-base-200">
          <button
            onClick={() => setMode("search")}
            className={`flex-1 py-3 text-sm font-bold ${mode === "search" ? "bg-primary/10 text-primary border-b-2 border-primary" : "opacity-50"}`}
          >
            {t("addItem.tab_search")}
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`flex-1 py-3 text-sm font-bold ${mode === "custom" ? "bg-primary/10 text-primary border-b-2 border-primary" : "opacity-50"}`}
          >
            {t("addItem.tab_custom")}
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {mode === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={20} />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                )}
              </div>

              {searchResults.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex gap-3 p-2 hover:bg-base-200 rounded-xl cursor-pointer" onClick={() => handleAddFromDB(item)}>
                  <div className="w-12 h-16 overflow-hidden rounded-md bg-base-300">
                    <ItemCover src={item.cover} title={item.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{item.title}</p>
                    <p className="text-xs opacity-60 truncate">{item.subtitle}</p>
                  </div>
                  <Plus size={16} />
                </div>
              ))}
            </div>
          )}

          {mode === "custom" && (
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-24 h-32 bg-base-200 rounded-xl overflow-hidden cursor-pointer relative" onClick={() => fileInputRef.current.click()}>
                  <ItemCover src={customForm.coverPreview} title={customForm.title || "?"} />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-secondary p-1.5 rounded-full"><Camera size={14} /></div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>

                <div className="flex-1 space-y-3">
                  <input
                    required
                    placeholder={t("addItem.placeholder_title")}
                    className="input input-bordered input-sm w-full"
                    value={customForm.title}
                    onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                  />
                  <input
                    required
                    placeholder={t("addItem.placeholder_subtitle")}
                    className="input input-bordered input-sm w-full"
                    value={customForm.subtitle}
                    onChange={(e) => setCustomForm({ ...customForm, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <textarea
                className="textarea textarea-bordered w-full"
                placeholder={t("addItem.placeholder_description")}
                value={customForm.description}
                onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
              />

              <button type="submit" className="btn btn-primary w-full gap-2">
                <Plus size={18} /> {t("addItem.btn_add")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;