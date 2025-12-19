const db = require("../config/dbconect");
const bcrypt = require("bcrypt");
const axios = require("axios");
require('dotenv').config();

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// 1. GET: Verificar disponibilidad de username (Para el Onboarding Paso 0)
exports.checkUsername = async (req, res) => {
  try {
    // 1. Extraemos el parámetro
    let { username } = req.params;
    
    // 2. LIMPIEZA: Eliminamos el ":1" o cualquier cosa tras los dos puntos
    // Esto convierte "mano:1" en simplemente "mano"
    const cleanUsername = username.split(':')[0].trim().toLowerCase();

    console.log("Validando usuario limpio:", cleanUsername);

    const [rows] = await db.query(
      "SELECT user_id FROM Users WHERE username = ?", 
      [cleanUsername]
    );

    return res.status(200).json({ 
      success: true,
      available: rows.length === 0 
    });
  } catch (error) {
    console.error("Error en checkUsername:", error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

// 2. POST: Registrar usuario manual (con Captcha)
exports.createUser = async (req, res) => {
  const { username, email, password, "g-recaptcha-response": captchaToken } = req.body;

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

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const [existingUsers] = await db.query(
      "SELECT email, username FROM Users WHERE email = ? OR username = ?", 
      [email, username]
    );

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      const detail = user.email === email ? "El email ya está registrado" : "El nombre de usuario ya está en uso";
      return res.status(409).json({ error: detail });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [username, email, passwordHash]);

    res.status(201).json({
      success: true,
      userId: result.insertId,
      username: username // Se devuelve para saltar el Paso 0 en Onboarding
    });

  } catch (error) {
    console.error("Error en createUser:", error);
    res.status(500).json({ error: "Hubo un error en el servidor." });
  }
};

// 3. POST: Login con Google
exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // Verificación del token con Google
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const { email, picture, sub: googleId, name } = googleResponse.data;

    // Buscamos si el usuario ya existe por email o google_id
    const [existingUser] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      
      // Si el usuario ya existe, comprobamos si ya completó su perfil (ej. si ya tiene intereses)
      // Asumimos que si no tiene intereses guardados, debe ir al onboarding
      const [interests] = await db.query("SELECT * FROM UserInterests WHERE user_id = ?", [user.user_id]);
      const needsOnboarding = interests.length === 0;

      return res.status(200).json({
        success: true,
        isNewUser: needsOnboarding, 
        userId: user.user_id,
        username: user.username, // Enviamos el username real, ya no es null
        avatarUrl: user.avatar_url
      });

    } else {
      // REGISTRO NUEVO: El username de Google es el definitivo
      // Limpiamos el nombre (quitamos espacios) y añadimos un sufijo aleatorio corto para evitar duplicados
      const cleanName = name.replace(/\s+/g, '').toLowerCase();
      const finalUsername = `${cleanName}${Math.floor(1000 + Math.random() * 9000)}`;
      
      const sql = "INSERT INTO Users (username, email, avatar_url, google_id) VALUES (?, ?, ?, ?)";
      const [result] = await db.query(sql, [finalUsername, email, picture, googleId]);
      
      return res.status(201).json({
        success: true,
        isNewUser: true, 
        userId: result.insertId,
        username: finalUsername, // Este es el nombre que se queda
        avatarUrl: picture,
        message: "Cuenta creada exitosamente"
      });
    }

  } catch (error) {
    console.error("Error en googleLogin:", error.message);
    res.status(401).json({ 
      success: false, 
      error: "Fallo en la autenticación" 
    });
  }
};

// 4. PUT: Finalizar configuración de perfil (Actualiza Username, Avatar e Intereses)
exports.completeProfile = async (req, res) => {
  const { userId, username, avatarUrl, interests } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "ID de usuario no proporcionado" });
  }

  try {
    // Actualizamos username y avatar simultáneamente
    await db.query(
      "UPDATE Users SET username = COALESCE(?, username), avatar_url = COALESCE(?, avatar_url) WHERE user_id = ?", 
      [username, avatarUrl, userId]
    );

    // Crear colecciones automáticas según los intereses
    if (interests && interests.length > 0) {
      const values = interests.map(category => {
        const name = category === 'Music' ? 'Mi Música' :
                    category === 'Books' ? 'Mis Libros' :
                    category === 'Movies' ? 'Mis Pelis' :
                    category === 'Games' ? 'Mis Juegos' : 'Mis Series';
        return [userId, category, name, `Colección automática de ${category}`];
      });

      const sql = "INSERT INTO Collections (user_id, collection_type, collection_name, collection_description) VALUES ?";
      await db.query(sql, [values]);
    }

    res.status(200).json({ success: true, message: "Perfil completado" });

  } catch (error) {
    console.error("Error en completeProfile:", error);
    res.status(500).json({ error: "Error al procesar el perfil" });
  }
};

// 5. GET: Obtener usuarios (opcional para pruebas)
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT user_id, username, email, avatar_url FROM Users");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};