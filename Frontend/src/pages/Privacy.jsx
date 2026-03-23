import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <Link to="/register" className="btn btn-ghost btn-sm gap-2 mb-8 text-base-content/70 hover:text-primary">
          <ArrowLeft size={16} /> Volver al registro
        </Link>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-serif">Política de Privacidad</h1>
            <p className="text-sm text-base-content/60 mt-1">Última actualización: Marzo 2026</p>
          </div>
        </div>

        {/* Contenido del documento */}
        <div className="space-y-8 text-base leading-relaxed text-base-content/80">
          
          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">1. Introducción</h2>
            <p>
              Bienvenido a <strong>Tribe</strong>. El responsable del tratamiento de tus datos es <strong>Tribe</strong>. 
              Nuestra plataforma está diseñada para ayudarte a organizar, buscar y compartir tus intereses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">2. Información que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Datos de cuenta:</strong> Al registrarte, recopilamos tu nombre de usuario, correo electrónico y contraseña (la cual se almacena de forma segura y encriptada).</li>
              <li><strong>Inicio de sesión con Google:</strong> Si decides autenticarte a través de Google, recibimos información pública básica de tu perfil (como tu correo electrónico).</li>
              <li><strong>Contenido y preferencias:</strong> Guardamos la información relacionada con las búsquedas en el catálogo, los elementos que añades a tus colecciones y la configuración de tu perfil establecida durante el proceso de registro inicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">3. Uso de la información</h2>
            <p>Los datos que recopilamos se utilizan exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Gestionar tu acceso a la plataforma y mantener tu sesión activa de forma segura.</li>
              <li>Personalizar tu feed y sugerirte contenido basado en tus intereses.</li>
              <li>Proteger la plataforma contra el spam y el abuso mediante <strong>Google reCAPTCHA v3</strong>. El uso de este servicio está sujeto a la <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-primary hover:underline">Política de privacidad</a> y los <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-primary hover:underline">Términos de servicio</a> de Google.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">4. Protección y retención de datos</h2>
            <p>
              No vendemos tu información personal a terceros. Tus datos se conservarán mientras tu cuenta de Tribe permanezca activa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-base-content mb-3">5. Tus Derechos</h2>
            <p>
              Tienes derecho a acceder a tus datos, solicitar su rectificación o exigir su eliminación completa de nuestros servidores. Puedes gestionar estos derechos directamente desde la configuración de tu cuenta o contactando a nuestro soporte en <strong>soportetribe@tribe.com</strong>.
            </p>
          </section>

        </div>

        <div className="divider mt-12"></div>
        
        <p className="text-center text-sm text-base-content/50 pb-8">
          © {new Date().getFullYear()} Tribe. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;