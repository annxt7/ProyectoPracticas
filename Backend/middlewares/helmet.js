const helmet = require("helmet");

module.exports = helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
           
            "connect-src": [
                "'self'", 
                "http://localhost:5173", 
                "https://axel.informaticamajada.es", 
                "https://accounts.google.com"
            ],
         
            "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            "img-src": [
                "'self'", 
                "data:", 
                "https://lh3.googleusercontent.com",        
                "https://res.cloudinary.com",               
                "https://ui-avatars.com",                   
                "https://via.placeholder.com"               
            ],
            "frame-src": ["'self'", "https://accounts.google.com"], 
            "style-src": ["'self'", "'unsafe-inline'"], 
            "font-src": ["'self'", "https://fonts.gstatic.com"], 
        },
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" }, 
});