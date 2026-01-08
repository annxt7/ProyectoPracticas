const db = require("../config/dbconect");
const bcrypt = require("bcrypt");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const DEFAULT_BANNER = "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg";

// GET: Comprobar disponibilidad de username
exports.checkUsername = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, email, avatar_url FROM Users"
    );
    res.status(200).json(rows.length > 0 ? rows : []);
  } catch (error) {
    console.error("Error en checkUsername:", error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

// POST: Registrar usuario manual (con Captcha)
exports.createUser = async (req, res) => {
  const {
    username,
    email,
    password,
    "g-recaptcha-response": captchaToken,
  } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ error: "Por favor, completa el reCAPTCHA." });
  }

  try {
    // Verificar Captcha con Google
    const params = new URLSearchParams();
    params.append("secret", SECRET_KEY);
    params.append("response", captchaToken);

    const googleResp = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params
    );

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

    // Verificar si ya existe
    const checkSql =
      "SELECT username, email FROM Users WHERE email = ? OR username = ?";
    const [existingUsers] = await db.query(checkSql, [email, username]);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      const detail =
        existingUser.email === email
          ? "El email ya está registrado"
          : "El nombre de usuario ya está en uso";
      return res.status(409).json({ error: "Conflicto", details: detail });
    }

    // Crear usuario
    const passwordHash = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO Users (username, email, password_hash, banner_url) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [username, email, passwordHash, DEFAULT_BANNER]);

    const token = jwt.sign(
      { id: result.insertId, username: username },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(201).json({
      success: true,
      message: "¡Usuario creado con éxito!",
      userId: result.insertId,
      username: username,
      token: token,
      banner: DEFAULT_BANNER 
    });
  } catch (error) {
    console.error("Error en createUser:", error);
    res.status(500).json({ error: "Hubo un error en el servidor." });
  }
};

// PUT: Actualizar perfil (MODIFICADO PARA BANNER)

// userController.js - Reemplaza SOLAMENTE la función updateProfile

exports.updateProfile = async (req, res) => {
  // 1. Verificación de seguridad
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Usuario no autenticado (Token inválido)" });
  }

  const userId = req.user.id;
  const { bio, avatarUrl, bannerUrl } = req.body;

  console.log("--- INTENTO DE UPDATE ---");
  console.log("Usuario ID:", userId);
  console.log("Datos recibidos:", req.body);

  try {
    // 2. CONSTRUCCIÓN DINÁMICA DE LA SQL
    // Esto evita errores si algún campo es undefined
    let fieldsToUpdate = [];
    let valuesToUpdate = [];

    // Solo añadimos a la SQL los campos que vienen en el body
    if (bio !== undefined) {
      fieldsToUpdate.push("bio = ?");
      valuesToUpdate.push(bio);
    }
    if (avatarUrl !== undefined) {
      fieldsToUpdate.push("avatar_url = ?");
      valuesToUpdate.push(avatarUrl);
    }
    if (bannerUrl !== undefined) {
      fieldsToUpdate.push("banner_url = ?");
      valuesToUpdate.push(bannerUrl);
    }

    // Si no hay nada que actualizar, devolvemos error (así no hacemos llamada a la BD)
    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: "No se enviaron datos para actualizar" });
    }

    // Añadimos el ID al final de los valores (para el WHERE)
    valuesToUpdate.push(userId);

    // Unimos las partes de la SQL
    const sql = `UPDATE Users SET ${fieldsToUpdate.join(", ")} WHERE user_id = ?`;

    console.log("SQL Generada:", sql);
    console.log("Valores:", valuesToUpdate);

    // 3. Ejecutar consulta
    const [result] = await db.query(sql, valuesToUpdate);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado en la base de datos" });
    }

    // 4. Éxito
    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: { bio, avatar: avatarUrl, banner: bannerUrl }
    });

  } catch (error) {
    console.error("ERROR CRÍTICO SQL:", error);
    // IMPORTANTE: Esto enviará el error exacto al navegador para que lo leas
    res.status(500).json({ 
      error: "Error interno del servidor", 
      sqlMessage: error.sqlMessage || error.message,
      code: error.code 
    });
  }
};

// POST: LOGIN (CORREGIDO PARA DEVOLVER BANNER)
exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ error: "Faltan datos" });

  try {
    const sql = "SELECT * FROM Users WHERE email=? OR username=?";
    const [users] = await db.query(sql, [identifier, identifier]);

    if (users.length === 0) return res.status(401).json({ error: "Credenciales inválidas" });

    const user = users[0];

    if (!user.password_hash) {
        return res.status(400).json({ 
            error: "Cuenta de Google. Inicia sesión con Google." 
        });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      token: token,
      userId: user.user_id,
      username: user.username,
      avatar: user.avatar_url,
      banner: user.banner_url, // <--- AÑADIDO: Devolvemos el banner
      bio: user.bio // <--- AÑADIDO: Devolvemos la bio
    });

  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// POST: Google Login (CORREGIDO PARA DEVOLVER BANNER)
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "No token" });

  try {
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const { email, name, picture, sub: googleId } = googleResponse.data;
    
    const [existingUser] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);

    let user;
    let isNewUser = false;

    if (existingUser.length > 0) {
      user = existingUser[0];
      isNewUser = false;
    } else {
      const sql =
        "INSERT INTO Users (username, email, avatar_url, google_id, banner_url) VALUES (?, ?, ?, ?, ?)";
        
      // Pasamos DEFAULT_BANNER al final
      const [result] = await db.query(sql, [name, email, picture, googleId, DEFAULT_BANNER]);

      user = {
        user_id: result.insertId,
        username: name,
        email: email,
        avatar_url: picture,
        banner_url: DEFAULT_BANNER, // <--- Asignamos la constante aquí
      };
      isNewUser = true;
    }

    const appToken = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "5h" });

    return res.status(200).json({
      success: true,
      token: appToken,
      user: {
        userId: user.user_id,
        username: user.username,
        avatar: user.avatar_url,
        banner: user.banner_url, // <--- AÑADIDO
        email: user.email,
        bio: user.bio
      },
      isNewUser: isNewUser,
    });
  } catch (error) {
    console.error("Error Google:", error);
    res.status(401).json({ error: "Error auth" });
  }
};

// ... (completeProfile y getUsers se quedan igual) ...
exports.completeProfile = async (req, res) => {
    // Pega aquí tu función completeProfile original
    // Es correcta.
    const { userId, avatarUrl, interests } = req.body;
    // ...
    res.status(200).json({ success: true });
};

exports.getUsers = async (req, res) => {
    const [rows] = await db.query("SELECT user_id, username, email, avatar_url FROM Users");
    res.status(200).json(rows);
};
// PUT: Añadir intereses y foto de perfil (Gateway post-registro)
exports.completeProfile = async (req, res) => {
  const { userId, username, avatarUrl, interests } = req.body;

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
    res.status(500).json({ error: "Error al procesar el perfil" });
  }
};

// GET: Obtener usuarios
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, email, avatar_url FROM Users"
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};