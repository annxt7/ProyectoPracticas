require("dotenv").config();
const express = require("express");
const path = require("path");
const applySecurity = require("./middlewares"); 
const requestLogger = require("./middlewares/logMiddleware"); 
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); 
const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const uploadRoutes = require('./routes/uploadFileRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const searchRoutes = require('./routes/searchRoutes');
const activityRoutes = require('./routes/activityRoutes');
const adminRoutes = require('./routes/adminRoutes');

// SECURITY MIDDLEWARES
applySecurity(app);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// RUTAS 
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes); 
app.use('/api/catalog', catalogRoutes);
app.use('/api/files', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin', adminRoutes);

// HEALTH CHECK
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Servidor seguro y funcionando" });
});

app.use((req, res) => {
    res.status(404).json({ error: "La ruta solicitada no existe." });
});

app.listen(port, () => {
    console.log(`-------------------------------------------`);
    console.log(`✅ Servidor Tribe corriendo en puerto ${port}`);
    console.log(`📄 Swagger: https://axel.informaticamajada.es/api-docs`);
    console.log(`-------------------------------------------`);
});