import React, { useState } from 'react';
import { Search, Heart, MessageCircle, Copy, Home, User } from 'lucide-react';
import Logo from '../assets/LogoClaro.png';
import NavLinkDesktop from '../components/NavDesktop.jsx';
import NavLinkMobile from '../components/NavMobile.jsx';

const Explorer = () => {
  const [activeCategory, setActiveCategory] = useState('Para ti');
  const categories = ["Para ti", "Cine", "Vinilos", "Libros", "Retro", "Arte", "Arquitectura"];

  // Generamos datos. 
  // Truco: Usamos 'size' para simular que algunas fotos son más grandes (estilo Instagram)
  const items = Array.from({ length: 24 }).map((_, i) => {
    // Patrón "Instagram": Cada 12 items (índice 2 y 9 aprox) hacemos uno grande
    // Esto es opcional, si quieres todo igual, quita esta lógica isLarge.
    const isLarge = (i % 12 === 2) || (i % 12 === 9); 
    
    return {
      id: i,
      isLarge, 
      likes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 50),
      image: `https://picsum.photos/${isLarge ? 600 : 300}?random=${i + 100}`
    };
  });

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-10 font-sans text-base-content">
      
      {/* =======================
          NAVBAR DE ESCRITORIO
      ======================== */}
      <nav className="hidden md:flex sticky top-0 bg-base-100/90 backdrop-blur-md border-b border-base-200 z-50 px-6 py-3 justify-between items-center">
        <img src={Logo} alt="Tribe Logo" className="h-10 w-auto object-contain" />
        <div className="flex gap-8">
           <NavLinkDesktop icon={<Home size={28} />} page={'/feed'} label="Inicio" />
           <NavLinkDesktop icon={<Search size={28} />} page={'/explorer'} label="Explorar" active />
           <NavLinkDesktop icon={<Heart size={28} />} page={'/feed'} label="Actividad" />
           <NavLinkDesktop icon={<User size={28} />} page={'/profile/me'} label="Perfil" />
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto md:px-6 md:mt-4">
         {/* Móvil: grid-cols-3, gap-0.5 (muy pegado)
            Desktop: grid-cols-4, gap-4 (más aire), bordes redondeados
         */}
         <div className="grid grid-cols-3 md:grid-cols-4 gap-0.5 md:gap-4 auto-rows-[minmax(100px,_auto)]">
            
            {items.map((item) => (
               <div 
                 key={item.id} 
                 className={`
                    relative group cursor-pointer bg-base-200 overflow-hidden
                    ${/* Lógica para hacer cuadrados 2x2 en móvil y desktop */ ''}
                    ${item.isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
                    md:rounded-xl
                 `}
               >
                  <img 
                    src={item.image} 
                    alt="explore" 
                    className="w-full h-full object-cover"
                  />

                  {/* Icono de tipo de contenido (Ej: Si fuera video o colección múltiple) */}
                  {!item.isLarge && (
                     <div className="absolute top-2 right-2 text-white drop-shadow-md md:hidden">
                        <Copy size={16} /> 
                     </div>
                  )}

                  {/* Overlay Hover (Solo Desktop) */}
                  {/* Oscurece la imagen y muestra likes al pasar el ratón */}
                  <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity justify-center items-center gap-6 text-white font-bold">
                     <div className="flex items-center gap-2">
                        <Heart fill="white" size={24} /> <span>{item.likes}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <MessageCircle fill="white" size={24} /> <span>{item.comments}</span>
                     </div>
                  </div>
               </div>
            ))}

         </div>
      </div>

      {/* Loading Spinner al final (Típico de scroll infinito) */}
      <div className="py-8 flex justify-center">
         <span className="loading loading-spinner text-primary opacity-50"></span>
      </div>

      {/* =======================
          MOBILE BOTTOM NAV
      ======================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 px-6 py-3 md:hidden z-50">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          <NavLinkMobile icon={<Home size={24} />} page={'/feed'} />
          <NavLinkMobile icon={<Search size={24} />} page={'/explorer'} active />
          <div className="w-8"></div>
          <NavLinkMobile icon={<Heart size={24} />} page={'/feed'} />
          <div className="cursor-pointer border-2 border-transparent rounded-full p-0.5">
             <div className="w-6 h-6 rounded-full bg-neutral overflow-hidden">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="me" />
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Explorer;