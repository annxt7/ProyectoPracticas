import React from "react";
import { Shield } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-base-100 text-base-content py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-serif">{t("privacy.title")}</h1>
            <p className="text-sm text-base-content/60 mt-1">{t("privacy.last_update")}</p>
          </div>
        </div>

        {/* Contenido del documento */}
        <div className="space-y-8 text-base leading-relaxed text-base-content/80">

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">{t("privacy.intro_title")}</h2>
            <p>
              <Trans i18nKey="privacy.intro_text">
                Welcome to <strong>Tribe</strong>. The data controller is <strong>Tribe</strong>.
                Our platform is designed to help you organize, search, and share your interests.
              </Trans>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">{t("privacy.collect_title")}</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Trans i18nKey="privacy.collect_acc">
                  <strong>Account data:</strong> When you register, we collect your username, email, and password (which is stored securely and encrypted).
                </Trans>
              </li>
              <li>
                <Trans i18nKey="privacy.collect_google">
                  <strong>Google Login:</strong> If you choose to authenticate through Google, we receive basic public profile information (such as your email).
                </Trans>
              </li>
              <li>
                <Trans i18nKey="privacy.collect_content">
                  <strong>Content and preferences:</strong> We save information related to catalog searches, items you add to your collections, and profile settings established during the initial registration process.
                </Trans>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">{t("privacy.usage_title")}</h2>
            <p>{t("privacy.usage_intro")}</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>{t("privacy.usage_item1")}</li>
              <li>{t("privacy.usage_item2")}</li>
              <li>
                <Trans
                  i18nKey="privacy.usage_item3"
                  components={[
                    <strong key="0" />,
                    <a key="1" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-primary hover:underline" />,
                    <a key="2" href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-primary hover:underline" />
                  ]}
                />
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">{t("privacy.protection_title")}</h2>
            <p>{t("privacy.protection_text")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">{t("privacy.rights_title")}</h2>
            <p>
              <Trans i18nKey="privacy.rights_text">
                You have the right to access your data, request its rectification, or demand its complete removal from our servers. You can manage these rights directly from your account settings or by contacting our support at <strong>soportetribe@tribe.com</strong>.
              </Trans>
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">{t("privacy.reservation_title")}</h2>
            <p>
              {t("privacy.reservation_text")}
            </p>
          </section>
        </div>

        <div className="divider mt-12"></div>

        <p className="text-center text-sm text-base-content/50 pb-8">
          {t("privacy.footer", { year: new Date().getFullYear() })}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;