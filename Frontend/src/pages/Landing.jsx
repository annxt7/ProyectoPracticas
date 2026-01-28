import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Star, Users } from "lucide-react";
import {Logo, LogoOscuro } from "../assets/LogoOscuro.webp";
import { useTheme } from "../context/ThemeContext";

const Landing = () => {
const { theme} = useTheme(); 
  const isDark = ["dark", "natura-dark", "midnight-rose", "mocha-night", "galactic-purple", "mundi-deep","royal-wine"].includes(theme);
  // Imágenes de ejemplo
  const covers = [
    "https://m.media-amazon.com/images/M/MV5BMjdkNzJlYzgtY2MwZC00NWFjLTgwMDgtOTJkY2Q3NjA3MjMzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "https://store.ubisoft.com/on/demandware.static/-/Sites-masterCatalog/default/dwe540c9e2/images/large/56c4947a88a7e300458b45de.jpg",
    "https://m.media-amazon.com/images/I/81cptXWZlfL.jpg",
    "https://muralsyourway.vtexassets.com/arquivos/ids/274926/Pacman-Game-Wall-Mural.jpg",
    "https://bp1.blogger.com/_i1Q5vLyDKXc/R1O7a7PdALI/AAAAAAAABmQ/gE9_fm43xBQ/s1600-R/pes_6.jpg",
    "https://m.media-amazon.com/images/I/81bpmchtQ6L.jpg",
    "https://pbs.twimg.com/media/FMnseBnWYAEQ_5A.jpg",
    "https://m.media-amazon.com/images/I/61KHb6E8RXL._AC_UF350,350_QL50_.jpg",
    "https://i.scdn.co/image/ab67616d00001e029583673af04af6d27def8a9c",
    "https://st1.uvnimg.com/56/e0/2cae4c654837a62c9dd212a8caa3/the-mummy-imhotep.jpg",
    "https://www.planetadelibros.com/usuaris/libros/thumbs/148e0b1a-1f4a-49e3-b523-1d14171bae98/d_295_510/portada_don-quijote-de-la-mancha-comic_miguel-de-cervantes_202310231106.webp",
    "https://i.ebayimg.com/images/g/62IAAOSwj0xjztEj/s-l1200.jpg",
    "https://fotografias-2.larazon.es/clipping/cmsimages01/2019/08/08/E3BD4110-1BCE-44CE-9990-29B0CEAF3773/58.jpg?crop=1693,960,x30,y0&width=1000&height=567&optimize=low&format=webply",
    "https://lh3.googleusercontent.com/g9nVBoUu9Q_Yk8z7J9pPWUoiSSmgLVfTlWLAcscsbq_zxho143yW0d4zf9nMB4sYEP0QnRKttBOduyByQWboP2YdLld03ewTzT6wLuUU9pJtAjbx-2sR3r4sXVeypxZM7aH_hUczXS0=w2400",
    "https://www.futuro.cl/wp-content/uploads/2024/04/Scary-Movie-jpg.webp",
    "https://img2.rtve.es/v/3232354/?w=1600",
    "https://m.media-amazon.com/images/I/81xOquy2BtL._AC_UF1000,1000_QL80_.jpg",
    "https://cdn-images.dzcdn.net/images/cover/f6ede1a8e22f17e3af1b6b47caf5d635/0x1900-000000-80-0-0.jpg",
    "https://i.ytimg.com/vi/LYmWO4vvYHg/maxresdefault.jpg",
    "https://external-preview.redd.it/sylvester-stallone-says-his-iconic-rocky-steps-scene-was-v0-J08hAt1HZZ-1GsWLLkEWndXoh8ae_avA_QZBmCm0WfE.jpeg?width=640&crop=smart&auto=webp&s=47b3bf93adf9038b50c190792ece366483e33fb7"
    
  ];

  return (
    <div className="h-screen bg-base-100 flex flex-col justify-center overflow-hidden font-sans">
      {/* HERO SECTION */}
      <div className="relative pt-6 pb-20 lg:pt-12 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10 relative flex flex-col items-start text-left">
            <img
                    src={isDark ? LogoOscuro : Logo}
                    alt="Tribe Logo"
                    className="h-14 w-auto object-contain transition-all"
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
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-800"
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
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-800"
                    />
                  </div>
                ))}
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
