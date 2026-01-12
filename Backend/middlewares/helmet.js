const helmet = require("helmet");

module.exports = helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            // Permitir conexiones a tu API y a Google
            "connect-src": [
                "'self'", 
                "http://localhost:5173", 
                "https://axel.informaticamajada.es", 
                "https://accounts.google.com"
            ],
            // Permitir scripts (Google Auth necesita unsafe-inline a veces)
            "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            // IMPORTANTE: Aquí añadimos Cloudinary y UI-Avatars que usas en el frontend
            "img-src": [
                "'self'", 
                "data:", 
                "https://lh3.googleusercontent.com",         // Fotos de Google
                "https://res.cloudinary.com",                // Tus imágenes subidas
                "https://ui-avatars.com",                    // Avatares por defecto
                "https://via.placeholder.com"                // Placeholders
            ],
            "frame-src": ["'self'", "https://accounts.google.com"], // Para el popup de Google
            "style-src": ["'self'", "'unsafe-inline'"], // Para que carguen estilos de librerías
            "font-src": ["'self'", "https://fonts.gstatic.com"], // Si usas Google Fonts
        },
    },
    // Esto es vital para que el login de Google no se bloquee por políticas de origen
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite cargar imágenes de otros dominios
});