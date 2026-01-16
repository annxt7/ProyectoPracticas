import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Layers, Trash2, Search, ShieldAlert, LogOut,
  Key, FolderOpen, ChevronDown, ChevronUp, Package
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

  // ESTADOS NUEVOS PARA VER ITEMS
  const [expandedCollection, setExpandedCollection] = useState(null); // ID de la col expandida
  const [collectionItems, setCollectionItems] = useState([]); // Items de esa col
  const [loadingItems, setLoadingItems] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userCollections, setUserCollections] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/feed"); 
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/data");
      if (activeTab === "users") setData(response.data.users || []);
      else if (activeTab === "requests") setData(response.data.requests || []);
      else if (activeTab === "collections") setData(response.data.collections || []);
    } catch (error) {
      console.error("Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  // FUNCIÓN PARA CARGAR ITEMS DE UNA COLECCIÓN
  const toggleCollectionDetails = async (colId) => {
    if (expandedCollection === colId) {
      setExpandedCollection(null);
      return;
    }

    setExpandedCollection(colId);
    setLoadingItems(true);
    try {
      // Reutilizamos tu endpoint de detalles que ya devuelve { ...collection, items }
      const res = await api.get(`/collections/${colId}`);
      setCollectionItems(res.data.items || []);
    } catch (error) {
      console.error("Error cargando items");
      setCollectionItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDelete = async (id, isModal = false) => {
    if (!window.confirm("¿Estás seguro?")) return;
    try {
      const type = activeTab === "users" && !isModal ? "User" : "Collections";
      await api.delete(`/admin/${type}/${id}`);
      if (isModal) {
        setUserCollections(prev => prev.filter(c => String(c.collection_id) !== String(id)));
      } else {
        setData(prev => prev.filter(item => String(item.id) !== String(id)));
      }
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const openUserCollections = async (userObj) => {
    setSelectedUser(userObj);
    setLoadingModal(true);
    document.getElementById('modal_user_collections').showModal();
    try {
      const res = await api.get(`/collections/user/${userObj.id}`); 
      setUserCollections(res.data);
    } catch (error) {
      console.error("Error");
    } finally {
      setLoadingModal(false);
    }
  };

  const filteredData = Array.isArray(data) ? data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const isNotAdmin = item.role !== "admin" && item.owner?.role !== "admin";
    const matchesSearch = 
      (activeTab === "users" && (item.username?.toLowerCase().includes(term) || item.email?.toLowerCase().includes(term))) ||
      (activeTab === "requests" && item.email?.toLowerCase().includes(term)) ||
      (activeTab === "collections" && item.name?.toLowerCase().includes(term));
    return isNotAdmin && matchesSearch;
  }) : [];

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-sm">
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-primary" /> Admin Panel
        </h1>
        <button onClick={logout} className="btn btn-error btn-outline btn-sm">Salir</button>
      </div>

      <div className="max-w-7xl mx-auto bg-base-100 rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="grid grid-cols-3 border-b border-base-300">
          <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")} icon={<Key size={18} />} label="Solicitudes" />
          <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users size={18} />} label="Usuarios" />
          <TabButton active={activeTab === "collections"} onClick={() => setActiveTab("collections")} icon={<Layers size={18} />} label="Colecciones" />
        </div>

        <div className="p-4 border-b border-base-200">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18}/>
            <input 
              type="text" placeholder="Buscar..." 
              className="input input-bordered w-full pl-10 rounded-full bg-base-200"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200/50">
                {activeTab === "requests" && <><th>Fecha</th><th>Usuario</th><th>Estado</th><th className="text-right">Acción</th></>}
                {activeTab === "users" && <><th>Usuario</th><th>Rol</th><th>ID</th><th className="text-right">Acciones</th></>}
                {activeTab === "collections" && <><th>Título</th><th>Dueño</th><th>Items</th><th className="text-right">Acciones</th></>}
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
                        <td><div className={`badge badge-sm ${item.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>{item.status}</div></td>
                        <td className="text-right"><button className="btn btn-xs btn-primary">Gestionar</button></td>
                      </>
                    )}

                    {activeTab === "users" && (
                      <>
                        <td>
                          <div className="flex items-center gap-3">
                            <img src={item.avatar || `https://ui-avatars.com/api/?name=${item.username}`} className="w-8 h-8 rounded-full" />
                            <div><div className="font-bold">{item.username}</div><div className="text-xs opacity-50">{item.email}</div></div>
                          </div>
                        </td>
                        <td><span className="badge badge-ghost">{item.role}</span></td>
                        <td className="font-mono text-xs opacity-50">{item.id}</td>
                        <td className="text-right">
                          <button onClick={() => openUserCollections(item)} className="btn btn-ghost btn-xs text-primary"><FolderOpen size={16}/></button>
                          <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-error"><Trash2 size={16}/></button>
                        </td>
                      </>
                    )}

                    {activeTab === "collections" && (
                      <>
                        <td 
                          className="font-bold cursor-pointer hover:text-primary flex items-center gap-2"
                          onClick={() => toggleCollectionDetails(item.id)}
                        >
                          {expandedCollection === item.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                          {item.name}
                        </td>
                        <td>{item.owner?.username}</td>
                        <td><div className="badge badge-outline">{item.item_count || 0}</div></td>
                        <td className="text-right">
                          <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-error"><Trash2 size={16} /></button>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* SUB-FILA DE ITEMS DETALLADOS */}
                  {activeTab === "collections" && expandedCollection === item.id && (
                    <tr>
                      <td colSpan="4" className="bg-base-200/50 p-0">
                        <div className="p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                          <h4 className="text-[10px] uppercase font-black opacity-40 mb-3 flex items-center gap-2">
                            <Package size={12}/> Contenido de la colección
                          </h4>
                          {loadingItems ? (
                            <span className="loading loading-dots loading-sm"></span>
                          ) : collectionItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {collectionItems.map(i => (
                                <div key={i.item_id} className="bg-base-100 p-2 rounded-lg border border-base-300 flex items-center gap-3">
                                  <img src={i.display_image} className="w-10 h-10 rounded object-cover bg-base-300" />
                                  <div className="overflow-hidden">
                                    <p className="font-bold text-xs truncate">{i.display_title}</p>
                                    <p className="text-[10px] opacity-50 uppercase">{i.item_type}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs opacity-50 italic">Esta colección está vacía.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL USUARIOS (Simplificado para el ejemplo) */}
      <dialog id="modal_user_collections" className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Colecciones de {selectedUser?.username}</h3>
          <div className="space-y-2">
            {userCollections.map(col => (
              <div key={col.collection_id} className="flex justify-between items-center p-3 bg-base-200 rounded-xl">
                <span>{col.collection_name} ({col.item_count} items)</span>
                <button onClick={() => handleDelete(col.collection_id, true)} className="btn btn-error btn-xs">Eliminar</button>
              </div>
            ))}
          </div>
          <div className="modal-action"><form method="dialog"><button className="btn">Cerrar</button></form></div>
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
    {icon} <span>{label}</span>
  </button>
);

export default AdminDashboard;