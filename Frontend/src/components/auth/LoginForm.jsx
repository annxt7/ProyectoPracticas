import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import GoogleSignIn from "../GoogleSignIn";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { normalizeUser } from "../../services/normalizers";

const loginSchema = z.object({
  identifier: z.string().min(3, "Mínimo 3 caracteres").max(50).trim(),
  password: z.string().min(1, "La contraseña es requerida"),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/users/login", data);
      if (response.data.success) {
        const userData = normalizeUser(response.data.user || response.data);
        login(userData, response.data.token);
        navigate(userData.role === 'admin' ? "/admin" : "/feed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error de conexión.");
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
          <label className="label"><span className="label-text font-bold">Usuario o Correo</span></label>
          <input {...register("identifier")} type="text" placeholder="usuario o email" className={`input input-bordered w-full ${errors.identifier ? "input-error" : ""}`} />
          {errors.identifier && <span className="text-error text-xs mt-1 block">{errors.identifier.message}</span>}
        </div>

        <div className="form-control">
          <div className="flex justify-between items-center mb-1">
            <label className="label"><span className="label-text font-bold">Contraseña</span></label>
            <Link to="/forgot-password" size="xs" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>
          <div className="relative">
            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`} />
            <button type="button" className="absolute inset-y-0 right-3 flex items-center text-base-content/40" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span className="text-error text-xs mt-1 block">{errors.password.message}</span>}
        </div>

        {error && <div className="alert alert-error text-sm py-2 rounded-lg">{error}</div>}

        <button type="submit" className="btn btn-primary w-full text-lg rounded-full mt-4" disabled={loading}>
          <span className="flex items-center gap-2">
            {loading && <span className="loading loading-spinner"></span>}
            Iniciar Sesión
            {!loading && <ArrowRight size={20} />}
          </span>
        </button>
      </form>

      <div className="divider text-sm text-base-content/50">O continúa con</div>
      <div className="flex justify-center">
        <GoogleSignIn onGoogleSuccess={handleGoogleSuccess} isLogin={true} />
      </div>
    </>
  );
};

export default LoginForm;