import React, { useState, useEffect } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import fotoLogin from "../assets/foto-login.webp";
import Logo from "../assets/LogoClaro.png";
import api from "../services/api";

const resetSchema = z
  .object({
    email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
    code: z.string().min(6, "El código tiene al menos 6 caracteres").toUpperCase().trim(),
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

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const watchedPassword = watch("password", "");

  // Lógica de la barra de fuerza (Idéntica a tu AuthScreen)
  useEffect(() => {
    const requirements = [
      watchedPassword.length >= 8,
      /[A-Z]/.test(watchedPassword),
      /[a-z]/.test(watchedPassword),
      /[0-9]/.test(watchedPassword),
      /[^a-zA-Z0-9]/.test(watchedPassword),
    ];
    const metRequirements = requirements.filter(Boolean).length;
    setPasswordStrength((metRequirements / requirements.length) * 100);
  }, [watchedPassword]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    console.log("Enviando datos de recuperación:", {
      email: data.email,
      code: data.code,
      password: "🔒 (Oculta)"
    });

    try {
      const response = await api.post("/users/reset-password", {
        email: data.email,
        code: data.code,
        newPassword: data.password
      });
      
      console.log("Respuesta del servidor:", response.data);
      alert("¡Contraseña actualizada! Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (err) {
      console.error("Error capturado en el submit:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-base-100">
      {/* SECCIÓN IZQUIERDA */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${fotoLogin})` }}>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 p-16 flex flex-col h-full text-white justify-end pb-24">
          <img src={Logo} alt="Logo" className="w-32 h-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Tribe</h1>
          <p className="text-xl max-w-md font-medium text-gray-200">Recupera el acceso a tu mundo de colecciones.</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <Link to="/login" className="absolute top-8 left-8 btn btn-ghost btn-sm gap-2 text-base-content/60">← Volver al login</Link>

        <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight font-serif text-base-content">Nueva contraseña</h2>
            <p className="text-base-content/60 mt-2">Introduce el código que te proporcionó el administrador.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* EMAIL */}
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Confirmar Email</span></label>
              <input {...register("email")} type="email" placeholder="tu@email.com" className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`} />
              {errors.email && <span className="text-error text-xs mt-1 block">{errors.email.message}</span>}
            </div>

            {/* CÓDIGO */}
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Código de Seguridad</span></label>
              <div className="relative">
                <input {...register("code")} type="text" placeholder="EJ: A1B2C3" className="input input-bordered w-full pl-10 font-mono uppercase" />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
              </div>
              {errors.code && <span className="text-error text-xs mt-1 block">{errors.code.message}</span>}
            </div>

            {/* PASSWORD */}
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Nueva Contraseña</span></label>
              <div className="relative">
                <input 
                  {...register("password")} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`} 
                />
                <button type="button" className="absolute inset-y-0 right-3 flex items-center text-base-content/40" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Barra de fuerza visual */}
              {watchedPassword.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1 h-1 w-full bg-base-300 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${passwordStrength <= 20 ? 'bg-error' : passwordStrength <= 60 ? 'bg-warning' : 'bg-success'}`}
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
              {errors.password && <span className="text-error text-xs mt-1 block">{errors.password.message}</span>}
            </div>

            {/* CONFIRMAR PASSWORD */}
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Repetir Contraseña</span></label>
              <input 
                {...register("confirmPassword")} 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className={`input input-bordered w-full ${errors.confirmPassword ? "input-error" : ""}`} 
              />
              {errors.confirmPassword && <span className="text-error text-xs mt-1 block">{errors.confirmPassword.message}</span>}
            </div>

            {error && <div className="alert alert-error text-sm py-2 rounded-lg">{error}</div>}

            <button type="submit" className="btn btn-primary w-full text-lg rounded-full mt-4" disabled={loading}>
              <span className="flex items-center gap-2">
                {loading && <span className="loading loading-spinner"></span>}
                Cambiar Contraseña
                {!loading && <ArrowRight size={20} />}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Requirement = ({ met, label }) => (
  <div className={`flex items-center gap-2 text-[10px] uppercase font-bold transition-colors ${met ? 'text-success' : 'text-base-content/30'}`}>
    {met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
    {label}
  </div>
);

export default ResetPasswordScreen;