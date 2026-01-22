import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Star, Users } from "lucide-react";
import Logo from "../assets/LogoClaro.webp";

const Landing = () => {
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
    "https://cdn-images.dzcdn.net/images/cover/6bb67448d53a0b8dafe192ac8316fab8/0x1900-000000-80-0-0.jpg",
    "https://fotografias-2.larazon.es/clipping/cmsimages01/2019/08/08/E3BD4110-1BCE-44CE-9990-29B0CEAF3773/58.jpg?crop=1693,960,x30,y0&width=1000&height=567&optimize=low&format=webply",
    "https://www.futuro.cl/wp-content/uploads/2024/04/Scary-Movie-jpg.webp",
    "https://www.planetadelibros.com/usuaris/libros/thumbs/148e0b1a-1f4a-49e3-b523-1d14171bae98/d_295_510/portada_don-quijote-de-la-mancha-comic_miguel-de-cervantes_202310231106.webp",
    "https://img2.rtve.es/v/3232354/?w=1600",
    "https://i.ebayimg.com/images/g/ZGEAAMXQ-BZQ9pwB/s-l400.jpg",
    "https://external-preview.redd.it/sylvester-stallone-says-his-iconic-rocky-steps-scene-was-v0-J08hAt1HZZ-1GsWLLkEWndXoh8ae_avA_QZBmCm0WfE.jpeg?width=640&crop=smart&auto=webp&s=47b3bf93adf9038b50c190792ece366483e33fb7"
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section>
        <div>
          <div>
            <img src={Logo} alt="Tribe Logo" />

            {/* Badge de Early Access */}
            <div>
              <span />
              Early Access
            </div>

            <h1>
              Tribe <br />
              <span>Encuentra</span> <br />a tu gente
            </h1>

            <p>
              Deja de ser un extraño en internet, encuentra a tu tribu. Organiza
              tu mundo y descubre el de otros.
            </p>

            <div>
              <Link to="/register">
                Regístrate Ahora
                <ArrowRight />
              </Link>
              <Link to="/login">
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Visual Derecha (Mantenemos la estructura para el grid animado) */}
          <aside>
            <div>
              {/* Columna 1 */}
              <div style={{ animation: 'scrollY 20s linear infinite' }}>
                {[...covers, ...covers].map((src, i) => (
                  <div key={`c1-${i}`}>
                    <img src={src} alt="cover" />
                  </div>
                ))}
              </div>
              {/* Columna 2 */}
              <div style={{ animation: 'scrollY 25s linear infinite reverse' }}>
                {[...covers, ...covers].reverse().map((src, i) => (
                  <div key={`c2-${i}`}>
                    <img src={src} alt="cover" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

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