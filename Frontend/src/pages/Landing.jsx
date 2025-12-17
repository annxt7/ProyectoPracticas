import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Star, Users } from "lucide-react";
import Logo from "../assets/LogoClaro.png";

const Landing = () => {
  // Imágenes de ejemplo
  const covers = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400",
  ];

  return (
    <div className="min-h-screen bg-base-100 flex flex-col overflow-x-hidden font-sans">
      {/* HERO SECTION */}
      <div className="relative pt-6 pb-20 lg:pt-12 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10 relative flex flex-col items-start text-left">
            <img
              src={Logo}
              alt="Tribe Logo"
              className="w-42 md:w-54 h-auto object-contain mb-2"
            />

            {/* Badge de Early Access */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-base-300 bg-base-200/50 text-xs font-bold uppercase tracking-widest text-base-content/60">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Early Access
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold font-serif leading-[0.95] tracking-tight">
              Tribe <br />
              <span className="text-transparent bg-clip-text bg-indigo-500 font-extrabold">
                Encuentra
              </span>{" "}
              <br />a tu gente
            </h1>

            <p className="text-xl text-base-content/70 max-w-md leading-relaxed">
              Deja de ser un extraño en internet, encuentra a tu tribu. Organiza
              tu mundo y descubre el de otros.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/register"
                className="btn btn-primary btn-lg rounded-full px-8 gap-3 group shadow-lg shadow-primary/20"
              >
                Regístrate Ahora
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn btn-outline btn-lg rounded-full px-8"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Visual Derecha (Grid Inclinado - Mantenemos el fix del scroll) */}
          <div className="relative hidden lg:block h-[600px] w-full overflow-hidden rounded-3xl [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
            <div className="absolute top-0 left-0 w-full h-full grid grid-cols-2 gap-4 rotate-12 opacity-80 -translate-y-20 translate-x-10 scale-110">
              {/* Columna 1 */}
              <div className="flex flex-col gap-4 animate-[scrollY_20s_linear_infinite]">
                {[...covers, ...covers].map((src, i) => (
                  <div
                    key={`c1-${i}`}
                    className="w-full aspect-3/4 rounded-xl overflow-hidden shadow-2xl bg-base-200"
                  >
                    <img
                      src={src}
                      alt="cover"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                ))}
              </div>
              {/* Columna 2 */}
              <div className="flex flex-col gap-4 -mt-32 animate-[scrollY_25s_linear_infinite_reverse]">
                {[...covers, ...covers].reverse().map((src, i) => (
                  <div
                    key={`c2-${i}`}
                    className="w-full aspect-3/4 rounded-xl overflow-hidden shadow-2xl bg-base-200"
                  >
                    <img
                      src={src}
                      alt="cover"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Rápidas */}
      <div className="bg-base-200 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <Layers className="w-10 h-10 text-primary mb-2" />
                <h3 className="text-xl font-bold font-serif">
                  Organiza Visualmente
                </h3>
                <p className="opacity-70">
                  Olvida las hojas de cálculo. Tus libros y películas merecen
                  verse tan bien como en tu estantería.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <Users className="w-10 h-10 text-primary mb-2" />
                <h3 className="text-xl font-bold font-serif">
                  Comunidad de Nicho
                </h3>
                <p className="opacity-70">
                  Sigue a Tribers con gustos afines, no algoritmos que te venden
                  cosas.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <Star className="w-10 h-10 text-primary mb-2" />
                <h3 className="text-xl font-bold font-serif">
                  Descubrimiento Real
                </h3>
                <p className="opacity-70">
                  Encuentra tu próxima obsesión a través de las colecciones de
                  expertos y amigos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollY {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
