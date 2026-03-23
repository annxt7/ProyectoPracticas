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
  Palette,
  Languages,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";


const SettingsModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const availableThemes = [
    { id: "light", name: t("themes.light"), bg: "bg-[#ffffff]", primary: "bg-[#3b82f6]" },
    { id: "dark", name: t("themes.dark"), bg: "bg-[#1d232a]", primary: "bg-[#661ae6]" },
    { id: "hawaii", name: t("themes.hawaii"), bg: "bg-[#f8f9f1]", primary: "bg-[#ffb703]" },
    { id: 'royal-wine', name: t("themes.royal-wine"), bg: 'bg-[#1a0a0a]', primary: 'bg-[#00ffff]' },
    { id: "pinky", name: t("themes.pinky"), bg: "bg-[#FFF1F7]", primary: "bg-[#F4A3C4]" },
    { id: "midnight-rose", name: t("themes.midnight-rose"), bg: "bg-[#1A141C]", primary: "bg-[#E07AAE]" },
    { id: "mocha-night", name: t("themes.mocha-night"), bg: "bg-[#1C1612]", primary: "bg-[#E6C48A]" },
    { id: 'lavender-dream', name: t("themes.lavender-dream"), bg: 'bg-[#EDE6F8]', primary: 'bg-[#C4A1E8]' },
    { id: "sandstone", name: t("themes.sandstone"), bg: "bg-[#FAF6F0]", primary: "bg-[#C4A484]" },
    { id: 'natura', name: t("themes.natura"), bg: 'bg-[#F3FAF3]', primary: 'bg-[#A7D7A7]' },
    { id: 'natura-dark', name: t("themes.natura-dark"), bg: 'bg-[#1a241a]', primary: 'bg-[#70c070]' },
    { id: 'orange', name: t("themes.orange"), bg: 'bg-[#ffffff]', primary: 'bg-[#ff7b00]' },
    { id: 'mundi-deep', name: t("themes.terra-mundi"), bg: 'bg-[#1a1412]', primary: 'bg-[#e2725b]' },
    { id: 'galactic-purple', name: t("themes.galactic"), bg: 'bg-[#120122]', primary: 'bg-[#00f5ff]' },
    { id: 'coral-vibrant-light', name: t("themes.coral"), bg: 'bg-[#00b4d8]', primary: 'bg-[#ff5e57]' },
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
      setMessage({ type: "success", text: t("settings.password_success") });
      setPasswords({ current: "", next: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || t("settings.password_error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-base-100 text-base-content border border-base-300 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-base-200 flex items-center justify-between bg-base-200/30">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="text-primary" size={24} /> {t("settings.title")}
            </h2>
            <p className="text-[10px] opacity-40 uppercase tracking-[0.2em] mt-1 font-bold">{t("settings.version")}</p>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost hover:bg-base-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-linear-to-b from-transparent to-base-200/20">
          

          {/* 2. PERSONALIZACIÓN */}
          <div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
            <input type="checkbox" />
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Palette className="text-secondary" size={20} /> {t("settings.appearance")}
            </div>
            <div className="collapse-content px-5 pb-5">
              <div className="grid grid-cols-3 gap-3 pt-2">
                {availableThemes.map((t_theme) => (
                  <button
                    key={t_theme.id}
                    onClick={() => setTheme(t_theme.id)}
                    className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${theme === t_theme.id ? "border-primary bg-primary/10" : "border-base-300 bg-base-100"}`}
                  >
                    <div className={`w-full h-10 rounded-lg ${t_theme.bg} border border-base-300 overflow-hidden relative shadow-sm`}>
                      <div className={`absolute top-0 left-0 w-1/3 h-full ${t_theme.primary} opacity-80`}></div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{t_theme.name}</span>
                    {theme === t_theme.id && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-content p-0.5 rounded-full shadow-md">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. SEGURIDAD */}
          <div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
            <input type="checkbox" />
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Lock className="text-success" size={20} /> {t("settings.security")}
            </div>
            <div className="collapse-content px-5 pb-5">
              <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                <input
                  type="password"
                  placeholder={t("settings.current_pass")}
                  className="input input-bordered w-full bg-base-100 text-xs rounded-2xl h-12"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder={t("settings.new_pass")}
                  className="input input-bordered w-full bg-base-100 text-xs rounded-2xl h-12"
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  required
                />
                <button type="submit" disabled={loading} className="btn btn-primary btn-block rounded-2xl font-bold text-xs uppercase tracking-widest h-12">
                  {loading ? <span className="loading loading-spinner" /> : t("settings.btn_update_pass")}
                </button>
                {message.text && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider ${message.type === "success" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                    {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* 4. SOBRE NOSOTROS */}
          <div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
            <input type="checkbox" />
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Users className="text-info" size={20} /> {t("settings.about")}
            </div>
            <div className="collapse-content px-5 pb-5 text-[11px] opacity-70 leading-relaxed">
              <p className="mb-4">{t("settings.about_desc")}</p>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="p-3 rounded-2xl bg-base-100 border border-base-300">
                  <h5 className="text-[10px] font-bold uppercase mb-1">{t("settings.vision_title")}</h5>
                  <p className="text-[9px] opacity-50">{t("settings.vision_text")}</p>
                </div>
                <div className="p-3 rounded-2xl bg-base-100 border border-base-300">
                  <h5 className="text-[10px] font-bold uppercase mb-1">{t("settings.community_title")}</h5>
                  <p className="text-[9px] opacity-50">{t("settings.community_text")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. APOYANOS */}
          <div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
            <input type="checkbox" />
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <Heart className="text-error" size={20} /> {t("settings.support")}
            </div>
            <div className="collapse-content px-5 pb-5 space-y-3">
              <button onClick={() => window.open('https://www.youtube.com/watch?v=qOEqNu4RBaY', '_blank')} className="btn btn-ghost bg-base-100 btn-block rounded-2xl h-auto py-3 flex-col gap-1 hover:bg-error/10 border-none transition-all group">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Coffee size={18} className="text-warning group-hover:animate-bounce" /> {t("settings.coffee")}
                </div>
                <span className="text-[9px] opacity-40 font-normal">{t("settings.coffee_price")}</span>
              </button>
            </div>
          </div>

          {/* 6. LEGAL */}
          <div className="collapse collapse-plus bg-base-200/50 rounded-3xl border border-base-300">
            <input type="checkbox" />
            <div className="collapse-title flex items-center gap-4 p-5 font-bold text-sm cursor-pointer">
              <ShieldCheck className="text-primary" size={20} /> {t("settings.legal")}
            </div>
            <div className="collapse-content px-5 pb-5 space-y-2">
              <button onClick={() => window.open('/privacy', '_blank')} className="btn btn-ghost bg-base-100 btn-block rounded-2xl h-auto py-3 justify-start gap-3 border-none">
                <FileText size={16} className="opacity-60" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-bold">{t("settings.terms")}</span>
                  <span className="text-[9px] opacity-40">{t("settings.terms_desc")}</span>
                </div>
              </button>
            </div>
          </div>

                {/* SECCIÓN: IDIOMA (AHORA AL FINAL Y SIN COLLAPSE PARA FORZAR VISIBILIDAD) */}
          <div className="bg-base-200/50 rounded-3xl border border-base-300 p-5 mt-4">
            <div className="flex items-center gap-4 mb-4 font-bold text-sm">
              <Languages className="text-primary" size={20} /> {t("settings.language")}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => i18n.changeLanguage('es')}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 transition-all 
                  ${i18n.language.startsWith('es') 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-base-300 bg-base-100'}`}
              >
                Español
              </button>
              <button 
                onClick={() => i18n.changeLanguage('en')}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 transition-all 
                  ${i18n.language.startsWith('en') 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-base-300 bg-base-100'}`}
              >
                English
              </button>
              <button 
                onClick={() => i18n.changeLanguage('jp')}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 transition-all 
                  ${i18n.language.startsWith('jp') 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-base-300 bg-base-100'}`}
              >
                日本語
              </button>
            </div>
          </div>
          
          {/* CERRAR SESIÓN */}
          <button onClick={handleLogout} className="flex items-center gap-4 w-full p-5 rounded-3xl bg-error/10 hover:bg-error/20 text-error transition-all group mt-6">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">{t("settings.logout")}</span>
          </button>
        </div>

        <div className="p-6 bg-base-300/50 text-center">
          <p className="text-[9px] opacity-30 uppercase tracking-[0.3em] font-bold italic">{t("settings.footer")}</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;