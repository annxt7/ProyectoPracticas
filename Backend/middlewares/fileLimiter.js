const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
    windowMs: 5 * 60 * 1000, // Ventana de 5 minutos
    max: 15,                 // Permite 15 subidas cada 5 minutos
    message: { 
      error: "Has subido muchas imágenes seguidas. Espera un par de minutos." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});