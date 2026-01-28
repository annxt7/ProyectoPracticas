import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Star, Users } from "lucide-react";
import Logo from "../assets/LogoClaro.webp";

const Landing = () => {
  // Imágenes de ejemplo
  const covers = [
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400",
    "https://muralsyourway.vtexassets.com/arquivos/ids/274926/Pacman-Game-Wall-Mural.jpg",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400",
    "https://bp1.blogger.com/_i1Q5vLyDKXc/R1O7a7PdALI/AAAAAAAABmQ/gE9_fm43xBQ/s1600-R/pes_6.jpg",
    "https://images.unsplash.com/photo-1442115597578-2d0fb2413734?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpbGRyZW4lMjBiaWJsZXxlbnwwfHwwfHx8MA%3D%3D",
    "https://fotografias.correryfitness.com/clipping/cmsimages02/2015/12/03/05402945-7CAB-43F2-941B-8FD6CFD07C9A/69.jpg",
    "https://fotografias.larazon.es/clipping/cmsimages01/2019/08/13/DECEBBF0-8C57-4A27-BD24-24EEB578083F/98.jpg?crop=679,382,x145,y0&width=1900&height=1069&optimize=low&format=webply",
    "https://pbs.twimg.com/media/FMnseBnWYAEQ_5A.jpg",
    "https://i.scdn.co/image/ab67616d00001e029583673af04af6d27def8a9c",
    "https://cloudfront-eu-central-1.images.arcpublishing.com/prisa/LTEBA4U3GZDIBMUE2SVAEWK2CE.jpg",
    "https://st1.uvnimg.com/56/e0/2cae4c654837a62c9dd212a8caa3/the-mummy-imhotep.jpg",
    "https://imgs.search.brave.com/sLSi2eZATRjSTEMfpwrKQMTzkLof6aGXCT3RtMJLk6Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzg2L2U2/LzIwLzg2ZTYyMGRl/MGNmYWEyYzU4N2E2/MjNhYTM3ZmM0ZjZj/LmpwZw",
    "https://fotografias-2.larazon.es/clipping/cmsimages01/2019/08/08/E3BD4110-1BCE-44CE-9990-29B0CEAF3773/58.jpg?crop=1693,960,x30,y0&width=1000&height=567&optimize=low&format=webply",
    "https://www.futuro.cl/wp-content/uploads/2024/04/Scary-Movie-jpg.webp",
    "https://www.planetadelibros.com/usuaris/libros/thumbs/148e0b1a-1f4a-49e3-b523-1d14171bae98/d_295_510/portada_don-quijote-de-la-mancha-comic_miguel-de-cervantes_202310231106.webp",
    "https://img2.rtve.es/v/3232354/?w=1600",
    "https://i.ebayimg.com/images/g/ZGEAAMXQ-BZQ9pwB/s-l400.jpg",
    "https://external-preview.redd.it/sylvester-stallone-says-his-iconic-rocky-steps-scene-was-v0-J08hAt1HZZ-1GsWLLkEWndXoh8ae_avA_QZBmCm0WfE.jpeg?width=640&crop=smart&auto=webp&s=47b3bf93adf9038b50c190792ece366483e33fb7"
    
  ];

  return (
    <div className="h-screen bg-base-100 flex flex-col justify-center overflow-hidden font-sans">
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
