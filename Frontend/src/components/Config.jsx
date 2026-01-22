import React, { useState } from 'react';
import { 
  X, ShieldCheck, FileText, LogOut, Heart, Users, 
  Coffee, Lock, CheckCircle2, AlertCircle, Settings, 
  Zap, Palette 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SettingsModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme(); 
  const navigate = useNavigate();

  // Estados para Cambio de Contraseña
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Listado de temas disponibles
  const availableThemes = [
    { id: 'light', name: 'Claro', bg: 'bg-[#ffffff]', primary: 'bg-[#3b82f6]' },
    { id: 'dark', name: 'Oscuro', bg: 'bg-[#1d232a]', primary: 'bg-[#661ae6]' },
    { id: 'cupcake', name: 'Cupcake', bg: 'bg-[#faf7f5]', primary: 'bg-[#65c3c8]' },
    { id: 'synthwave', name: 'Synthwave', bg: 'bg-[#2d1b69]', primary: 'bg-[#e779c1]' },
    { id: 'retro', name: 'Retro', bg: 'bg-[#ece3ca]', primary: 'bg-[#ef9995]' },
    { id: 'aqua', name: 'Aqua', bg: 'bg-[#0b25b7]', primary: 'bg-[#09ecf3]' },
  ];

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
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <Settings className="text-primary" size={24} /> Ajustes
            </h2>
            <p className="text-[10px] opacity-40 uppercase tracking-[0.2em] mt-1 font-bold">Tribe Platform v1.0.2</p>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost hover:bg-white/10 transition-colors text-white">
            <X size={24} />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-transparent to-black/20">
          
          {/* SECCIÓN: PERSONALIZACIÓN (THEMES) */}
          <div className="collapse collapse-plus bg-white/5 rounded-3xl border border-white/5">
            <input type="checkbox" defaultChecked /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer text-white">
              <Palette className="text-violet-400" size={20} /> Personalización
            </div>
            <div className="collapse-content px-5 pb-5">
              <div className="grid grid-cols-3 gap-3 pt-2">
                {availableThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                      theme === t.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/5 bg-black/40 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-full h-10 rounded-lg ${t.bg} border border-white/10 overflow-hidden relative`}>
                      <div className={`absolute top-0 left-0 w-1/3 h-full ${t.primary} opacity-80`}></div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">{t.name}</span>
                    {theme === t.id && (
                      <div className="absolute -top-1 -right-1 bg-primary text-white p-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN: SEGURIDAD (CAMBIAR CONTRASEÑA) */}
          <div className="collapse collapse-plus bg-white/5 rounded-3xl border border-white/5">
            <input type="checkbox" /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer text-white">
              <Lock className="text-emerald-400" size={20} /> Seguridad
            </div>
            <div className="collapse-content px-5 pb-5">
              <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                <input 
                  type="password" 
                  placeholder="Contraseña actual" 
                  className="input input-bordered w-full bg-black/20 text-xs rounded-2xl h-12 focus:border-primary text-white"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Nueva contraseña" 
                  className="input input-bordered w-full bg-black/20 text-xs rounded-2xl h-12 focus:border-primary text-white"
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
          <div className="collapse collapse-plus bg-white/5 rounded-3xl border border-white/5">
            <input type="checkbox" /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer text-white">
              <Users className="text-blue-400" size={20} /> Sobre Nosotros
            </div>
            <div className="collapse-content px-5 pb-5 text-[11px] opacity-70 leading-relaxed text-white">
              <p className="mb-4">
                <strong className="text-white">Tribe</strong> nació con una misión clara: organizar el caos digital. Creemos que el valor reside en la selección, no en la acumulación.
              </p>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <h5 className="text-[10px] font-bold text-white uppercase mb-1">La Visión</h5>
                  <p className="text-[9px] opacity-50">Tu catálogo definitivo de pasiones.</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <h5 className="text-[10px] font-bold text-white uppercase mb-1">Comunidad</h5>
                  <p className="text-[9px] opacity-50">Conexión real sin algoritmos invasivos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN: APOYANOS */}
          <div className="collapse collapse-plus bg-white/5 rounded-3xl border border-white/5">
            <input type="checkbox" /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer text-white">
              <Heart className="text-rose-500" size={20} /> Apóyanos
            </div>
            <div className="collapse-content px-5 pb-5 space-y-3">
              <p className="text-[11px] opacity-70 text-white">Tribe es un proyecto independiente libre de publicidad.</p>
              <button className="btn btn-ghost bg-white/5 btn-block rounded-2xl h-auto py-3 flex-col gap-1 hover:bg-rose-500/10 hover:text-rose-400 border-none group">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Coffee size={18} className="text-amber-500 group-hover:animate-bounce" /> Invitarnos a un café
                </div>
                <span className="text-[9px] opacity-40 font-normal">Aportación de 3€</span>
              </button>
            </div>
          </div>

          {/* SECCIÓN: LEGAL (TÉRMINOS Y PRIVACIDAD) */}
          <div className="collapse collapse-plus bg-white/5 rounded-3xl border border-white/5">
            <input type="checkbox" /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer text-white">
              <FileText className="text-amber-400" size={20} /> Legal y Privacidad
            </div>
            <div className="collapse-content px-5 pb-5 space-y-4">
              <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar space-y-4 text-[10px] opacity-60 text-white">
                <section>
                  <h4 className="font-bold text-white uppercase mb-1">Privacidad</h4>
                  <p>Tus datos son cifrados mediante protocolos TLS/SSL. Las contraseñas se almacenan mediante bcrypt.</p>
                </section>
                <section>
                  <h4 className="font-bold text-white uppercase mb-1">Términos</h4>
                  <p>Al usar Tribe, aceptas que eres el único responsable del contenido de tus colecciones.</p>
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
          <p className="text-[9px] opacity-20 uppercase tracking-[0.3em] font-bold italic text-white">Design by Tribe Team • 2026</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;