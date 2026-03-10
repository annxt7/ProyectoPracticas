import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Layers,
  Trash2,
  Search,
  ShieldAlert,
  Key,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Package,
  AlertCircle,
  Library, 
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("requests");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADOS PARA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  const [expandedCollection, setExpandedCollection] = useState(null);
  const [collectionItems, setCollectionItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userCollections, setUserCollections] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const filteredData = Array.isArray(data)
    ? data.filter((item) => {
        const term = searchTerm.toLowerCase();
        
        if (activeTab === "users" && (item.role === "admin" || item.owner?.role === "admin")) return false;

        if (activeTab === "users") {
          return item.username?.toLowerCase().includes(term) || item.email?.toLowerCase().includes(term);
        }
        if (activeTab === "requests") {
          return item.email?.toLowerCase().includes(term);
        }
        if (activeTab === "collections") {
          return item.name?.toLowerCase().includes(term);
        }
        if (activeTab === "custom") {
          return item.title?.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term);
        }
        return true;
      })
    : [];

  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/feed");
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/data", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          tab: activeTab 
        }
      });

      if (activeTab === "users") setData(response.data.users || []);
      else if (activeTab === "requests") setData(response.data.requests || []);
      else if (activeTab === "collections") setData(response.data.collections || []);
      else if (activeTab === "custom") {
        setData(response.data.customCatalog || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

  }, [activeTab, currentPage]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); 
  };

  const toggleCollectionDetails = async (colId) => {
    if (expandedCollection === colId) {
      setExpandedCollection(null);
      return;
    }
    setExpandedCollection(colId);
    setLoadingItems(true);
    try {
      const res = await api.get(`/collections/${colId}`);
      setCollectionItems(res.data.items || []);
    } catch (error) {
      setCollectionItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDelete = async (id, isModal = false) => {
    if (!window.confirm("¿Estás seguro de eliminar esto? Esta acción no se puede deshacer.")) return;
    try {
      let type = "";
      if (activeTab === "users" && !isModal) type = "User";
      else if (activeTab === "collections" || isModal) type = "Collections";
      else if (activeTab === "custom") type = "Custom";

      await api.delete(`/admin/${type}/${id}`);

      if (isModal) {
        setUserCollections((prev) => prev.filter((c) => String(c.collection_id) !== String(id)));
      } else {
        setData((prev) => prev.filter((item) => String(item.id) !== String(id)));
      }
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const handleApproveReset = async (requestId) => {
    const newCode = generateCode();
    if (!window.confirm(`¿Generar código "${newCode}" para este usuario?`)) return;
    try {
      await api.post("/admin/approve-reset", { requestId, code: newCode });
      setData((prevData) =>
        prevData.map((item) =>
          item.id === requestId ? { ...item, status: "completed", codeGenerated: newCode } : item
        )
      );
    } catch (error) {
      alert("Error al generar el código.");
    }
  };

  const openUserCollections = async (userObj) => {
    setSelectedUser(userObj);
    setUserCollections([]);
    setLoadingModal(true);
    document.getElementById("modal_user_collections").showModal();
    try {
      const res = await api.get(`/collections/user/${userObj.id}`);
      setUserCollections(res.data || []);
    } catch (error) {
      console.error("Error cargando colecciones");
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-sm">
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-primary" /> Admin Panel
        </h1>
        <button onClick={logout} className="btn btn-error btn-outline btn-sm">
          Salir
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-base-100 rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {/* TABS (Actualizado a 4 columnas) */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-base-300">
          <TabButton active={activeTab === "requests"} onClick={() => handleTabChange("requests")} icon={<Key size={18} />} label="Solicitudes" />
          <TabButton active={activeTab === "users"} onClick={() => handleTabChange("users")} icon={<Users size={18} />} label="Usuarios" />
          <TabButton active={activeTab === "collections"} onClick={() => handleTabChange("collections")} icon={<Layers size={18} />} label="Colecciones" />
          <TabButton active={activeTab === "custom"} onClick={() => handleTabChange("custom")} icon={<Library size={18} />} label="Catálogo" />
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 border-b border-base-200">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
            <input
              type="text"
              placeholder="Buscar en esta página..."
              className="input input-bordered w-full pl-10 rounded-full bg-base-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="opacity-50">Cargando datos...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-40">
              <AlertCircle size={48} className="mb-2" />
              <p className="text-lg font-medium">No se encontraron resultados</p>
            </div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/50">
                  {activeTab === "requests" && (<><th>Fecha</th><th>Usuario</th><th>Estado</th><th className="text-right">Acción</th></>)}
                  {activeTab === "users" && (<><th>Usuario</th><th>Rol</th><th>ID</th><th className="text-right">Acciones</th></>)}
                  {activeTab === "collections" && (<><th>Título</th><th>Dueño</th><th>Items</th><th className="text-right">Acciones</th></>)}
                  {activeTab === "custom" && (<><th>Item</th><th>Detalles</th><th>Categoría</th><th className="text-right">Acciones</th></>)}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-base-200/30 transition-colors">
                      {activeTab === "requests" && (
                        <>
                          <td className="opacity-50 text-xs">{item.date}</td>
                          <td className="font-bold text-primary">{item.email}</td>
                          <td><div className={`badge badge-sm ${item.status === "pending" ? "badge-warning" : "badge-success"}`}>{item.status}</div></td>
                          <td className="text-right">
                            {item.codeGenerated ? (
                              <span className="font-mono text-lg font-bold bg-base-200 px-3 py-1 rounded-lg border border-base-300">{item.codeGenerated}</span>
                            ) : (
                              <button onClick={() => handleApproveReset(item.id)} className="btn btn-xs btn-primary">Generar Código</button>
                            )}
                          </td>
                        </>
                      )}

                      {activeTab === "users" && (
                        <>
                          <td>
                            <div className="flex items-center gap-3">
                              <img src={item.avatar || `https://ui-avatars.com/api/?name=${item.username}`} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                              <div><div className="font-bold">{item.username}</div><div className="text-xs opacity-50">{item.email}</div></div>
                            </div>
                          </td>
                          <td><span className="badge badge-ghost uppercase text-[10px] font-bold">{item.role}</span></td>
                          <td className="font-mono text-xs opacity-50">{item.id}</td>
                          <td className="text-right">
                            <button onClick={() => openUserCollections(item)} className="btn btn-ghost btn-xs text-primary"><FolderOpen size={16} /></button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-error"><Trash2 size={16} /></button>
                          </td>
                        </>
                      )}

                      {activeTab === "collections" && (
                        <>
                          <td className="font-bold cursor-pointer hover:text-primary flex items-center gap-2" onClick={() => toggleCollectionDetails(item.id)}>
                            {expandedCollection === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {item.name}
                          </td>
                          <td>{item.owner?.username}</td>
                          <td><div className="badge badge-outline">{item.item_count || 0}</div></td>
                          <td className="text-right">
                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-error"><Trash2 size={16} /></button>
                          </td>
                        </>
                      )}

                      {activeTab === "custom" && (
                        <>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-base-300 overflow-hidden flex-shrink-0">
                                {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt="item" /> : <Package className="w-full h-full p-2 opacity-20" />}
                              </div>
                              <div className="font-bold truncate max-w-[150px]">{item.title}</div>
                            </div>
                          </td>
                          <td><div className="text-xs opacity-60 truncate max-w-[200px]">{item.subtitle || "Sin descripción"}</div></td>
                          <td><span className="badge badge-outline badge-sm uppercase text-[10px]">{item.category}</span></td>
                          <td className="text-right">
                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-error"><Trash2 size={16} /></button>
                          </td>
                        </>
                      )}
                    </tr>

                    
                    {activeTab === "collections" && expandedCollection === item.id && (
                      <tr>
                        <td colSpan="4" className="bg-base-200/50 p-0">
                          <div className="p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <h4 className="text-[10px] uppercase font-black opacity-40 mb-3 flex items-center gap-2"><Package size={12} /> Contenido</h4>
                            {loadingItems ? (
                              <div className="flex items-center gap-2 p-2 italic opacity-50"><span className="loading loading-dots loading-sm"></span> Cargando...</div>
                            ) : collectionItems.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {collectionItems.map((i) => (
                                  <div key={i.item_id} className="bg-base-100 p-2 rounded-lg border border-base-300 flex items-center gap-3">
                                    <img src={i.display_image} className="w-10 h-10 rounded object-cover bg-base-300" alt="item" />
                                    <div className="overflow-hidden"><p className="font-bold text-xs truncate">{i.display_title}</p><p className="text-[10px] opacity-50 uppercase">{i.item_type}</p></div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs opacity-50 italic p-2">Esta colección está vacía.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

     
        {activeTab === "custom" && totalPages > 1 && (
          <div className="p-4 border-t border-base-200 flex justify-center items-center gap-4 bg-base-100">
            <button 
              className="btn btn-sm btn-outline" 
              disabled={currentPage === 1 || loading} 
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Anterior
            </button>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              className="btn btn-sm btn-outline" 
              disabled={currentPage === totalPages || loading} 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* MODAL USER COLLECTIONS  */}
      <dialog id="modal_user_collections" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-2xl bg-base-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Layers size={24} /></div>
              <div><h3 className="font-black text-xl">Colecciones</h3><p className="text-xs opacity-50">Gestionando contenido de {selectedUser?.username}</p></div>
            </div>
            <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost">✕</button></form>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {loadingModal ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50"><span className="loading loading-spinner loading-md"></span><p>Buscando...</p></div>
            ) : userCollections.length > 0 ? (
              userCollections.map((col) => (
                <div key={col.collection_id} className="flex justify-between items-center p-4 bg-base-200/50 hover:bg-base-200 rounded-2xl transition-all border border-base-300/50 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">{col.item_count}</div>
                    <div><span className="font-bold block">{col.collection_name}</span><span className="text-[10px] opacity-50 uppercase">ID: {col.collection_id}</span></div>
                  </div>
                  <button onClick={() => handleDelete(col.collection_id, true)} className="btn btn-error btn-sm btn-square opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-base-200/30 rounded-3xl border-2 border-dashed border-base-300"><AlertCircle size={40} className="opacity-20 mb-2" /><p className="font-bold opacity-60">Sin colecciones</p></div>
            )}
          </div>
          <div className="modal-action"><form method="dialog"><button className="btn btn-ghost rounded-full">Cerrar</button></form></div>
        </div>
      </dialog>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`h-14 flex items-center justify-center gap-2 font-bold border-b-2 transition-all 
      ${active ? "border-primary text-primary bg-primary/5" : "border-transparent opacity-50 hover:opacity-100"}`}
  >
    {icon} <span className="hidden sm:inline">{label}</span>
  </button>
);

export default AdminDashboard;