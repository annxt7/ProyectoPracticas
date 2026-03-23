const uploadLimiter = require("express-rate-limit");

module.exports = uploadLimiter({
    windowMs: 5 * 60 * 1000, //  5 minutos
    max: 15,                 // 15 subidas cada 5 minutos
    message: { 
      error: "Has subido muchas imágenes seguidas. Espera un par de minutos." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});