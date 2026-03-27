import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next"; 
import api from "../../services/api";

const ForgotPasswordForm = () => {
  const { t } = useTranslation(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 3. Esquema dinámico
  const forgotPasswordSchema = z.object({
    email: z.string().email(t("forgot.errors.email_invalid")).toLowerCase().trim(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/users/forgot-password", data);
      setSuccess(t("forgot.success_msg"));
    } catch (err) {
      setError(err.response?.data?.error || t("forgot.errors.connection"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control">
        <label className="label">
          <span className="label-text font-bold">{t("forgot.email_label")}</span>
        </label>
        <input 
          {...register("email")} 
          type="email" 
          placeholder={t("forgot.email_placeholder")} 
          className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`} 
        />
        {errors.email && <span className="text-error text-xs mt-1 block">{errors.email.message}</span>}
      </div>

      {error && <div className="alert alert-error text-sm py-2 rounded-lg">{error}</div>}
      
      {success && (
        <div className="alert alert-success text-sm py-3 shadow-md flex items-start gap-3 rounded-lg">
          <ShieldCheck size={20} className="shrink-0" />
          <div className="flex flex-col gap-2">
            <span>{success}</span>
            <Link to="/reset-password" underline="always" className="font-bold hover:underline">
              {t("forgot.reset_link")}
            </Link>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full text-lg rounded-full mt-4" disabled={loading}>
        <span className="flex items-center gap-2">
          {loading && <span className="loading loading-spinner"></span>}
          {t("forgot.submit_button")}
          {!loading && <ArrowRight size={20} />}
        </span>
      </button>
    </form>
  );
};

export default ForgotPasswordForm;