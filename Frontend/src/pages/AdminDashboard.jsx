import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Layers, 
  Trash2, 
  Search, 
  ShieldAlert, 
  LogOut,
  ArrowLeft,
  Key,
  FolderOpen,
  CheckCircle,
  XCircle,
  Copy
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Pestañas: 'users', 'collections', 'requests'
  const [activeTab, setActiveTab] = useState("requests");
  
  // Datos principales
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el Modal de Colecciones de Usuario
  const [selectedUser, setSelectedUser] = useState(null);
  const [userCollections, setUserCollections] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
console.log("Datos del usuario en el Dashboard:", user);
  // Verificación de Admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/feed"); 
    }
  }, [user, navigate]);

  // Cargar datos según la pestaña
 const fetchData = async () => {
  setLoading(true);
  try {
    if (activeTab === "requests" || activeTab === "users") {
      const response = await api.get("/admin/data");
      setData(activeTab === "users" ? response.data.users : response.data.requests);
    } else {
      const response = await api.get("/admin/collections");
      setData(response.data);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // --- LÓGICA DE ELIMINACIÓN GENÉRICA ---
  const handleDelete = async (id, isModal = false) => {
    if (!window.confirm("¿Estás seguro de eliminar este elemento permanentemente?")) return;

    try {
      // Si estamos borrando desde el modal, es una colección
      const endpoint = (activeTab === "users" && !isModal) 
        ? `/admin/User/${id}` 
        : `/admin/Collections/${id}`;

      await api.delete(endpoint);
      
      if (isModal) {
        // Actualizar lista del modal
        setUserCollections(userCollections.filter(c => c._id !== id));
      } else {
        // Actualizar lista principal
        setData(data.filter((item) => item.id !== id));
      }
      alert("Eliminado correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar.");
    }
  };

  // --- LÓGICA DE SOLICITUDES DE CONTRASEÑA ---
  const handleGenerateCode = async (reqId, email) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Genera ej: X7K9P2
    if(window.confirm(`¿Generar código de recuperación para ${email}?`)) {
       try {
         // Aquí llamarías a tu API: api.post('/auth/approve-reset', { reqId, code })
         alert(`CÓDIGO GENERADO: ${code}\n\nCópialo y envíalo al usuario. (En un sistema real, esto enviaría el email).`);
         
         // Actualizar estado local
         setData(data.map(item => item.id === reqId ? {...item, status: 'completed', codeGenerated: code} : item));
       } catch (error) {
         alert("Error generando código");
       }
    }
  };

  // --- LÓGICA VER COLECCIONES DE USUARIO (MODAL) ---
  const openUserCollections = async (userObj) => {
    setSelectedUser(userObj);
    setLoadingModal(true);
    // Abrir modal (DaisyUI controla esto vía checkbox o clase, usaremos estado)
    document.getElementById('modal_user_collections').showModal();

    try {
      const res = await api.get(`/collections/user/${userObj._id}`); // Ajusta tu endpoint
      setUserCollections(res.data);
    } catch (error) {
      console.error("Error cargando colecciones del usuario");
    } finally {
      setLoadingModal(false);
    }
  };

  // Filtrado
  const filteredData = Array.isArray(data) ? data.filter((item) => {
    const term = searchTerm.toLowerCase();
    if (activeTab === "users") return item.username?.toLowerCase().includes(term) || item.email?.toLowerCase().includes(term);
    if (activeTab === "collections") return item.title?.toLowerCase().includes(term);
    if (activeTab === "requests") return item.email?.toLowerCase().includes(term);
    return false;
  }) : [];

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <button onClick={() => navigate("/feed")} className="btn btn-ghost btn-sm gap-2 pl-0 mb-1">
             <ArrowLeft size={16}/> Volver
          </button>
          <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
            <ShieldAlert className="text-primary" /> Admin Panel
          </h1>
        </div>
        <button onClick={logout} className="btn btn-outline btn-error btn-sm">
          <LogOut size={16} /> Salir
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-base-100 rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        
        {/* TABS DE NAVEGACIÓN */}
        <div className="grid grid-cols-3 border-b border-base-300 bg-base-100/50">
          <TabButton 
            active={activeTab === "requests"} 
            onClick={() => setActiveTab("requests")} 
            icon={<Key size={18} />} 
            label="Solicitudes Pass"
            badge={filteredData.length > 0 && activeTab === 'requests' ? filteredData.filter(i => i.status === 'pending').length : 0}
          />
          <TabButton 
            active={activeTab === "users"} 
            onClick={() => setActiveTab("users")} 
            icon={<Users size={18} />} 
            label="Usuarios" 
          />
          <TabButton 
            active={activeTab === "collections"} 
            onClick={() => setActiveTab("collections")} 
            icon={<Layers size={18} />} 
            label="Todas las Colecciones" 
          />
        </div>

        {/* TOOLBAR */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18}/>
              <input 
                type="text" 
                placeholder="Buscar..."
                className="input input-bordered w-full pl-10 h-10 rounded-full bg-base-200 focus:bg-base-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* CONTENIDO PRINCIPAL (TABLA) */}
        <div className="overflow-x-auto flex-1 bg-base-100 relative">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-base-100/80 z-10">
               <span className="loading loading-spinner loading-lg text-primary"></span>
             </div>
          ) : (
            <table className="table table-zebra w-full whitespace-nowrap">
            <thead>
              <tr className="bg-base-200/50">
                {activeTab === "requests" && <><th>Fecha</th><th>Usuario</th><th>Estado</th><th className="text-right">Acción</th></>}
                {activeTab === "users" && <><th>Usuario</th><th>Rol</th><th>Stats</th><th className="text-right">Acciones</th></>}
                {activeTab === "collections" && <><th>Título</th><th>Dueño</th><th>Items</th><th className="text-right">Acciones</th></>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-base-200/50 transition-colors">
                  
                  {/* --- VISTA DE SOLICITUDES --- */}
                  {activeTab === "requests" && (
                    <>
                      <td className="text-xs opacity-50">{item.date}</td>
                      <td className="font-bold text-primary">{item.email}</td>
                      <td>
                        {item.status === 'pending' ? (
                          <div className="badge badge-warning gap-1 badge-sm">Pendiente</div>
                        ) : (
                          <div className="badge badge-success gap-1 badge-sm">Resuelto</div>
                        )}
                      </td>
                      <td className="text-right">
                        {item.status === 'pending' ? (
                          <button 
                            onClick={() => handleGenerateCode(item.id, item.email)}
                            className="btn btn-sm btn-primary"
                          >
                            Generar Código
                          </button>
                        ) : (
                           <span className="text-xs text-success font-mono">
                             {item.codeGenerated || "ENVIADO"}
                           </span>
                        )}
                      </td>
                    </>
                  )}

                  {/* --- VISTA DE USUARIOS --- */}
                  {activeTab === "users" && (
                    <>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-8">
                              <span className="text-xs">{item.username?.[0]}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{item.username}</div>
                            <div className="text-xs opacity-50">{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-ghost badge-sm">{item.role}</span></td>
                     <td className="text-xs opacity-70">ID: {item.id ? item.id.toString().slice(-4) : 'N/A'}</td>
                      <td className="text-right flex justify-end gap-2">
                         <button 
                           onClick={() => openUserCollections(item)}
                           className="btn btn-ghost btn-xs gap-1 text-primary tooltip tooltip-left"
                           data-tip="Ver sus colecciones"
                         >
                           <FolderOpen size={16} /> <span className="hidden sm:inline">Colecciones</span>
                         </button>
                         <button 
                           onClick={() => handleDelete(item.id)}
                           className="btn btn-ghost btn-xs text-error"
                         >
                           <Trash2 size={16} />
                         </button>
                      </td>
                    </>
                  )}

                  {/* --- VISTA DE COLECCIONES GLOBAL --- */}
                  {activeTab === "collections" && (
                    <>
                      <td className="font-bold">{item.title}</td>
                      <td>
                        <div className="flex items-center gap-2 text-sm">
                           <div className="avatar w-5 h-5 rounded-full bg-base-300">
                             <img src={item.owner?.avatar} className="rounded-full" alt=""/>
                           </div>
                           {item.owner?.username}
                        </div>
                      </td>
                      <td>{item.items?.length || 0} items</td>
                      <td className="text-right">
                        <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-error">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* --- MODAL DE COLECCIONES DE USUARIO --- */}
      <dialog id="modal_user_collections" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box w-11/12 max-w-3xl bg-base-100">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg flex items-center gap-2">
                <FolderOpen className="text-primary"/> 
                Colecciones de <span className="text-primary">{selectedUser?.username}</span>
             </h3>
             <form method="dialog">
               <button className="btn btn-sm btn-circle btn-ghost">✕</button>
             </form>
          </div>
          
          <div className="min-h-[200px]">
            {loadingModal ? (
               <div className="flex justify-center items-center h-32">
                 <span className="loading loading-spinner text-primary"></span>
               </div>
            ) : userCollections.length === 0 ? (
               <div className="text-center py-10 opacity-50">Este usuario no tiene colecciones.</div>
            ) : (
               <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Items</th>
                      <th>Privacidad</th>
                      <th className="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCollections.map(col => (
                      <tr key={col._id}>
                        <td className="font-bold">{col.title}</td>
                        <td>{col.items?.length || 0}</td>
                        <td>{col.isPublic ? "Pública" : "Privada"}</td>
                        <td className="text-right">
                          <button 
                            onClick={() => handleDelete(col._id, true)}
                            className="btn btn-xs btn-error btn-outline"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            )}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cerrar</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
           <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

// Componente pequeño para los botones de las tabs
const TabButton = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`relative h-14 flex items-center justify-center gap-2 font-medium transition-all duration-200 border-b-2 
      ${active 
        ? "border-primary text-primary bg-primary/5" 
        : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200"
      }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    {badge > 0 && (
      <span className="badge badge-xs badge-error absolute top-3 right-3 sm:relative sm:top-0 sm:right-0">
        {badge}
      </span>
    )}
  </button>
);

export default AdminDashboard;