import React, { useEffect, useState, useRef } from "react";
import { ArrowRight, Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GoogleSignIn from "../components/GoogleSignIn";
import fotoLogin from "../assets/foto-login.webp";
import Logo from "../assets/LogoClaro.webp"
import api from "../services/api";
import { useAuth } from "../context/AuthContext"; 
import { normalizeUser } from "../services/normalizers";

const SITE_KEY = "6LdZWC0sAAAAAEuorDFJYAuZWVbR_zGL-FTmgHHh";

const loginSchema = z.object({
  identifier: z.string().min(3, "Mínimo 3 caracteres").max(50).trim(),
  password: z.string().min(1, "La contraseña es requerida"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
});

const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, "Mínimo 4 caracteres")
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos")
      .trim(),
    email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Una mayúscula")
      .regex(/[a-z]/, "Una minúscula")
      .regex(/[0-9]/, "Un número")
      .regex(/[^a-zA-Z0-9]/, "Un carácter especial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const AuthScreen = ({ type = "login" }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const isLogin = type === "login";
  const isForgot = type === "forgot";
  const isRegister = type === "register";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const recaptchaRef = useRef(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const currentSchema = isForgot ? forgotPasswordSchema : isLogin ? loginSchema : registerSchema;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(currentSchema),
  });

  const watchedPassword = watch("password", "");

  // Lógica de fuerza de contraseña optimizada
  useEffect(() => {
    if (isRegister && watchedPassword) {
      const requirements = [
        watchedPassword.length >= 8,
        /[A-Z]/.test(watchedPassword),
        /[a-z]/.test(watchedPassword),
        /[0-9]/.test(watchedPassword),
        /[^a-zA-Z0-9]/.test(watchedPassword),
      ];
      const metRequirements = requirements.filter(Boolean).length;
      setPasswordStrength((metRequirements / requirements.length) * 100);
    } else {
      setPasswordStrength(0);
    }
  }, [watchedPassword, isRegister]);

  useEffect(() => {
    reset();
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  }, [type, reset]);

  useEffect(() => {
    if (isRegister && typeof window.grecaptcha !== "undefined" && recaptchaRef.current) {
      if (recaptchaRef.current.children.length === 0) {
        try {
          window.grecaptcha.render(recaptchaRef.current, { sitekey: SITE_KEY, theme: "dark" });
        } catch (err) { console.error("Error reCAPTCHA:", err); }
      }
    }
  }, [isRegister]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isForgot) {
        await api.post("/users/forgot-password", data);
        setSuccess("Solicitud enviada. Contacta con el administrador.");
        return;
      }

      let captchaToken = null;
      if (isRegister && window.grecaptcha) {
        captchaToken = window.grecaptcha.getResponse();
        if (!captchaToken) {
          setError("Por favor, completa el reCAPTCHA.");
          setLoading(false);
          return;
        }
      }

      const endpoint = isRegister ? "/users/register" : "/users/login";
      const payload = { ...data };
      if (isRegister) payload["g-recaptcha-response"] = captchaToken;

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        const userData = normalizeUser(response.data.user || response.data);
        login(userData, response.data.token);

        if (isRegister) {
          navigate("/onboarding", { state: { userId: userData.id, username: userData.username } });
        } else {
          navigate(userData.role === 'admin' ? "/admin" : "/feed");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error de conexión.");
      if (isRegister && window.grecaptcha) window.grecaptcha.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/users/google", { token: idToken });
      const { token, user, isNewUser } = response.data;
      const userData = normalizeUser(user);
      
      login(userData, token);

      if (isNewUser) {
        navigate("/onboarding", { state: { userId: userData.id, username: userData.username } });
      } else {
        navigate(userData.role === 'admin' ? "/admin" : "/feed");
      }
    } catch  {
      setError("Error al conectar con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-base-100">
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${fotoLogin})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 p-16 flex flex-col h-full text-white justify-end pb-24">
          <img src={Logo} alt="Logo" className="w-32 h-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Tribe</h1>
          <p className="text-xl max-w-md font-medium text-gray-200">Organiza lo que te inspira y conéctate.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <Link to="/" className="absolute top-8 left-8 btn btn-ghost btn-sm gap-2 text-base-content/60">← Inicio</Link>

        <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight font-serif text-base-content">
              {isForgot ? "Solicitar Código" : isLogin ? "Bienvenido de nuevo" : "Únete a Tribe"}
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {isForgot && (
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Correo electrónico</span></label>
                <input {...register("email")} type="email" placeholder="tu@email.com" className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`} />
                {errors.email && <span className="text-error text-xs mt-1 block">{errors.email.message}</span>}
              </div>
            )}

            {isRegister && (
              <>
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold">Nombre de usuario</span></label>
                  <input {...register("username")} type="text" placeholder="ej. pixel_collector" className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold">Correo electrónico</span></label>
                  <input {...register("email")} type="email" placeholder="hola@ejemplo.com" className="input input-bordered w-full" />
                </div>
              </>
            )}

            {isLogin && (
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Usuario o Correo</span></label>
                <input {...register("identifier")} type="text" placeholder="usuario o email" className="input input-bordered w-full" />
              </div>
            )}

            {(isLogin || isRegister) && (
              <div className="form-control">
                <div className="flex justify-between items-center mb-1">
                  <label className="label"><span className="label-text font-bold">Contraseña</span></label>
                  {isLogin && <Link to="/forgot-password" size="xs" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>}
                </div>
                <div className="relative">
                  <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="input input-bordered w-full pr-10" />
                  <button type="button" className="absolute inset-y-0 right-3 flex items-center text-base-content/40" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Visualización de fuerza de contraseña para corregir ESLint */}
                {isRegister && watchedPassword.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          passwordStrength < 40 ? 'bg-error' : passwordStrength < 80 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <Requirement met={watchedPassword.length >= 8} label="8+ caracteres" />
                      <Requirement met={/[A-Z]/.test(watchedPassword)} label="Mayúscula" />
                      <Requirement met={/[0-9]/.test(watchedPassword)} label="Número" />
                      <Requirement met={/[^a-zA-Z0-9]/.test(watchedPassword)} label="Especial" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {isRegister && (
              <div className="form-control">
                <label className="label"><span className="label-text font-bold">Repetir contraseña</span></label>
                <input {...register("confirmPassword")} type={showPassword ? "text" : "password"} className="input input-bordered w-full" />
                <div className="mt-6 flex justify-center"><div ref={recaptchaRef}></div></div>
              </div>
            )}

            {error && <div className="alert alert-error text-sm py-2">{error}</div>}
            
            {/* Mensaje de éxito para corregir ESLint */}
            {success && (
              <div className="alert alert-success text-sm py-3 shadow-md flex items-start gap-3">
                <ShieldCheck size={20} className="shrink-0" />
                <div className="flex flex-col gap-2">
                   <span>{success}</span>
                   {isForgot && <Link to="/reset-password" underline="always" className="font-bold">Ir a restablecer →</Link>}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full text-lg rounded-full" disabled={loading}>
              <span className="flex items-center gap-2">
                {loading && <span className="loading loading-spinner"></span>}
                {isForgot ? "Enviar Solicitud" : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                {!loading && <ArrowRight size={20} />}
              </span>
            </button>
          </form>

          {!isForgot && (
            <>
              <div className="divider text-sm">O continúa con</div>
              <div className="flex justify-center">
                <GoogleSignIn onGoogleSuccess={handleGoogleSuccess} isLogin={isLogin} />
              </div>
            </>
          )}

          <p className="text-center text-sm">
            {isForgot ? <Link to="/login" className="font-bold text-primary">Volver al login</Link> : 
             isLogin ? <>¿No tienes cuenta? <Link to="/register" className="font-bold text-primary">Regístrate</Link></> : 
             <>¿Ya eres miembro? <Link to="/login" className="font-bold text-primary">Inicia sesión</Link></>}
          </p>
        </div>
      </div>
    </div>
  );
};

const Requirement = ({ met, label }) => (
  <div className={`flex items-center gap-2 text-[10px] uppercase font-bold transition-colors ${met ? 'text-success' : 'text-base-content/30'}`}>
    {met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />} {label}
  </div>
);

export default AuthScreen;