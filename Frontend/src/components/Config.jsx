import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  FileText,
  LogOut,
  Heart,
  Users,
  Coffee,
  Lock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Zap,
  Palette,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const SettingsModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const availableThemes = [
    { id: "light", name: "Claro", bg: "bg-[#ffffff]", primary: "bg-[#3b82f6]" },
    { id: "dark", name: "Oscuro", bg: "bg-[#1d232a]", primary: "bg-[#661ae6]" },
    {
      id: "hawaii",
      name: "Hawaii",
      bg: "bg-[#f8f9f1]",
      primary: "bg-[#ffb703]",
    },
    { id: 'royal-wine', name: 'Royal Wine', bg: 'bg-[#1a0a0a]', primary: 'bg-[#00ffff]' },
    {
      id: "pinky",
      name: "Rosa Pastel",
      bg: "bg-[#FFF1F7]",
      primary: "bg-[#F4A3C4]",
    },
    {
      id: "midnight-rose",
      name: "Midnight Rose",
      bg: "bg-[#1A141C]", // base-100 oscuro
      primary: "bg-[#E07AAE]", // rosa elegante
    },
    {
      id: "mocha-night",
      name: "Mocha Night",
      bg: "bg-[#1C1612]", // café oscuro
      primary: "bg-[#E6C48A]", // crema mocha
    },
    {
  id: 'lavender-dream',
  name: 'Lavender Dream',
  bg: 'bg-[#EDE6F8]',       // fondo lavanda más morado visible
  primary: 'bg-[#C4A1E8]'    // morado pastel más marcado
}
,
    {
      id: "sandstone",
      name: "Sandstone",
      bg: "bg-[#FAF6F0]",
      primary: "bg-[#C4A484]",
    },
    {
  id: 'natura',
  name: 'Natura',
  bg: 'bg-[#F3FAF3]',       // verde muy suave de fondo
  primary: 'bg-[#A7D7A7]'    // verde hoja pastel
}
,
{ id: 'natura-dark', name: 'Natura Dark', bg: 'bg-[#1a241a]', primary: 'bg-[#70c070]' },
   
   { id: 'orange', name: 'Orange', bg: 'bg-[#ffffff]', primary: 'bg-[#ff7b00]' },
   { id: 'mundi-deep', name: 'Terra Mundi', bg: 'bg-[#1a1412]', primary: 'bg-[#e2725b]' },
   { id: 'galactic-purple', name: 'Galactic Deep', bg: 'bg-[#120122]', primary: 'bg-[#00f5ff]' },
   { 
  id: 'coral-vibrant-light', 
  name: 'Coral Electric Blue', 
  bg: 'bg-blue-50', // Fondo azul muy claro
  primary: 'bg-orange-500' // Representación del Coral
},
   
  ];

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next) return;
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/users/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setMessage({
        type: "success",
        text: "Contraseña actualizada correctamente",
      });
      setPasswords({ current: "", next: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al actualizar contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-base-100 text-base-content border border-base-300 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* CABECERA */}
        <div className="p-8 border-b border-base-200 flex items-center justify-between bg-base-200/30">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="text-primary" size={24} /> Ajustes
            </h2>
            <p className="text-[10px] opacity-40 uppercase tracking-[0.2em] mt-1 font-bold">
              Tribe Platform v1.0.2
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-circle btn-ghost hover:bg-base-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-linear-to-b from-transparent to-base-200/20">
          {/* SECCIÓN: PERSONALIZACIÓN */}
          <div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Palette className="text-secondary" size={20} /> Personalización
            </div>
            <div className="collapse-content px-5 pb-5">
              <div className="grid grid-cols-3 gap-3 pt-2">
                {availableThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      theme === t.id
                        ? "border-primary bg-primary/10"
                        : "border-base-300 bg-base-100 hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-full h-10 rounded-lg ${t.bg} border border-base-300 overflow-hidden relative shadow-sm`}
                    >
                      <div
                        className={`absolute top-0 left-0 w-1/3 h-full ${t.primary} opacity-80`}
                      ></div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                      {t.name}
                    </span>
                    {theme === t.id && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-content p-0.5 rounded-full shadow-md">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN: SEGURIDAD */}
          <div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
            <input type="checkbox" />
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Lock className="text-success" size={20} /> Seguridad
            </div>
            <div className="collapse-content px-5 pb-5">
              <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  className="input input-bordered w-full bg-base-100 text-xs rounded-2xl h-12 focus:border-primary"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  className="input input-bordered w-full bg-base-100 text-xs rounded-2xl h-12 focus:border-primary"
                  value={passwords.next}
                  onChange={(e) =>
                    setPasswords({ ...passwords, next: e.target.value })
                  }
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block rounded-2xl font-bold text-xs uppercase tracking-widest h-12"
                >
                  {loading ? (
                    <span className="loading loading-spinner" />
                  ) : (
                    "Actualizar clave"
                  )}
                </button>
                {message.text && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider ${message.type === "success" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {message.text}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* SECCIÓN: SOBRE NOSOTROS */}
          <div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
            <input type="checkbox" />
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Users className="text-info" size={20} /> Sobre Nosotros
            </div>
            <div className="collapse-content px-5 pb-5 text-[11px] opacity-70 leading-relaxed">
              <p className="mb-4">
                <strong className="text-base-content">Tribe</strong> nació con
                una misión clara: organizar el caos digital. Creemos que el
                valor reside en la selección.
              </p>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="p-3 rounded-2xl bg-base-100 border border-base-300">
                  <h5 className="text-[10px] font-bold uppercase mb-1">
                    La Visión
                  </h5>
                  <p className="text-[9px] opacity-50">
                    Tu catálogo de pasiones.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-base-100 border border-base-300">
                  <h5 className="text-[10px] font-bold uppercase mb-1">
                    Comunidad
                  </h5>
                  <p className="text-[9px] opacity-50">
                    Conexión real sin algoritmos.
                  </p>
                </div>
              </div>
            </div>
          </div>

         {/* SECCIÓN: APOYANOS */}
<div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
  <input type="checkbox" />
  <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
    <Heart className="text-error" size={20} /> Apóyanos
  </div>
  <div className="collapse-content px-5 pb-5 space-y-3">
    <button 
      onClick={() => window.open('https://www.youtube.com/watch?v=qOEqNu4RBaY', '_blank')}
      className="btn btn-ghost bg-base-100 btn-block rounded-2xl h-auto py-3 flex-col gap-1 hover:bg-error/10 hover:text-error border-none group transition-all"
    >
      <div className="flex items-center gap-2 font-bold text-xs">
        <Coffee
          size={18}
          className="text-warning group-hover:animate-bounce"
        />{" "}
        Invitarnos a un café
      </div>
      <span className="text-[9px] opacity-40 font-normal">
        Aportación de 3€
      </span>
    </button>
  </div>
</div>

          {/* SECCIÓN: LEGAL */}
<div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
  <input type="checkbox" />
  <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
    <ShieldCheck className="text-primary" size={20} /> Legal
  </div>
  <div className="collapse-content px-5 pb-5 space-y-2">
    <button 
      onClick={() => window.open('https://imgs.search.brave.com/xVMHxrTV-2tYNH7jUDpVdKk3OAlnQrguVTDb_soOGmU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zcnYu/bGF0b3N0YWRvcmEu/Y29tL2Rlc2lnbmFs/bC5kbGwvR3JvdWNo/byUyME1hcnglMjAt/JTIwUHJpbmNpcGlv/cy0taToxNDEzODUy/NjgxNTgxNDEzODUw/O2Q6MjY4MTU4O3c6/MzIyO2g6MzIyO2I6/MDAwMDAwO2hhOjY4/MDc4ZjBiYjEzYTZl/MDIzYjIwZjYwN2Fk/NWMxOTYwLmpwZw', '_blank')}
      className="btn btn-ghost bg-base-100 btn-block rounded-2xl h-auto py-3 justify-start gap-3 hover:bg-primary/10 border-none transition-all"
    >
      <FileText size={16} className="opacity-60" />
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold">Términos y Condiciones</span>
        <span className="text-[9px] opacity-40">Contrato de uso de la plataforma</span>
      </div>
    </button>

    <button 
      onClick={() => window.open('https://imgs.search.brave.com/3VlCN-EjLPkHnx_jMxi1l6UHLpogW60SFzCR73F29xE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjFHcFJkc2hLQ0wu/anBn', '_blank')}
      className="btn btn-ghost bg-base-100 btn-block rounded-2xl h-auto py-3 justify-start gap-3 hover:bg-primary/10 border-none transition-all"
    >
      <Lock size={16} className="opacity-60" />
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold">Política de Privacidad</span>
        <span className="text-[9px] opacity-40">Cómo protegemos tus datos</span>
      </div>
    </button>
  </div>
</div>

          {/* BOTÓN CERRAR SESIÓN */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full p-5 rounded-3xl bg-error/10 hover:bg-error/20 text-error transition-all group mt-6"
          >
            <LogOut
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span className="font-black text-xs uppercase tracking-widest">
              Cerrar Sesión
            </span>
          </button>
        </div>

        <div className="p-6 bg-base-300/50 text-center">
          <p className="text-[9px] opacity-30 uppercase tracking-[0.3em] font-bold italic">
            Design by Tribe Team • 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
