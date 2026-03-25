require("dotenv").config();
const express = require("express");
const path = require("path");
const applySecurity = require("./middlewares"); 
const requestLogger = require("./middlewares/logMiddleware"); 
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const app = express();
const port = process.env.PORT || 3000;

// ============================
// RUTAS
// ============================
const userRoutes = require('./routes/userRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const uploadRoutes = require('./routes/uploadFileRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const searchRoutes = require('./routes/searchRoutes');
const activityRoutes = require('./routes/activityRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ============================
// SECURITY MIDDLEWARES
// ============================
applySecurity(app);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ============================
// SWAGGER
// ============================
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Documentación API Tribe',
      version: '1.0.0',
      description: 'API del proyecto Tribe desarrollada en Node.js',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Servidor en desarrollo'
      },
      {
        url: 'https://axel.informaticamajada.es', 
        description: 'Servidor en producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }] 
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// ============================
// REGISTRO DE RUTAS API
// ============================
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes); 
app.use('/api/catalog', catalogRoutes);
app.use('/api/files', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin', adminRoutes);

// SWAGGER
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// HEALTH CHECK
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Servidor seguro y funcionando" });
});


app.use((req, res) => {
    res.status(404).json({ error: "La ruta solicitada no existe." });
});


app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
});