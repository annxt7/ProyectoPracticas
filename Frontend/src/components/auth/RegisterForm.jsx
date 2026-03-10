import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";
import GoogleSignIn from "../GoogleSignIn";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { normalizeUser } from "../../services/normalizers";

const SITE_KEY = "6LdZWC0sAAAAAEuorDFJYAuZWVbR_zGL-FTmgHHh";

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
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar la política de privacidad",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
const Requirement = ({ met, label }) => (
  <div className={`flex items-center gap-2 text-[10px] uppercase font-bold transition-colors ${met ? 'text-success' : 'text-base-content/30'}`}>
    {met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />} {label}
  </div>
);

const RegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const recaptchaRef = useRef(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch("password", "");

  // Fuerza de contraseña
  useEffect(() => {
    if (watchedPassword) {
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
  }, [watchedPassword]);

  // Inicializar reCAPTCHA
  useEffect(() => {
    if (typeof window.grecaptcha !== "undefined" && recaptchaRef.current) {
      if (recaptchaRef.current.children.length === 0) {
        try {
          window.grecaptcha.render(recaptchaRef.current, { sitekey: SITE_KEY, theme: "dark" });
        } catch (err) { console.error("Error reCAPTCHA:", err); }
      }
    }
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let captchaToken = null;
      if (window.grecaptcha) {
        captchaToken = window.grecaptcha.getResponse();
        if (!captchaToken) {
          setError("Por favor, completa el reCAPTCHA.");
          setLoading(false);
          return;
        }
      }

      const payload = { ...data, "g-recaptcha-response": captchaToken };
      const response = await api.post("/users/register", payload);

      if (response.data.success) {
        const userData = normalizeUser(response.data.user || response.data);
        login(userData, response.data.token);
        navigate("/onboarding", { state: { userId: userData.id, username: userData.username } });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error de conexión.");
      if (window.grecaptcha) window.grecaptcha.reset();
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
    } catch {
      setError("Error al conectar con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-control">
          <label className="label"><span className="label-text font-bold">Nombre de usuario</span></label>
          <input {...register("username")} type="text" placeholder="ej. pixel_collector" className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`} />
          {errors.username && <span className="text-error text-xs mt-1 block">{errors.username.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text font-bold">Correo electrónico</span></label>
          <input {...register("email")} type="email" placeholder="hola@ejemplo.com" className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`} />
          {errors.email && <span className="text-error text-xs mt-1 block">{errors.email.message}</span>}
        </div>

        <div className="form-control">
          <div className="flex justify-between items-center mb-1">
            <label className="label"><span className="label-text font-bold">Contraseña</span></label>
          </div>
          <div className="relative">
            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`} />
            <button type="button" className="absolute inset-y-0 right-3 flex items-center text-base-content/40" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span className="text-error text-xs mt-1 block">{errors.password.message}</span>}
          
          {watchedPassword.length > 0 && (
            <div className="mt-4 space-y-3 p-3 bg-base-200 rounded-lg">
              <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${passwordStrength < 40 ? 'bg-error' : passwordStrength < 80 ? 'bg-warning' : 'bg-success'}`}
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

        <div className="form-control">
          <label className="label"><span className="label-text font-bold">Repetir contraseña</span></label>
          <input {...register("confirmPassword")} type={showPassword ? "text" : "password"} className={`input input-bordered w-full ${errors.confirmPassword ? "input-error" : ""}`} />
          {errors.confirmPassword && <span className="text-error text-xs mt-1 block">{errors.confirmPassword.message}</span>}
        </div>

        <div className="form-control mt-4">
          <label className="label cursor-pointer justify-start gap-3 items-start">
            <input type="checkbox" {...register("acceptTerms")} className="checkbox checkbox-primary checkbox-sm mt-1" />
            <span className="label-text text-sm">
              He leído y acepto la <Link to="/privacy" className="text-primary font-bold hover:underline">política de privacidad</Link> de Tribe.
            </span>
          </label>
          {errors.acceptTerms && <span className="text-error text-xs mt-1 block ml-8">{errors.acceptTerms.message}</span>}
          
          <div className="mt-6 flex justify-center"><div ref={recaptchaRef}></div></div>
        </div>

        {error && <div className="alert alert-error text-sm py-2 rounded-lg">{error}</div>}
        {success && (
          <div className="alert alert-success text-sm py-3 shadow-md flex items-start gap-3 rounded-lg">
            <ShieldCheck size={20} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full text-lg rounded-full mt-4" disabled={loading}>
          <span className="flex items-center gap-2">
            {loading && <span className="loading loading-spinner"></span>}
            Crear Cuenta
            {!loading && <ArrowRight size={20} />}
          </span>
        </button>
      </form>

      <div className="divider text-sm text-base-content/50">O continúa con</div>
      <div className="flex justify-center">
        <GoogleSignIn onGoogleSuccess={handleGoogleSuccess} isLogin={false} />
      </div>
    </>
  );
};

export default RegisterForm;