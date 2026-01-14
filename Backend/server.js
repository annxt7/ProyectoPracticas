require("dotenv").config();
const express = require("express");
const applySecurity = require("./middlewares"); 
const dbconection = require("./config/dbconect");
const requestLogger = require("./middlewares/logMiddleware"); 
const logger = require("./config/logger");
const activityRoutes = require('./routes/activityRoutes');

// Importación de Rutas
const userRoutes = require('./routes/userRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const uploadRoutes = require('./routes/uploadFileRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT || 3000;

applySecurity(app);

// 2. MIDDLEWARES DE PARSEO
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 3. REGISTRO DE RUTAS API
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes); 
app.use('/api/catalog', catalogRoutes);
app.use('/api/files', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin', adminRoutes);

// 4. RUTA DE SALUD (Health Check)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Servidor seguro y funcionando 🚀" });
});

app.use((req, res) => {
    res.status(404).json({ error: "La ruta solicitada no existe." });
});

app.listen(port, () => {
    console.log(`-------------------------------------------`);
    console.log(`✅ Servidor Tribe corriendo en: http://localhost:${port}`);
    console.log(`🛡️  Seguridad modular activada`);
    console.log(`-------------------------------------------`);
});

