import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AuthScreen = ({ type = 'login' }) => {
  const isLogin = type === 'login';

  // Imagen de ejemplo para la izquierda (tipo interfaz de app o estilo de vida)
  // Puedes cambiarla por una tuya local o de otro servicio.
  const coverImage = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop";

  return (
    // Contenedor principal: Pantalla completa, flex row para dividir
    <div className="min-h-screen flex w-full bg-base-100">

      {/* SECCIÓN IZQUIERDA - Imagen (Oculta en móviles) */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        {/* Capa oscura para que el texto se lea bien */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Texto sobre la imagen */}
        <div className="relative z-10 p-16 flex flex-col justify-end h-full text-white">
            <h2 className="text-5xl font-bold font-serif mb-4 tracking-tight">Tribe.</h2>
            <p className="text-xl opacity-90 max-w-md leading-relaxed">
              Tu espacio digital curado. Organiza lo que te inspira y conéctate a través de tus colecciones.
            </p>
        </div>
      </div>


      {/* SECCIÓN DERECHA - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        
        {/* Botón "Atrás" flotante para volver a la landing */}
        <Link to="/" className="absolute top-8 left-8 btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-base-content">
            ← Volver al inicio
        </Link>

        <div className="w-full max-w-md space-y-10">
          {/* Cabecera del formulario */}
          <div>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight font-serif">
              {isLogin ? 'Bienvenido de nuevo' : 'Únete a Tribe'}
            </h2>
            <p className="mt-3 text-base text-base-content/70">
              {isLogin 
                ? '' 
                : 'Empieza a crear tus colecciones hoy mismo.'}
            </p>
          </div>

          {/* Formulario */}
          <form className="space-y-6">
            {!isLogin && (
              <div>
                <label className="label text-sm font-bold mb-1">Nombre de usuario</label>
                <input type="text" placeholder="ej. pixel_collector" className="input input-bordered w-full focus:ring-2 ring-primary ring-offset-2 transition-all bg-base-200/50 border-base-300" />
              </div>
            )}
            
            <div>
               <label className="label text-sm font-bold mb-1">Correo electrónico</label>
              <input type="email" placeholder="hola@ejemplo.com" className="input input-bordered w-full focus:ring-2 ring-primary ring-offset-2 transition-all bg-base-200/50 border-base-300" />
            </div>

            <div>
              <div className="flex items-center justify-between">
               <label className="label text-sm font-bold mb-1">Contraseña</label>
               {isLogin && (
                  <Link to="#" className="text-sm font-medium text-primary hover:underline">
                    ¿Olvidaste la contraseña?
                  </Link>
                )}
              </div>
              <input type="password" placeholder="••••••••" className="input input-bordered w-full focus:ring-2 ring-primary ring-offset-2 transition-all bg-base-200/50 border-base-300" />
            </div>

            {/* Botón Principal Moderno */}
            <button className="btn btn-primary w-full text-lg normal-case font-bold rounded-full mt-4 group hover:scale-[1.02] active:scale-[0.98] transition-transform relative overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </span>
            </button>
          </form>
          
          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-base-300"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-base-100 text-base-content/50">O continúa con</span></div>
          </div>

           {/* Botones Sociales (Ejemplo visual) */}
           <div className="grid grid-cols-2 gap-4">
             <button className="btn btn-outline font-medium hover:bg-base-200 hover:border-base-300">Google</button>
             <button className="btn btn-outline font-medium hover:bg-base-200 hover:border-base-300">Apple</button>
           </div>

          {/* Pie de página para cambiar entre Login/Registro */}
          <p className="text-center text-sm text-base-content/70 mt-8">
            {isLogin ? (
              <>¿No tienes cuenta aún?{' '}<Link to="/register" className="font-bold text-primary hover:underline">Regístrate gratis</Link></>
            ) : (
               <>¿Ya eres miembro?{' '}<Link to="/login" className="font-bold text-primary hover:underline">Inicia sesión</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;