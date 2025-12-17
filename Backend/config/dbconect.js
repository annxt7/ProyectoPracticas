require("dotenv").config();
const mysql = require("mysql2/promise");
require("dotenv").config(); // Cargar variables de entorno

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER ,
  password: process.env.DB_PSS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Conectado a la Base de Datos MySQL 'Tribe'");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Error conectando a la BD:", err);
  });

module.exports = pool;

