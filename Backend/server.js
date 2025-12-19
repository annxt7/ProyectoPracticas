require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');
const collectionRoutes = require ('./routes/collectionRoutes');
const catalogRoutes = require ('./routes/catalogRoutes');
const port = process.env.PORT;
const dbconection = require("./config/dbconect");


const app = express();
// MIDDLEWARES 
const allowedOrigins = [
    "http://localhost:5173",
    "https://axel.informaticamajada.es"
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitimos peticiones sin origen (como Postman) o las que estén en la lista
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// 2. Configuración de HELMET
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                "default-src": ["'self'"],
                "connect-src": [
                    "'self'", 
                    "http://localhost:3000", 
                    "https://axel.informaticamajada.es", // Tu dominio de producción
                    "https://accounts.google.com", 
                    "https://www.googleapis.com"
                ],
                "script-src": [
                    "'self'", 
                    "https://accounts.google.com", 
                    "'unsafe-inline'",
                    "https://axel.informaticamajada.es"
                ],
                "frame-src": [
                    "'self'", 
                    "https://accounts.google.com",
                    "https://axel.informaticamajada.es"
                ],
                "img-src": [
                    "'self'", 
                    "data:", 
                    "https://lh3.googleusercontent.com", // Fotos de Google
                    "https://axel.informaticamajada.es"
                ],
                "style-src": ["'self'", "'unsafe-inline'"],
            },
        },
        // Mantenemos la compatibilidad con el Popup de Google
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);
app.use(express.json());

// RUTAS 
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes); // <--- NUEVO
app.use('/api/catalog', catalogRoutes);

// Ruta base de prueba
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});