import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next"; 
import GoogleSignIn from "../GoogleSignIn";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { normalizeUser } from "../../services/normalizers";

const SITE_KEY = "6LdZWC0sAAAAAEuorDFJYAuZWVbR_zGL-FTmgHHh";

const Requirement = ({ met, label }) => (
  <div className={`flex items-center gap-2 text-[10px] uppercase font-bold transition-colors ${met ? 'text-success' : 'text-base-content/30'}`}>
    {met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />} {label}
  </div>
);

const RegisterForm = () => {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const recaptchaRef = useRef(null);

  // 3. Esquema de Zod dentro del componente para usar t()
  const registerSchema = z.object({
    username: z.string()
      .min(4, t("register.errors.user_min"))
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/, t("register.errors.user_regex"))
      .trim(),
    email: z.string().email(t("register.errors.email_invalid")).toLowerCase().trim(),
    password: z.string()
      .min(8, t("register.errors.pass_min"))
      .regex(/[A-Z]/, t("register.errors.pass_upper"))
      .regex(/[a-z]/, t("register.errors.pass_lower"))
      .regex(/[0-9]/, t("register.errors.pass_number"))
      .regex(/[^a-zA-Z0-9]/, t("register.errors.pass_special")),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: t("register.errors.terms_required"),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("register.errors.pass_match"),
    path: ["confirmPassword"],
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch("password", "");

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
          setError(t("register.errors.captcha_required"));
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
      setError(err.response?.data?.error || t("register.errors.connection"));
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
      setError(t("register.errors.google_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-control">
          <label className="label"><span className="label-text font-bold">{t("register.username_label")}</span></label>
          <input {...register("username")} type="text" placeholder={t("register.username_placeholder")} className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`} />
          {errors.username && <span className="text-error text-xs mt-1 block">{errors.username.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text font-bold">{t("register.email_label")}</span></label>
          <input {...register("email")} type="email" placeholder={t("register.email_placeholder")} className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`} />
          {errors.email && <span className="text-error text-xs mt-1 block">{errors.email.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text font-bold">{t("register.password_label")}</span></label>
          <div className="relative">
            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder={t("register.password_placeholder")} className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`} />
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
                <Requirement met={watchedPassword.length >= 8} label={t("register.requirements.length")} />
                <Requirement met={/[A-Z]/.test(watchedPassword)} label={t("register.requirements.upper")} />
                <Requirement met={/[0-9]/.test(watchedPassword)} label={t("register.requirements.number")} />
                <Requirement met={/[^a-zA-Z0-9]/.test(watchedPassword)} label={t("register.requirements.special")} />
              </div>
            </div>
          )}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text font-bold">{t("register.confirm_password_label")}</span></label>
          <input {...register("confirmPassword")} type={showPassword ? "text" : "password"} className={`input input-bordered w-full ${errors.confirmPassword ? "input-error" : ""}`} />
          {errors.confirmPassword && <span className="text-error text-xs mt-1 block">{errors.confirmPassword.message}</span>}
        </div>

        <div className="form-control mt-4">
          <label className="label cursor-pointer justify-start gap-3 items-start">
            <input type="checkbox" {...register("acceptTerms")} className="checkbox checkbox-primary checkbox-sm mt-1" />
            <span className="label-text text-sm">
              {t("register.terms_prefix")} <Link to="/privacy" className="text-primary font-bold hover:underline">{t("register.terms_link")}</Link> {t("register.terms_suffix")}
            </span>
          </label>
          {errors.acceptTerms && <span className="text-error text-xs mt-1 block ml-8">{errors.acceptTerms.message}</span>}

          <div className="mt-6 flex justify-center"><div ref={recaptchaRef}></div></div>
        </div>

        {error && <div className="alert alert-error text-sm py-2 rounded-lg">{error}</div>}

        <button type="submit" className="btn btn-primary w-full text-lg rounded-full mt-4" disabled={loading}>
          <span className="flex items-center gap-2">
            {loading && <span className="loading loading-spinner"></span>}
            {t("register.submit_button")}
            {!loading && <ArrowRight size={20} />}
          </span>
        </button>
      </form>

      <div className="divider text-sm text-base-content/50">{t("register.divider")}</div>
      <div className="flex justify-center">
        <GoogleSignIn onGoogleSuccess={handleGoogleSuccess} isLogin={false} />
      </div>
    </>
  );
};

export default RegisterForm;