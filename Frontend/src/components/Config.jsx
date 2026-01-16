import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Info, LogOut, Heart, Users, Coffee, Lock, CheckCircle2, AlertCircle, Settings, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SettingsModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Estados para Cambio de Contraseña
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.next
      });
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setPasswords({ current: '', next: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al actualizar contraseña' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#121212] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* CABECERA */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="text-primary" size={24} /> Ajustes
            </h2>
            <p className="text-[10px] opacity-40 uppercase tracking-[0.2em] mt-1 font-bold">Tribe Platform v1.0.2</p>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-transparent to-black/20">
          
          {/* SECCIÓN: SEGURIDAD (CAMBIAR CONTRASEÑA) */}
          <div className="collapse bg-white/5 rounded-3xl group transition-all border border-white/5">
            <input type="checkbox" /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Lock className="text-emerald-400" size={20} /> Cambiar contraseña
            </div>
            <div className="collapse-content px-5 pb-5">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <p className="text-[11px] opacity-60 mb-2">Para cambiar tu contraseña, introduce la actual y la nueva que deseas utilizar.</p>
                <input 
                  type="password" 
                  placeholder="Contraseña actual" 
                  className="input input-bordered w-full bg-black/20 text-xs rounded-2xl h-12 focus:border-primary"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Nueva contraseña" 
                  className="input input-bordered w-full bg-black/20 text-xs rounded-2xl h-12 focus:border-primary"
                  value={passwords.next}
                  onChange={(e) => setPasswords({...passwords, next: e.target.value})}
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary btn-block rounded-2xl font-bold text-xs uppercase tracking-widest h-12"
                >
                  {loading ? <span className="loading loading-spinner" /> : 'Actualizar clave'}
                </button>

                {message.text && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* SECCIÓN: SOBRE NOSOTROS */}
        <div className="collapse bg-white/5 rounded-3xl group transition-all border border-white/5">
        <input type="checkbox" /> 
        <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
        <Users className="text-blue-400" size={20} /> Sobre Nosotros
      </div>
      <div className="collapse-content text-[11px] opacity-70 leading-relaxed px-5 pb-5">
      <div className="space-y-4">
      <p>
        <strong className="text-white">Tribe</strong> nació con una misión clara: organizar el caos digital. En un mundo saturado de información, creemos que el valor reside en la selección, no en la acumulación.
      </p>
      
      <div className="grid grid-cols-2 gap-3 py-2">
        <div className="p-3 rounded-2xl bg-white/0.03 border border-white/5">
          <h5 className="text-[10px] font-bold text-white uppercase mb-1">La Visión</h5>
          <p className="text-[10px] leading-tight opacity-50">Crear el catálogo definitivo de tus pasiones, desde música hasta cine.</p>
        </div>
        <div className="p-3 rounded-2xl bg-white/0.03 border border-white/5">
          <h5 className="text-[10px] font-bold text-white uppercase mb-1">La Comunidad</h5>
          <p className="text-[10px] leading-tight opacity-50">Conectar a personas a través de lo que aman, sin algoritmos invasivos.</p>
        </div>
      </div>

      <p>
        Somos un equipo apasionado por el diseño y la funcionalidad que cree en el poder de la <span className="text-white">curación personal</span>. Tribe no es solo una herramienta, es un manifiesto contra el desorden: <span className="italic">Tu tribu, tus gustos, tu espacio.</span>
      </p>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest opacity-40">Versión 1.0.0 "Beta"</span>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          
        </div>
      </div>
    </div>
  </div>
</div>

          {/* SECCIÓN: APOYANOS */}
<div className="collapse bg-white/5 rounded-3xl group transition-all border border-white/5">
  <input type="checkbox" /> 
  <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
    <Heart className="text-rose-500" size={20} /> Apóyanos
  </div>
  <div className="collapse-content px-5 pb-5 space-y-5">
    <div className="space-y-2">
      <p className="text-[11px] opacity-70 leading-relaxed">
        Tribe es un proyecto independiente y <span className="text-white font-medium">libre de publicidad invasiva</span>. 
        Mantener los servidores y desarrollar nuevas funciones requiere recursos y mucho café.
      </p>
    </div>

    {/* Opciones de apoyo visuales */}
    <div className="grid grid-cols-1 gap-2">
      <button className="btn btn-ghost bg-white/5 btn-block rounded-2xl h-auto py-3 flex-col gap-1 hover:bg-rose-500/10 hover:text-rose-400 transition-all border-none group/btn">
        <div className="flex items-center gap-2 font-bold text-xs">
          <Coffee size={18} className="text-amber-500 group-hover/btn:animate-bounce" /> 
          Invitarnos a un café
        </div>
        <span className="text-[9px] opacity-40 font-normal">Aportación única de 3€</span>
      </button>

      <button className="btn btn-ghost bg-white/5 btn-block rounded-2xl h-auto py-3 flex-col gap-1 hover:bg-blue-500/10 hover:text-blue-400 transition-all border-none group/btn">
        <div className="flex items-center gap-2 font-bold text-xs">
          <Zap size={18} className="text-blue-400" /> 
          Tribe Premium (Próximamente)
        </div>
        <span className="text-[9px] opacity-40 font-normal">Funciones exclusivas y emblema especial</span>
      </button>
    </div>

    <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
      <p className="text-[10px] text-emerald-400 font-medium italic">
        "Cada pequeña ayuda nos permite seguir construyendo este espacio para ti."
      </p>
    </div>
  </div>
</div>
          {/* TÉRMINOS DE SERVICIO (RECOPILADO) */}
          <div className="collapse bg-white/5 rounded-3xl group transition-all border border-white/5">
            <input type="checkbox" /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <FileText className="text-amber-400" size={20} /> Términos de Servicio
            </div>
            <div className="collapse-content text-[11px] opacity-60 leading-relaxed px-5 pb-5">
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                <section>
                  <h4 className="font-bold text-white mb-1 uppercase text-[10px]">1. Aceptación de los Términos</h4>
                  <p>Al acceder o utilizar la plataforma Tribe, usted acepta quedar vinculado por estos términos y condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al servicio.</p>
                </section>
                <section>
                  <h4 className="font-bold text-white mb-1 uppercase text-[10px]">2. Propiedad Intelectual</h4>
                  <p>Tribe otorga una licencia personal, no transferible y limitada para usar la plataforma exclusivamente para fines personales no comerciales.</p>
                </section>
                <section>
                  <h4 className="font-bold text-white mb-1 uppercase text-[10px]">3. Responsabilidad</h4>
                  <p>El usuario es el único responsable del contenido cargado en sus colecciones. Tribe no se hace responsable por infracciones de copyright cometidas por terceros.</p>
                </section>
              </div>
            </div>
          </div>

          {/* POLÍTICA DE PRIVACIDAD (RECOPILADO) */}
      <div className="collapse bg-white/5 rounded-3xl group transition-all border border-white/5">
      <input type="checkbox" /> 
      <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
      <ShieldCheck className="text-emerald-400" size={20} /> Política de Privacidad
      </div>
      <div className="collapse-content text-[11px] opacity-60 leading-relaxed px-5 pb-5">
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
      
      <section>
        <h4 className="font-bold text-white mb-1 uppercase text-[10px]">1. Recopilación de Información</h4>
        <p>Recopilamos su nombre de usuario, email, imágenes de perfil y datos de actividad con el único fin de gestionar su identidad dentro de la plataforma y garantizar una experiencia personalizada.</p>
      </section>

      <section>
        <h4 className="font-bold text-white mb-1 uppercase text-[10px]">2. Almacenamiento y Seguridad</h4>
        <p>Tus datos son cifrados mediante protocolos TLS/SSL. Las contraseñas se almacenan utilizando algoritmos de hash de un solo sentido (bcrypt), lo que significa que nadie, ni siquiera los administradores, puede ver tu clave real.</p>
      </section>

      <section>
        <h4 className="font-bold text-white mb-1 uppercase text-[10px]">3. Uso de Cookies</h4>
        <p>Utilizamos cookies técnicas esenciales y tokens JWT para mantener tu sesión activa. No utilizamos cookies de rastreo publicitario de terceros.</p>
      </section>

      <section>
        <h4 className="font-bold text-white mb-1 uppercase text-[10px]">4. Derechos del Usuario</h4>
        <p>De acuerdo con el RGPD, tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento desde los ajustes de tu perfil o enviando una solicitud a soporte.</p>
      </section>

      <section>
        <h4 className="font-bold text-white mb-1 uppercase text-[10px]">5. Retención de Datos</h4>
        <p>Conservaremos tu información mientras tu cuenta esté activa. Si decides darte de baja, tus datos personales serán eliminados de forma permanente de nuestros servidores en un plazo máximo de 30 días.</p>
        </section>

        <section>
        <h4 className="font-bold text-white mb-1 uppercase text-[10px]">6. Terceros</h4>
        <p>No vendemos ni alquilamos tus datos. Solo compartimos información mínima necesaria con proveedores de servicios críticos (como almacenamiento en la nube o autenticación de Google) que cumplen con altos estándares de privacidad.</p>
      </section>

      </div>
    </div>
</div>

          {/* BOTÓN CERRAR SESIÓN */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full p-5 rounded-3xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all group mt-6"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </div>

        <div className="p-6 bg-black/40 text-center">
          <p className="text-[9px] opacity-20 uppercase tracking-[0.3em] font-bold italic">Design by Tribe Team • 2026</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;