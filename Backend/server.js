require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');
const collectionRoutes = require ('./routes/collectionRoutes');
const uploadRoutes= require ('./routes/uploadFileRoutes.js')
const catalogRoutes = require ('./routes/catalogRoutes');
const port = process.env.PORT || 3000; // Fallback por si .env falla
const dbconection = require("./config/dbconect");

const app = express();

// 1. CONFIGURACIÓN DE CORS
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://axel.informaticamajada.es" // Tu dominio de producción
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como Postman o Server-to-Server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// 2. PARSEO DE JSON (IMPORTANTE para el error 401)
// Debe ir ANTES de las rutas para poder leer req.body
app.use(express.json()); 

// 3. SEGURIDAD Y CABECERAS (HELMET)
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                "default-src": ["'self'"],
                "connect-src": ["'self'", ...allowedOrigins, "https://accounts.google.com", "https://www.googleapis.com"],
                "script-src": ["'self'", "https://accounts.google.com", "https://apis.google.com", "'unsafe-inline'", "https://axel.informaticamajada.es"],
                "frame-src": ["'self'", "https://accounts.google.com", "https://axel.informaticamajada.es"],
                "img-src": ["'self'", "data:", "https://lh3.googleusercontent.com", "https://axel.informaticamajada.es"],
                "style-src": ["'self'", "'unsafe-inline'"],
            },
        },
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    })
);

// Middleware de respaldo para forzar cabeceras si Helmet falla en algún navegador
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});

// 4. RUTAS
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes); 
app.use('/api/catalog', catalogRoutes);
app.use('/api/files', uploadRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});