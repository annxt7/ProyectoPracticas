const db = require("../config/dbconect");
const bcrypt = require("bcrypt");

// GET: Obtener usuarios
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, email, avatar_url FROM Users"
    );
    if (rows.length === 0) {
      
        return res.status(200).json([]); 
    }

    res.status(200).json(rows);

  } catch (error) {
    console.error("Error en getUsers:", error);
    // 500: Error genérico del servidor
    res.status(500).json({ 
        error: "Error interno del servidor", 
    });
  }
};

// POST: Registrar usuario
exports.createUser = async (req, res) => { 
  const { username, email, password } = req.body;

  // Error 400: Faltan datos 
  if (!username || !email || !password) {
      return res.status(400).json({ 
          error: "Solicitud incorrecta", 
          details: "Faltan campos obligatorios: username, email o password" 
      });
  }

  try {
    const checkSql = "SELECT username, email FROM Users WHERE email = ? OR username = ?";
    const [existingUsers] = await db.query(checkSql, [email, username]);

    // Error 409: Conflicto (Ya existe)
    if (existingUsers.length > 0) {
       const user = existingUsers[0];
       if (user.email === email) {
           return res.status(409).json({ error: "Conflicto", details: "El email ya está registrado" });
       }
       if (user.username === username) {
           return res.status(409).json({ error: "Conflicto", details: "El nombre de usuario ya está en uso" });
       }
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [username, email, passwordHash]);

    // 201 Éxito al crear recurso
    res.status(201).json({
      message: "Usuario registrado con éxito",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Error en createUser:", error);

    // 503:Error en la base de datos
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
        return res.status(503).json({ error: "Servicio no disponible", details: "No se pudo conectar a la base de datos" });
    }

    // 4. Error 500: Fallo inesperado
    res.status(500).json({ error: "Error interno del servidor" });
  }
};