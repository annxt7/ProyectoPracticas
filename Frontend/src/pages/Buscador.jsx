import React from 'react';
import { Search } from 'lucide-react';

const Explorer = () => {
  return (
    <div className="min-h-screen bg-base-100 p-4">
      {/* Barra de Búsqueda */}
      <div className="form-control w-full mb-6 relative">
        <input 
          type="text" 
          placeholder="Buscar colecciones, usuarios..." 
          className="input input-bordered w-full pl-10 rounded-full bg-base-200 border-none focus:ring-2 ring-primary" 
        />
        <Search className="absolute left-3 top-3 text-base-content/50" size={20} />
      </div>

      {/* Grid de Exploración */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card bg-base-100 shadow-md border border-base-200">
            <figure className="h-32 bg-neutral-content w-full relative">
                 {/* Placeholder visual */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </figure>
            <div className="card-body p-3">
              <h3 className="font-bold text-sm">Sci-Fi Classics</h3>
              <div className="flex items-center gap-2 text-xs opacity-70">
                <div className="avatar w-4 h-4 rounded-full bg-primary"></div>
                <span>Usuario_{i}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explorer;