import React from 'react';
import { X, ShieldCheck, FileText, Info, LogOut, Heart, Users, Coffee, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
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
          
          {/* SOBRE NOSOTROS */}
          <div className="collapse bg-white/5 rounded-3xl group transition-all border border-white/5">
            <input type="checkbox" /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Users className="text-blue-400" size={20} /> Sobre Nosotros
            </div>
            <div className="collapse-content text-xs opacity-70 leading-relaxed px-5 pb-5">
              <div className="space-y-3">
                <p>Tribe nació de una idea simple: la necesidad de organizar el caos digital. En un mundo lleno de capturas de pantalla perdidas y enlaces olvidados, decidimos crear un refugio para tus intereses.</p>
                <p>Somos un equipo pequeño de apasionados por el diseño y la tecnología que cree en el poder de la curación personal. Nuestra misión es darte las herramientas para que tu "yo digital" esté tan bien decorado como tu habitación.</p>
                <div className="pt-2 italic text-primary font-medium text-[10px]">"Tu tribu, tus gustos, tu espacio."</div>
              </div>
            </div>
          </div>

          {/* APOYANOS */}
          <div className="collapse bg-white/5 rounded-3xl group transition-all border border-white/5">
            <input type="checkbox" /> 
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Heart className="text-rose-500" size={20} /> Apóyanos
            </div>
            <div className="collapse-content text-xs opacity-70 leading-relaxed px-5 pb-5">
              <div className="space-y-4">
                <p>Mantener Tribe libre de anuncios invasivos y funcionando a máxima velocidad requiere recursos de servidor y muchas noches sin dormir (y mucho café).</p>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <p className="font-bold text-white tracking-wide uppercase text-[9px]">¿Cómo puedes ayudar?</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li>Comparte tus colecciones en redes sociales.</li>
                    <li>Invita a tus amigos a crear su propia Tribu.</li>
                    <li>Envíanos feedback para seguir mejorando.</li>
                  </ul>
                </div>
                <button className="btn btn-primary btn-block rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20">
                  <Coffee size={16} /> Invitarnos a un café
                </button>
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
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                <section>
                  <h4 className="font-bold text-white mb-1 uppercase text-[10px]">1. Recopilación de Información</h4>
                  <p>Recopilamos su nombre de usuario, email e imágenes de perfil con el único fin de gestionar su identidad dentro de la plataforma y garantizar una experiencia personalizada.</p>
                </section>
                <section>
                  <h4 className="font-bold text-white mb-1 uppercase text-[10px]">2. Almacenamiento Seguro</h4>
                  <p>Tus datos son cifrados en tránsito y en reposo mediante protocolos de seguridad estándar de la industria. No compartimos datos personales con terceros externos.</p>
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
            <span className="font-black text-xs uppercase tracking-widest">Finalizar Sesión</span>
          </button>
        </div>

        {/* PIE DE PÁGINA DEL MODAL */}
        <div className="p-6 bg-black/40 text-center">
          <p className="text-[9px] opacity-20 uppercase tracking-[0.3em] font-bold">
            Hecho con ❤️ para la comunidad
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;