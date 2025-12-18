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
app.use(helmet());
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