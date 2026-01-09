const helmet = require("helmet");

module.exports = helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "connect-src": ["'self'", "http://localhost:5173", "https://axel.informaticamajada.es", "https://accounts.google.com"],
            "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            "img-src": ["'self'", "data:", "https://lh3.googleusercontent.com"],
        },
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
});