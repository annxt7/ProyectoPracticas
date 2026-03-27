import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; 
import fotoLogin from "../assets/foto-login.webp";
import Logo from "../assets/LogoClaro.webp";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

const AuthScreen = ({ type = "login" }) => {
  const { t } = useTranslation(); 
  const isLogin = type === "login";
  const isForgot = type === "forgot";
  const isRegister = type === "register";

  return (
    <div className="min-h-screen flex w-full bg-base-100">
      {/* Sección Izquierda (Hero) */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${fotoLogin})` }}>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 p-16 flex flex-col h-full text-white justify-end pb-24">
          <img src={Logo} alt="Logo" className="w-32 h-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Tribe</h1>
          <p className="text-xl max-w-md font-medium text-gray-200">{t("auth.hero_subtitle")}</p>
        </div>
      </div>

      {/* Sección Derecha (Formularios) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <Link to="/" className="absolute top-8 left-8 btn btn-ghost btn-sm gap-2 text-base-content/60">
          {t("auth.back_home")}
        </Link>

        <div className="w-full max-w-md space-y-10 mt-10 lg:mt-0">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight font-serif text-base-content mb-2">
              {isForgot ? t("auth.forgot_title") : isLogin ? t("auth.login_title") : t("auth.register_title")}
            </h2>
          </div>

          {isLogin && <LoginForm />}
          {isRegister && <RegisterForm />}
          {isForgot && <ForgotPasswordForm />}

          <p className="text-center text-sm mt-8">
            {isForgot ? (
              <Link to="/login" className="font-bold text-primary hover:underline">{t("auth.back_to_login")}</Link>
            ) : isLogin ? (
              <>
                {t("auth.no_account")}{" "}
                <Link to="/register" className="font-bold text-primary hover:underline">{t("auth.register_now")}</Link>
              </>
            ) : (
              <>
                {t("auth.already_member")}{" "}
                <Link to="/login" className="font-bold text-primary hover:underline">{t("auth.login_now")}</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;