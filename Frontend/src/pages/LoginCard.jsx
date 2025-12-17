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

  return (
    <div className="min-h-screen flex w-full bg-base-100">
      {/* SECCIÓN IZQUIERDA */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${fotoLogin})` }}
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
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;