<<<<<<< HEAD
import React, { useEffect, useState, useRef } from 'react'; 
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios'
import GoogleSignIn from '../components/GoogleSignIn';
import fotoLogin from '../assets/foto-login.jpg'
import Logo from '../assets/LogoClaro.png'

const SITE_KEY = '6LdZWC0sAAAAAEuorDFJYAuZWVbR_zGL-FTmgHHh';
const API_ENDPOINT = '/api/auth/register'; 

const AuthScreen = ({ type = 'login' }) => {
  const isLogin = type === 'login';
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    identifier: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const recaptchaRef = useRef(null)

  useEffect(() => {
    if (!isLogin && typeof window.grecaptcha !== 'undefined' && recaptchaRef.current) {
      if (recaptchaRef.current.children.length === 0) { 
        try {
          window.grecaptcha.render(recaptchaRef.current, {
            'sitekey': SITE_KEY,
            'theme': 'dark'
          });
        } catch (error) {
          console.error("Error al intentar renderizar reCAPTCHA v2:", error);
        }
      }
    }
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const token = isLogin ? null : e.target['g-recaptcha-response']?.value; 

    if (!isLogin && !token) {
        setError("Por favor, marca la casilla de reCAPTCHA.");
        setLoading(false);
        return;
    }

    try {
        const endpoint = isLogin ? '/api/auth/login' : API_ENDPOINT;
        const response = await axios.post(endpoint, {
            ...formData,
            'g-recaptcha-response': token 
        });
        setSuccess(response.data.message || (isLogin ? '¡Inicio de sesión exitoso!' : '¡Registro exitoso!'));
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setLoading(true);
    setError(null);
    try {
        const response = await axios.post('/api/auth/google', { token: idToken });
        setSuccess(response.data.message || '¡Éxito!');
    } catch (err) {
        setError(err.response?.data?.error || 'Error Google.');
    } finally {
        setLoading(false);
    }
  };

  const coverImage = fotoLogin;

  return (
    <div className="min-h-screen flex w-full bg-base-100">

      {/* SECCIÓN IZQUIERDA */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 p-16 flex flex-col h-full text-white justify-start">
            <img src={Logo} alt="Logo" className="w-30 h-auto mb-4" />
            <p className="text-xl max-w-md font-medium">
              Organiza lo que te inspira y conéctate a través de tus colecciones
            </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-base-content">
            ← Volver al inicio
        </Link>

        <div className="w-full max-w-md space-y-10">
          <div>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight font-serif">
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h2>
            
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}> 
            {!isLogin && (
                <div>
                    <label className="label text-sm font-bold mb-1">Nombre de usuario</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="ej. pixel_collector" className="input input-bordered w-full focus:ring-2 ring-primary ring-offset-2 transition-all bg-base-200/50 border-base-300" />
                </div>
            )}

            {!isLogin && (
                <div>
                    <label className="label text-sm font-bold mb-1">Correo electrónico</label>
                    <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="hola@ejemplo.com" className="input input-bordered w-full focus:ring-2 ring-primary ring-offset-2 transition-all bg-base-200/50 border-base-300" />
                </div>
            )}

            {isLogin && (
                <div>
                  <label className="label text-sm font-bold mb-1">Correo electrónico o Nombre de Usuario</label>
                  <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} placeholder="hola@ejemplo.com" className="input input-bordered w-full focus:ring-2 ring-primary ring-offset-2 transition-all bg-base-200/50 border-base-300" />
                </div>
            )}

            <div>
                <div className="flex items-center justify-between">
                  <label className="label text-sm font-bold mb-1">Contraseña</label>
                  {isLogin && <Link to="#" className="text-sm font-medium text-primary hover:underline">¿Olvidaste la contraseña?</Link>}
                </div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input input-bordered w-full focus:ring-2 ring-primary ring-offset-2 transition-all bg-base-200/50 border-base-300" />
            </div>

            {!isLogin && (
                <div>
                    <label className="label text-sm font-bold mb-1">Repetir contraseña</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input input-bordered w-full focus:ring-2 ring-primary ring-offset-2 transition-all bg-base-200/50 border-base-300" />
                </div>
            )}

            {!isLogin && (
              <div className="flex flex-col items-center justify-center gap-4">
                <div ref={recaptchaRef} data-sitekey={SITE_KEY} data-theme='dark'></div>
              </div>
            )}

            {error && <div className="text-error text-center font-medium pt-2">{error}</div>}
            {success && <div className="text-success text-center font-medium pt-2">{success}</div>}

            <button type="submit" className="btn btn-primary w-full text-lg normal-case font-bold rounded-full group hover:scale-[1.02] active:scale-[0.98] transition-transform relative overflow-hidden" disabled={loading}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'} 
                    {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>}
                </span>
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-base-300"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-base-100 text-base-content/50">O conéctate con</span></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleSignIn onGoogleSuccess={handleGoogleSuccess} isLogin={isLogin} /> 
          </div>

          <p className="text-center text-sm text-base-content/70 mt-8">
            {isLogin ? (
              <>¿No tienes cuenta aún? <Link to="/register" className="font-bold text-primary hover:underline">Regístrate gratis</Link></>
            ) : (
              <>¿Ya eres miembro? <Link to="/login" className="font-bold text-primary hover:underline">Inicia sesión</Link></>
            )}
          </p>
=======
import React, { useState, useRef } from "react";
import {
  Settings,
  Plus,
  UserPlus,
  Grid,
  Bookmark,
  Check,
  MapPin,
  Share2,
  X,
  Camera // Nuevo icono para la foto
} from "lucide-react";
import { Link } from "react-router-dom";
import NavMobile from "../components/NavMobile";  
import NavDesktop from "../components/NavDesktop";

const Profile = ({ isOwnProfile = true }) => {
  const [activeTab, setActiveTab] = useState("collections");
  
  // Estado para la imagen de perfil
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300");
  const fileInputRef = useRef(null); // Referencia para el input invisible

  // Estado para la biografía
  const [description, setDescription] = useState(
    "Cineasta visual y recolectora de vinilos de los 70s. Intentando organizar mi caos visual en pequeñas dosis. ☕️ & 🎬"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const stats = [
    { label: "Colecciones", value: "12" },
    { label: "Seguidores", value: "1.4k" },
    { label: "Siguiendo", value: "342" },
  ];

  // --- LÓGICA DE EDICIÓN DE BIO ---
  const handleStartEditing = () => {
    setNewDescription(description);
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (newDescription.trim()) {
      setDescription(newDescription);
      setIsEditing(false);
    }
  };

  // --- LÓGICA DE CAMBIO DE FOTO ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Creamos una URL temporal para mostrar la imagen seleccionada inmediatamente
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-sans text-base-content">
      <NavDesktop />
      
      <main className="max-w-5xl mx-auto">
        {/* =======================
            HEADER DEL PERFIL
        ======================== */}
        <div className="relative">
          {/* Portada (Banner) */}
          <div className="h-40 md:h-80 w-full bg-gradient-to-r from-gray-200 to-gray-300 overflow-hidden group relative">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
              alt="cover"
              className="w-full h-full object-cover opacity-50"
            />
            {/* Opcional: Botón para cambiar portada también podría ir aquí */}
          </div>

          {/* Info del Usuario */}
          <div className="px-6 relative">
            
            {/* Fila Avatar y Botones */}
            <div className="flex justify-between items-end -mt-12 mb-4">
              
              {/* === FOTO DE PERFIL CON CAMBIO === */}
              <div className="relative group">
                <div className="avatar ring-4 ring-base-100 rounded-full bg-base-100 shadow-sm">
                  <div className="w-24 md:w-32 rounded-full overflow-hidden relative">
                    <img
                      src={profileImage}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                    
                    {/* Overlay para subir foto (Solo si es tu perfil) */}
                    {isOwnProfile && (
                      <div 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-[2px]"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <Camera className="text-white drop-shadow-md" size={24} />
                      </div>
                    )}
                  </div>
                </div>
                {/* Input invisible para el archivo */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 mt-2 mb-2">
                {isOwnProfile ? (
                  <>
                    <button 
                      onClick={handleStartEditing}
                      className="btn btn-md py-1 btn-ghost border border-base-300 rounded-full px-6 hover:bg-base-200 transition-colors"
                    >
                      Editar Perfil
                    </button>
                    <button 
                      onClick={handleStartEditing}
                      className="btn btn-md btn-circle btn-ghost border border-base-300 hover:rotate-45 transition-transform"
                    >
                      <Settings size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm rounded-full px-6 gap-2">
                      <UserPlus size={16} /> Seguir
                    </button>
                    <button className="btn btn-sm btn-circle btn-ghost border border-base-300">
                      <Share2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Texto Bio y Nombre */}
            <div className="space-y-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-serif tracking-tight">
                  Usuario_07
                </h1>
                <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={14} /> Madrid, ES
                </p>
              </div>
              
              {/* Lógica de Edición de Biografía */}
              {isEditing ? (
                <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-3 items-start max-w-xl animate-in fade-in zoom-in duration-200">
                  {/* ESTILO DEL INPUT MEJORADO */}
                  <div className="w-full relative">
                    <textarea
                      className="textarea w-full text-base leading-relaxed h-28 resize-none bg-base-200/50 border-transparent focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl p-4 shadow-inner"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Escribe algo sobre ti..."
                      autoFocus
                    />
                    <div className="text-xs text-right mt-1 opacity-50 px-1">
                        {newDescription.length}/150
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 pt-1">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-sm btn-square rounded-lg shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                      disabled={!newDescription.trim()}
                      title="Guardar"
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="btn btn-ghost btn-sm btn-square rounded-lg hover:bg-base-200"
                      title="Cancelar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </form>
              ) : (
                <p className="max-w-md text-base leading-relaxed opacity-80 whitespace-pre-wrap">
                  {description}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex gap-6 py-4 border-y border-base-200/50 md:border-none md:py-2 mt-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:gap-2 items-center md:items-baseline group cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="font-bold text-lg">{stat.value}</span>
                    <span className="text-xs md:text-sm opacity-60 uppercase tracking-wide font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
>>>>>>> f4f71b903cbbfd4f7681344fe1373927cdea3871
        </div>

        {/* =======================
            TABS DE CONTENIDO
        ======================== */}
        <div className="border-t border-base-200 mt-4 sticky top-64px] bg-base-100/95 backdrop-blur-sm z-30">
          <div className="flex justify-center gap-4 md:gap-12">
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 py-4 border-b-2 px-4 text-sm font-bold tracking-wide transition-all ${
                activeTab === "collections"
                  ? "border-primary text-base-content"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              <Grid size={18} /> MIS COLECCIONES
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-4 border-b-2 px-4 text-sm font-bold tracking-wide transition-all ${
                activeTab === "saved"
                  ? "border-primary text-base-content"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              <Bookmark size={18} /> GUARDADO
            </button>
          </div>
        </div>

        {/* =======================
            GRID DE COLECCIONES
        ======================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:px-6 min-h-[300px]">
          {/* Botón Crear */}
          {isOwnProfile && activeTab === "collections" && (
            <div className="aspect-4/5 bg-base-100 border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-base-200/50 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                <Plus size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100">
                Nueva Colección
              </span>
            </div>
          )}

          {[1, 2, 3, 4, 5].map((item) => (
            <Link to={`/collection/${item}`} key={item} className="group cursor-pointer block">
              <div className="card bg-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden aspect-[4/5] relative">
                 <img
                    src={`https://picsum.photos/400?random=${item + 10}`}
                    alt="Collection"
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 flex flex-col justify-end p-5">
                    <p className="text-white font-serif font-bold truncate text-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                      Retro Vibes
                    </p>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider mt-1">24 items</p>
                  </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      
      <NavMobile />
    </div>
  );
};

export default Profile;