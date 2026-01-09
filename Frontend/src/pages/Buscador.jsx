import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  TrendingUp,
  Hash,
  Sparkles
} from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Petición al Backend con Debounce
  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Detectamos si estamos en local o en tu dominio de producción
      const baseUrl = window.location.hostname === "localhost" 
        ? "http://localhost:3000" 
        : "https://axel.informaticamajada.es";

      const res = await fetch(`${baseUrl}/api/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      // Si el servidor responde con algo que no es JSON (como tu "API funcionando")
      // este check evitará el error de SyntaxError
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("El servidor no devolvió JSON. Revisa la ruta en el Backend.");
      }

      const data = await res.json();
      setUsers(data.users || []);
      setCollections(data.collections || []);
    } catch (err) {
      console.error("Error en la carga:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const timeoutId = setTimeout(fetchData, 300);
  return () => clearTimeout(timeoutId);
}, [query]);

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content bg-base-100">
      <NavDesktop />

      {/* HEADER DE BÚSQUEDA */}
      <div className="sticky top-0 md:top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-white/5 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en Tribe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 focus:ring-2 ring-primary/50 focus:outline-none text-white transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex justify-center gap-8 border-b border-white/5">
            {['cuentas', 'colecciones'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize transition-all relative ${
                  activeTab === tab ? "text-primary" : "text-white/40 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-10">
        
        {/* IZQUIERDA: TENDENCIAS */}
        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={12} /> Tendencias
              </h4>
              <nav className="flex flex-col gap-2">
                {['Música', 'Series', 'Películas', 'Juegos', 'Libros'].map(tag => (
                  <button key={tag} className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 hover:text-primary transition-all group">
                    <Hash size={14} className="opacity-20 group-hover:opacity-100" /> {tag}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* CENTRO: RESULTADOS REALES */}
        <main>
          {loading && <div className="text-center py-4 opacity-50 text-xs">Buscando...</div>}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full ring-2 ring-white/5 bg-white/10">
                          <img 
                          src={user.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                          alt={user.name} 
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} // Segunda capa de seguridad
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-white truncate">{user.name}</h3>
                        <p className="text-[10px] opacity-40 leading-none">{user.handle}</p>
                        <p className="text-xs opacity-60 mt-2 truncate max-w-[140px] italic">
                          {user.bio ? `"${user.bio}"` : ""}
                        </p>
                      </div>
                    </div>
                    <button className={`btn btn-xs rounded-full px-4 ${user.isFollowing ? 'btn-ghost border-white/10' : 'btn-primary'}`}>
                      {user.isFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>
                  </div>
                ))
              ) : !loading && (
                <div className="col-span-full text-center py-20 opacity-20 italic">No hay resultados para tu búsqueda</div>
              )}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.length > 0 ? (
                collections.map((col) => (
                  <div key={col.id} className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all group cursor-pointer">
                    <div className="aspect-video overflow-hidden bg-white/5">
                      <img src={col.cover || 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg">{col.title}</h3>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] opacity-40 uppercase tracking-widest">{col.items} objetos</span>
                        <span className="text-xs font-medium text-primary">{col.author}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : !loading && (
                <div className="col-span-full text-center py-20 opacity-20 italic">No hay colecciones que coincidan</div>
              )}
            </div>
          )}
        </main>

        {/* DERECHA: SUGERENCIAS */}
        <aside className="hidden lg:block">
          <div className="sticky top-48">
            <div className="p-6 rounded-[2rem] bg-gradient-to-b from-primary/10 to-transparent border border-primary/10">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2 text-primary">
                <Sparkles size={12} /> Recomendado
              </h4>
              <p className="text-xs opacity-60 mb-6 leading-relaxed">Descubre nuevas tribus basadas en tus gustos.</p>
            </div>
          </div>
        </aside>

      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;