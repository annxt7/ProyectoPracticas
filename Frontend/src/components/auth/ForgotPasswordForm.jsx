import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import api from "../../services/api";

const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
});

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/users/forgot-password", data);
      setSuccess("Solicitud enviada. Revisa tu correo o contacta con el administrador.");
    } catch (err) {
      setError(err.response?.data?.error || "Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control">
        <label className="label"><span className="label-text font-bold">Correo electrónico</span></label>
        <input {...register("email")} type="email" placeholder="tu@email.com" className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`} />
        {errors.email && <span className="text-error text-xs mt-1 block">{errors.email.message}</span>}
      </div>

      {error && <div className="alert alert-error text-sm py-2 rounded-lg">{error}</div>}
      
      {success && (
        <div className="alert alert-success text-sm py-3 shadow-md flex items-start gap-3 rounded-lg">
          <ShieldCheck size={20} className="shrink-0" />
          <div className="flex flex-col gap-2">
            <span>{success}</span>
            <Link to="/reset-password" underline="always" className="font-bold hover:underline">Ir a restablecer →</Link>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full text-lg rounded-full mt-4" disabled={loading}>
        <span className="flex items-center gap-2">
          {loading && <span className="loading loading-spinner"></span>}
          Enviar Solicitud
          {!loading && <ArrowRight size={20} />}
        </span>
      </button>
    </form>
  );
};

export default ForgotPasswordForm;