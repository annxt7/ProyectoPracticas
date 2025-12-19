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
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], 
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
        frameguard: { action: "deny" },
        referrerPolicy: { policy: "no-referrer" },
        hidePoweredBy: true,
        noSniff: true,
        xssFilter: true,
        hsts: {
            maxAge: 63072000,
            includeSubDomains: true,
            preload: true,
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "same-origin" },
    })
);
app.use(cors()); 
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