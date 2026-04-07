const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: "Demasiadas peticiones desde esta IP." }
});