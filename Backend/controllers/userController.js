const db = require("../config/dbconect");
const bcrypt = require("bcrypt");
const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { response } = require("express");
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// GET: Obtener usuarios
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, email, avatar_url FROM Users"
    );
    res.status(200).json(rows.length > 0 ? rows : []);
  } catch (error) {
    console.error("Error en getUsers:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST: Registrar usuario (con Captcha)
exports.createUser = async (req, res) => {
  const {
    username,
    email,
    password,
    "g-recaptcha-response": captchaToken,
  } = req.body;

  // 1. Verificación de Captcha
  if (!captchaToken) {
    return res.status(400).json({ error: "Por favor, completa el reCAPTCHA." });
  }
  try {
    const params = new URLSearchParams();
    params.append("secret", SECRET_KEY);
    params.append("response", captchaToken);

    const googleResp = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params
    );
    console.log("Respuesta de Google Captcha:", googleResp.data);
    if (!googleResp.data.success) {
      return res
        .status(403)
        .json({ error: "La verificación de seguridad ha fallado." });
    }
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: username, email o password",
      });
    }
    const checkSql =
      "SELECT username, email FROM Users WHERE email = ? OR username = ?";
    const [existingUsers] = await db.query(checkSql, [email, username]);

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      const detail =
        user.email === email
          ? "El email ya está registrado"
          : "El nombre de usuario ya está en uso";
      return res.status(409).json({ error: "Conflicto", details: detail });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [username, email, passwordHash]);
    const token = jwt.sign(
      { id: result.insertId, username: username },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    res.status(201).json({
      message: "¡Usuario creado con éxito!",
      userId: result.insertId, 
      token: token,
      username:username,
      success: true,
    });
  } catch (error) {
    console.error("Error en createUser:", error);
    res.status(500).json({ error: "Hubo un error en el servidor." });
  }
};

//POST:Actualizar perfil
exports.updateProfile = async (req, res) => {
  const userId = req.user.id; // Viene del token
  const { bio, avatarUrl } = req.body; // Recibimos bio y/o la url de la foto

  try {
    // MODIFICADO: Quitamos username, añadimos avatar_url
    const sql = `
      UPDATE Users 
      SET 
        bio = COALESCE(?, bio),
        avatar_url = COALESCE(?, avatar_url)
      WHERE user_id = ?
    `;

    // IMPORTANTE: El orden aquí debe coincidir con los '?' de arriba
    // 1º ? -> bio
    // 2º ? -> avatarUrl
    // 3º ? -> userId
    await db.query(sql, [bio, avatarUrl, userId]);

    res.json({ 
      success: true, 
      message: "Perfil actualizado correctamente",
      // Devolvemos los datos para que el frontend actualice el Contexto
      changes: { bio, avatarUrl } 
    });

  } catch (error) {
    console.error("Error updateProfile:", error);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};
//POST:LOGIN
exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const sql = "SELECT * FROM Users WHERE email=? OR username=?";
    const [users] = await db.query(sql, [identifier, identifier]);
    if (users.length === 0) {
      return res
        .status(401)
        .json({ error: "Usuario o constraseña incorrectos" });
    }
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    //Generar el token
    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    res.status(200).json({
      success: true,
      message: "Login exitoso",
      token: token, // <--- IMPORTANTE
      userId: user.user_id,
      username: user.username,
      avatar: user.avatar_url,
    });
  } catch {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST: Login con Google
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const googleResponse = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    const { email, name, picture, sub: googleId } = googleResponse.data;

    const [existingUser] = await db.query(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(200).json({
        message: "Bienvenido de nuevo con Google",
        userId: existingUser[0].user_id,
        success: true,
      });
    } else {
      const sql =
        "INSERT INTO Users (username, email, avatar_url, google_id) VALUES (?, ?, ?, ?)";
      const [result] = await db.query(sql, [name, email, picture, googleId]);
      return res.status(201).json({
        message: "Cuenta creada con Google",
        userId: result.insertId,
        success: true,
      });
    }
  } catch (error) {
    console.error("Error con Google Login:", error);
    res.status(401).json({ error: "El token de Google no es válido" });
  }
};

// POST: Finalizar configuración de perfil
exports.completeProfile = async (req, res) => {
  const { userId, avatarUrl, interests } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "ID de usuario no proporcionado" });
  }

  try {
    if (avatarUrl) {
      await db.query("UPDATE Users SET avatar_url = ? WHERE user_id = ?", [
        avatarUrl,
        userId,
      ]);
    }
    if (interests && interests.length > 0) {
      for (const category of interests) {
        const name =
          category === "Music"
            ? "Mi Música"
            : category === "Books"
            ? "Mis Libros"
            : category === "Movies"
            ? "Mis Pelis"
            : category === "Games"
            ? "Mis Juegos"
            : "Mis Series";
        const sql = `
          INSERT INTO Collections (user_id, collection_type, collection_name, collection_description) 
          VALUES (?, ?, ?, ?)
        `;
        await db.query(sql, [
          userId,
          category,
          name,
          `Colección automática de ${category}`,
        ]);
      }
    }
    res.status(200).json({
      success: true,
      message: "¡Perfil completado y colecciones creadas!",
    });
  } catch (error) {
    console.error("Error en completeProfile:", error);
    res.status(500).json({ error: "Error interno al procesar el perfil" });
  }
};
