import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import GoogleSignIn from '../components/GoogleSignIn';
import fotoLogin from '../assets/foto-login.jpg';
import Logo from '../assets/LogoClaro.png';
import api from "../services/api";

const SITE_KEY = '6LdZWC0sAAAAAEuorDFJYAuZWVbR_zGL-FTmgHHh';

// 1. Esquemas de validación
const loginSchema = z.object({
  identifier: z.string().min(3, "Mínimo 3 caracteres").max(50).trim(),
  password: z.string().min(1, "La contraseña es requerida"),
});
const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
});
const registerSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(20).regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos").trim(),
  email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Una mayúscula")
    .regex(/[a-z]/, "Una minúscula")
    .regex(/[0-9]/, "Un número")
    .regex(/[^a-zA-Z0-9]/, "Un carácter especial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});


const AuthScreen = ({ type = 'login' }) => {
  const navigate= useNavigate();
  const isLogin = type === 'login';
  const isForgot = type === 'forgot';
  const isRegister = type === 'register';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const recaptchaRef = useRef(null);

  // Seleccionar esquema según el tipo
  const currentSchema = isForgot ? forgotPasswordSchema : (isLogin ? loginSchema : registerSchema);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(currentSchema),
  });

  useEffect(() => {
    reset();
    setError(null);
    setSuccess(null);
  }, [type, reset]);

  useEffect(() => {
    if (isRegister && typeof window.grecaptcha !== 'undefined' && recaptchaRef.current) {
      if (recaptchaRef.current.children.length === 0) {
        try {
          window.grecaptcha.render(recaptchaRef.current, { 'sitekey': SITE_KEY, 'theme': 'dark' });
        } catch (error) {
          console.error("Error reCAPTCHA:", error);
        }
      }
    }
  }, [isRegister]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    let token = null;
    if (isRegister) {
      token = window.grecaptcha.getResponse();
      if (!token) {
        setError("Por favor, marca la casilla de reCAPTCHA.");
        setLoading(false);
        return;
      }
    }

    try {
      let endpoint = '/users/login';
      if (isRegister) endpoint = '/users/register';
      if (isForgot) endpoint = '/user/forgot-password';

      const response = await api.post(endpoint, { ...data, 'g-recaptcha-response': token });
  if (response.data.success) { 
  const userId = response.data.userId; 
   if (success) {
      if (isRegister) {
        navigate('/onboarding', { state: { userId } });
      } else if (isLogin) {
        navigate('/feed');
      } else {
        setSuccess("Enlace enviado. Revisa tu correo.");
      }
    }
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Error de conexión.');
    if (isRegister) window.grecaptcha.reset();
  } finally {
    setLoading(false);
  }
};

  const handleGoogleSuccess = async (idToken) => {
    setLoading(true);
  setError(null);
  try {
    const response = await api.post('/users/google', { token: idToken });
    const { userId, isNewUser } = response.data;

    if (isNewUser) {
      navigate('/onboarding', { state: { userId } });
    } else {
      navigate('/feed');
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Error Google.');
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="min-h-screen flex w-full bg-base-100">
      {/* SECCIÓN IZQUIERDA */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${fotoLogin})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 p-16 flex flex-col h-full text-white">
          <img src={Logo} alt="Logo" className="w-30 h-auto mb-4" />
          <p className="text-xl max-w-md font-medium">Organiza lo que te inspira y conéctate a través de tus colecciones</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <Link to="/" className="absolute top-8 left-8 btn btn-ghost btn-sm gap-2 text-base-content/60">← Inicio</Link>

        <div className="w-full max-w-md space-y-10">
          <h2 className="text-4xl font-extrabold tracking-tight font-serif">
            {isForgot ? 'Recuperar acceso' : isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {isForgot && (
              <div>
                <label className="label text-sm font-bold">Correo electrónico</label>
                <input {...register("email")} type="text" placeholder="tu@email.com" className={`input input-bordered w-full ${errors.email ? 'border-error' : ''}`} />
                {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
              </div>
            )}

            {isRegister && (
              <>
                <div>
                  <label className="label text-sm font-bold">Nombre de usuario</label>
                  <input {...register("username")} type="text" placeholder="ej. pixel_collector" className={`input input-bordered w-full ${errors.username ? 'border-error' : ''}`} />
                  {errors.username && <p className="text-error text-xs mt-1">{errors.username.message}</p>}
                </div>
                <div>
                  <label className="label text-sm font-bold">Correo electrónico</label>
                  <input {...register("email")} type="text" placeholder="hola@ejemplo.com" className={`input input-bordered w-full ${errors.email ? 'border-error' : ''}`} />
                  {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
                </div>
              </>
            )}

            {isLogin && (
              <div>
                <label className="label text-sm font-bold">Usuario o Correo</label>
                <input {...register("identifier")} type="text" placeholder="hola@ejemplo.com" className={`input input-bordered w-full ${errors.identifier ? 'border-error' : ''}`} />
                {errors.identifier && <p className="text-error text-xs mt-1">{errors.identifier.message}</p>}
              </div>
            )}

            {(isLogin || isRegister) && (
              <div>
                <div className="flex justify-between mt-2 pb-4">
                  <label className="label text-sm font-bold">Contraseña</label>
                  {isLogin && <Link to="/forgot-password" className="text-sm text-primary hover:underline">¿Olvidaste tu contraseña?</Link>}
                </div>
                <input {...register("password")} type="password" placeholder="••••••••" className={`input input-bordered w-full ${errors.password ? 'border-error' : ''}`} />
                {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="label text-sm font-bold">Repetir contraseña</label>
                <input {...register("confirmPassword")} type="password" placeholder="••••••••" className={`input input-bordered w-full ${errors.confirmPassword ? 'border-error' : ''}`} />
                {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
                <div className="mt-4 flex justify-center"><div ref={recaptchaRef} data-sitekey={SITE_KEY} data-theme='dark'></div></div>
              </div>
            )}

            {error && <div className="text-error text-center font-medium">{error}</div>}
            {success && <div className="text-success text-center font-medium">{success}</div>}

            <button type="submit" className="btn btn-primary w-full text-lg rounded-full" disabled={loading}>
              <span className="flex items-center gap-2">
                {loading ? 'Procesando...' : isForgot ? 'Enviar enlace' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                {!loading && <ArrowRight size={20} />}
              </span>
            </button>
          </form>

          {!isForgot && (
            <>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-base-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-base-100 text-base-content/50">O continúa con</span></div></div>
              <div className="flex justify-center"><GoogleSignIn onGoogleSuccess={handleGoogleSuccess} isLogin={isLogin} /></div>
            </>
          )}

          <p className="text-center text-sm mt-8">
            {isForgot ? (
              <Link to="/login" className="font-bold text-primary hover:underline">Volver al inicio de sesión</Link>
            ) : isLogin ? (
              <>¿No tienes cuenta? <Link to="/register" className="font-bold text-primary hover:underline">Regístrate</Link></>
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