const db = require("../config/dbconect");
const bcrypt = require("bcrypt");
const axios = require("axios");
require('dotenv').config(); 

// --- CONFIGURACIÓN DE SEGURIDAD ---
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// GET: Obtener usuarios
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT user_id, username, email, avatar_url FROM Users");
    res.status(200).json(rows.length > 0 ? rows : []);
  } catch (error) {
    console.error("Error en getUsers:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST: Registrar usuario (con Captcha)
exports.createUser = async (req, res) => {
  const { username, email, password, "g-recaptcha-response": captchaToken } = req.body;

  // 1. Verificación de Captcha
  if (!captchaToken) {
    return res.status(400).json({ error: "Por favor, completa el reCAPTCHA." });
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", SECRET_KEY);
    params.append("response", captchaToken);

    const googleResp = await axios.post("https://www.google.com/recaptcha/api/siteverify", params);

    if (!googleResp.data.success) {
      return res.status(403).json({ error: "La verificación de seguridad ha fallado." });
    }

    // 2. Comprobar datos obligatorios
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios: username, email o password" });
    }

    // --- LÍNEA AÑADIDA: Buscar si el usuario ya existe ---
    const checkSql = "SELECT username, email FROM Users WHERE email = ? OR username = ?";
    const [existingUsers] = await db.query(checkSql, [email, username]);

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      const detail = user.email === email ? "El email ya está registrado" : "El nombre de usuario ya está en uso";
      return res.status(409).json({ error: "Conflicto", details: detail });
    }

    // 3. Hashear contraseña y Guardar
    const passwordHash = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [username, email, passwordHash]);

    res.status(201).json({
      message: "¡Usuario creado con éxito!",
      userId: result.insertId, // Importante para la pasarela
      success: true,
    });

  } catch (error) {
    console.error("Error en createUser:", error);
    res.status(500).json({ error: "Hubo un error en el servidor." });
  }
};

// POST: Login con Google
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const { email, name, picture, sub: googleId } = googleResponse.data;

    const [existingUser] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res.status(200).json({
        message: "Bienvenido de nuevo con Google",
        userId: existingUser[0].user_id,
        success: true
      });
    } else {
      const sql = "INSERT INTO Users (username, email, avatar_url, google_id) VALUES (?, ?, ?, ?)";
      const [result] = await db.query(sql, [name, email, picture, googleId]);
      return res.status(201).json({
        message: "Cuenta creada con Google",
        userId: result.insertId,
        success: true
      });
    }
  } catch (error) {
    console.error("Error con Google Login:", error);
    res.status(401).json({ error: "El token de Google no es válido" });
  }
};

exports.completeProfile = async (req, res) => {
  const { userId, avatarUrl, selectedCategories } = req.body;

  try {
    // 1. Guardamos la foto en la tabla Users
    await db.query("UPDATE Users SET avatar_url = ? WHERE user_id = ?", [avatarUrl, userId]);

    // 2. Creamos las colecciones automáticamente
    // selectedCategories es un array como ['Music', 'Books']
    if (selectedCategories && selectedCategories.length > 0) {
      
      // Preparamos las consultas para crear las carpetas por defecto
      for (const category of selectedCategories) {
        const collectionName = `Mis ${category === 'Music' ? 'Canciones' : 
                                  category === 'Books' ? 'Libros' : 
                                  category === 'Movies' ? 'Películas' : 
                                  category === 'Games' ? 'Juegos' : 'Series'}`;

        const sql = "INSERT INTO Collections (user_id, collection_type, collection_name, collection_description) VALUES (?, ?, ?, ?)";
        await db.query(sql, [userId, category, collectionName, `Mi colección personal de ${category}`]);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "¡Perfil configurado y colecciones creadas!" 
    });

  } catch (error) {
    console.error("Error al completar perfil:", error);
    res.status(500).json({ error: "No se pudieron crear las colecciones iniciales." });
  }
};