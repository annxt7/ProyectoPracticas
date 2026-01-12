import React, { useState, useEffect } from "react";
import { Search, X, TrendingUp, Hash, Sparkles } from "lucide-react";
import NavMobile from "../components/NavMobile";
import NavDesktop from "../components/NavDesktop";
import { Link } from "react-router-dom";
import ItemCover from "../components/ItemCover";

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cuentas");
  const [usersWithoutMyself, setUsersWithoutMyself] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  // FUNCIÓN PARA EXTRAER EL ID DEL TOKEN (JWT)
  const getMyIdFromToken = () => {
    try {
      const token = localStorage.getItem('tribe_token')?.replace(/['"]+/g, '');
      if (!token) return null;
      
      // El JWT tiene 3 partes separadas por puntos. La segunda parte tiene los datos.
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Buscamos el ID en los campos más comunes: id, userId, o user_id
      return String(payload.id || payload.userId || payload.user_id || "").trim();
    } catch (e) {
      console.error("Error al leer el token:", e);
      return null;
    }
  };

  const myId = getMyIdFromToken();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = window.location.hostname === "localhost" 
          ? "http://localhost:3000" 
          : "https://axel.informaticamajada.es";

        const token = localStorage.getItem('tribe_token')?.replace(/['"]+/g, '');

        const res = await fetch(`${baseUrl}/api/search?query=${encodeURIComponent(query)}`, {
          headers: { 
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();
        const allUsers = Array.isArray(data.users) ? data.users : [];
        
        // El servidor también puede decirnos quién somos en data.currentUserId
        const currentMe = String(myId || data.currentUserId || "").trim();

        // FILTRADO ROBUSTO
        const filtered = allUsers.filter(u => {
          const uId = String(u.id || u.user_id || "").trim();
          return uId !== currentMe;
        });

        setUsersWithoutMyself(filtered);
        setCollections(Array.isArray(data.collections) ? data.collections : []);
      } catch (err) {
        console.error("Error en search:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [query, myId]);

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
          </div>

          <div className="flex justify-center gap-8 border-b border-white/5">
            {["cuentas", "colecciones"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize transition-all relative ${
                  activeTab === tab ? "text-primary" : "text-white/40 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-10">
        <aside className="hidden lg:block" /> {/* Espaciador izquierdo */}

        <main>
          {loading && <div className="text-center py-4 opacity-50 text-xs">Buscando...</div>}

          {activeTab === "cuentas" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {usersWithoutMyself.map((user) => (
                <Link key={user.id || user.user_id} to={`/profile/${user.id || user.user_id}`} className="block group">
                  <div className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full ring-2 ring-white/5 bg-white/10">
                          <img
                            src={user.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-white truncate">{user.name}</h3>
                        <p className="text-[10px] opacity-40">@{user.handle}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {!loading && usersWithoutMyself.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-20 italic">No hay resultados</div>
              )}
            </div>
          )}

          {activeTab === "colecciones" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.map((col) => (
                <Link key={col.id} to={`/collection/${col.id}`} className="block group">
                  <div className="bg-white/2 border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30">
                    <div className="aspect-video overflow-hidden">
                      <ItemCover src={col.cover} title={col.title} className="w-full h-full" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg">{col.title}</h3>
                      <span className="text-xs font-medium text-primary">{col.author}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      <NavMobile />
    </div>
  );
};

export default Explorer;