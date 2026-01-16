const db = require("../config/dbconect");
const bcrypt = require("bcrypt");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const DEFAULT_BANNER =
  "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg";

// GET: Comprobar disponibilidad (Devuelve userId)
exports.checkUsername = async (req, res) => {
  try {
    // Usamos 'AS' en SQL para renombrar directamente
    const [rows] = await db.query(
      "SELECT user_id AS userId, username, email, avatar_url AS avatar FROM Users"
    );
    res.status(200).json(rows.length > 0 ? rows : []);
  } catch (error) {
    console.error("Error en checkUsername:", error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

// POST: Registrar usuario manual
exports.createUser = async (req, res) => {
  const {
    username,
    email,
    password,
    "g-recaptcha-response": captchaToken,
  } = req.body;

  if (!captchaToken)
    return res.status(400).json({ error: "Captcha requerido" });

  try {
    const params = new URLSearchParams();
    params.append("secret", SECRET_KEY);
    params.append("response", captchaToken);
    const googleResp = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params
    );

    if (!googleResp.data.success)
      return res.status(403).json({ error: "Captcha fallido" });
    if (!username || !email || !password)
      return res.status(400).json({ error: "Faltan datos" });

    const [existing] = await db.query(
      "SELECT email FROM Users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existing.length > 0)
      return res.status(409).json({ error: "Usuario o email ya existen" });

    const passwordHash = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO Users (username, email, password_hash, banner_url) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [
      username,
      email,
      passwordHash,
      DEFAULT_BANNER,
    ]);

    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(201).json({
      success: true,
      token,
      userId: result.insertId,
      username,
      avatar: null,
      banner: DEFAULT_BANNER,
      bio: "Hola! Soy nuevo en Tribe.",
    });
  } catch (error) {
    console.error("Error createUser:", error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

// POST: Login 
exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.status(400).json({ error: "Faltan datos" });

  try {
    const [users] = await db.query(
      "SELECT * FROM Users WHERE email=? OR username=?",
      [identifier, identifier]
    );
    if (users.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = users[0];
    if (!user.password_hash)
      return res.status(400).json({ error: "Usa Google Login" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.user_id, username: user.username ,role:user.role},
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(200).json({
      success: true,
      token,
      userId: user.user_id,
      username: user.username,
      avatar: user.avatar_url,
      banner: user.banner_url,
      bio: user.bio,
      role: user.role,
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// POST: Google Login 
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "No token" });

  try {
    const googleResponse = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    const { email, name, picture, sub: googleId } = googleResponse.data;

    const [existing] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
    let user;
    let isNewUser = false;

    if (existing.length > 0) {
      user = existing[0]; // Aquí ya obtenemos el user con su ROLE de la DB
    } else {
      const sql = "INSERT INTO Users (username, email, avatar_url, google_id, banner_url, role) VALUES (?, ?, ?, ?, ?, ?)";
      const [result] = await db.query(sql, [name, email, picture, googleId, DEFAULT_BANNER, 'user']);
      
      // Construimos el objeto para el nuevo usuario
      user = {
        user_id: result.insertId,
        username: name,
        email,
        avatar_url: picture,
        banner_url: DEFAULT_BANNER,
        bio: null,
        role: 'user' // Por defecto
      };
      isNewUser = true;
    }

    // --- CORRECCIÓN 1: INCLUIR EL ROLE EN EL JWT ---
    const appToken = jwt.sign(
      { id: user.user_id, username: user.username, role: user.role }, // <-- IMPORTANTE
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    // --- CORRECCIÓN 2: INCLUIR EL ROLE EN LA RESPUESTA ---
    res.status(200).json({
      success: true,
      token: appToken,
      isNewUser,
      user: {
        userId: user.user_id,
        username: user.username,
        avatar: user.avatar_url,
        banner: user.banner_url,
        bio: user.bio,
        email: user.email,
        role: user.role // <-- ESTO ES LO QUE NECESITA EL FRONTEND
      },
    });
  } catch (error) {
    console.error("Error Google:", error);
    res.status(401).json({ error: "Error auth" });
  }
};
// PUT: Update Profile
exports.updateProfile = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const userId = req.user.id;
  const { bio, avatarUrl, bannerUrl } = req.body;

  try {
    const fields = [];
    const values = [];

    if (bio !== undefined) {
      fields.push("bio = ?");
      values.push(bio);
    }
    if (avatarUrl !== undefined) {
      fields.push("avatar_url = ?");
      values.push(avatarUrl);
    }
    if (bannerUrl !== undefined) {
      fields.push("banner_url = ?");
      values.push(bannerUrl);
    }

    if (!fields.length) {
      return res.status(400).json({ error: "Nada que actualizar" });
    }

    values.push(userId);
    await db.query(
      `UPDATE Users SET ${fields.join(", ")} WHERE user_id = ?`,
      values
    );

    const [rows] = await db.query(
      `
      SELECT 
        user_id AS id,
        username,
        email,
        bio,
        avatar_url AS avatar,
        banner_url AS banner
      FROM Users
      WHERE user_id = ?
      `,
      [userId]
    );

    res.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("Error update:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
};

// GET: Feed de Usuarios
exports.getUserFeed = async (req, res) => {
  const myId = req.user.id;
  try {
    const sql = `
        SELECT 
            user_id AS userId, 
            username, 
            bio, 
            avatar_url AS avatar, 
            banner_url AS banner 
        FROM Users 
        WHERE user_id != ? 
        ORDER BY RAND() LIMIT 10
      `;
    const [rows] = await db.query(sql, [myId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error feed" });
  }
};

// GET: Colecciones del usuario
exports.getUserCollections = async (req, res) => {
  const userId = req.params.userId || req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT * FROM Collections WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error colecciones" });
  }
};

// PUT: Complete Profile (Onboarding)
exports.completeProfile = async (req, res) => {
  const { userId, avatarUrl, interests } = req.body;
  try {
    if (avatarUrl)
      await db.query("UPDATE Users SET avatar_url = ? WHERE user_id = ?", [
        avatarUrl,
        userId,
      ]);

    if (interests?.length > 0) {
      for (const cat of interests) {
        await db.query(
          "INSERT INTO Collections (user_id, collection_type, collection_name, cover_url) VALUES (?, ?, ?, ?)",
          [userId, cat, `Mis ${cat}`, null]
        );
      }
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error onboarding" });
  }
};
//GET: Get User by ID (Genérico)
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT 
        user_id AS id, 
        username, 
        email, 
        bio, 
        avatar_url AS avatar, 
        banner_url AS banner 
      FROM Users 
      WHERE user_id = ?
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error getUserById:", error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};
// GET: Get Users (Genérico)
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id AS userId, username, avatar_url AS avatar FROM Users"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error" });
  }
};
//GET: Actividad
exports.getActivityFeed = async (req, res) => {
  const userId = req.user.id;

  try {
    //Seguidos
    const sqlFollowing = `
            SELECT 
                c.collection_id, 
                c.collection_name, 
                c.collection_type, 
                c.cover_url, 
                c.created_at, 
                c.likes, -- Usamos tu columna de la tabla Collections
                u.user_id, 
                u.username, 
                u.avatar_url,
                'created' as action_type,
                -- Comprobamos si el usuario actual le dio like
                (SELECT COUNT(*) FROM Collection_Likes WHERE user_id = ? AND collection_id = c.collection_id) AS has_liked
            FROM Collections c
            JOIN Users u ON c.user_id = u.user_id
            JOIN Follows f ON c.user_id = f.following_id
            WHERE f.follower_id = ? AND c.is_private = 0
            ORDER BY c.created_at DESC
            LIMIT 20
        `;
    let [rows] = await db.query(sqlFollowing, [userId, userId]);

    // 2. Si no hay seguidos, consulta global
    if (rows.length === 0) {
      const sqlGlobal = `
                SELECT 
                    c.collection_id, 
                    c.collection_name, 
                    c.collection_type, 
                    c.cover_url, 
                    c.created_at, 
                    c.likes,
                    u.user_id, 
                    u.username, 
                    u.avatar_url,
                    'created_global' as action_type,
                    -- Comprobamos si el usuario actual le dio like
                    (SELECT COUNT(*) FROM Collection_Likes WHERE user_id = ? AND collection_id = c.collection_id) AS has_liked
                FROM Collections c
                JOIN Users u ON c.user_id = u.user_id
                WHERE c.is_private = 0
                ORDER BY c.created_at DESC
                LIMIT 20
            `;
      [rows] = await db.query(sqlGlobal, [userId]);
    }

    const results = rows.map(row => ({
      ...row,
      has_liked: row.has_liked > 0
    }));

    res.json(results);
  } catch (error) {
    console.error("Error en Activity Feed:", error);
    res.status(500).json({ error: "Error cargando el feed" });
  }
};

//Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // Obtenemos el ID del token (verificando ambos posibles nombres)
    const userId = req.user.id || req.user.user_id;

    // Detectar si db ya es una promesa (común en tu servidor)
    const pool = typeof db.promise === "function" ? db.promise() : db;

    // 1. SELECT usando 'Users' (exacto como en tu DB)
    const [rows] = await pool.execute(
      "SELECT password_hash FROM Users WHERE user_id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario no encontrado en el servidor" });
    }

    // 2. Verificación de la contraseña actual
    const isMatch = await bcrypt.compare(
      currentPassword,
      rows[0].password_hash
    );
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "La contraseña actual es incorrecta" });
    }

    // 3. Encriptación de la nueva clave
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. UPDATE usando 'Users'
    await pool.execute("UPDATE Users SET password_hash = ? WHERE user_id = ?", [
      hashedPassword,
      userId,
    ]);

    return res
      .status(200)
      .json({ message: "¡Contraseña actualizada correctamente!" });
  } catch (error) {
    console.error("DEBUG PRODUCCIÓN:", error);
    return res.status(500).json({
      error: "Error interno",
      details: error.message,
      sqlCode: error.code,
    });
  }
};

// Seguir
exports.followUser = async (req, res) => {
  const followerId = req.user.id; // Tú
  const followingId = req.params.id; // A quién sigues

  try {
    await db.query("INSERT INTO Follows (follower_id, following_id) VALUES (?, ?)", [followerId, followingId]);

    await db.query(
      "INSERT INTO Notifications (user_id, actor_id, type, content) VALUES (?, ?, 'follow', 'ha empezado a seguirte')",
      [followingId, followerId] 
    );

    res.json({ message: "Ahora sigues a este usuario" });
  } catch (error) {
    res.status(500).json({ error: "Error al dejar de seguir" });  
    
  }
};

// Dejar de seguir
exports.unfollowUser = async (req, res) => {
  const follower_id = req.user.id;
  const following_id = req.params.id;

  try {
    await db.query(
      "DELETE FROM Follows WHERE follower_id = ? AND following_id = ?",
      [follower_id, following_id]
    );
    res.json({ success: true, message: "Has dejado de seguir a este usuario" });
  } catch (error) {
    res.status(500).json({ error: "Error al dejar de seguir" });
  }
};

// Obtener Seguidores
exports.getFollowers = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT 
        u.user_id AS id,
        u.username,
        u.avatar_url AS avatar,
        u.bio
      FROM Users u
      JOIN Follows f ON u.user_id = f.follower_id
      WHERE f.following_id = ?
    `,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error followers:", error);
    res.status(500).json({ error: "Error al obtener seguidores" });
  }
};

// Obtener Seguidos
exports.getFollowing = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT 
        u.user_id AS id,
        u.username,
        u.avatar_url AS avatar,
        u.bio
      FROM Users u
      JOIN Follows f ON u.user_id = f.following_id
      WHERE f.follower_id = ?
    `,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error following:", error);
    res.status(500).json({ error: "Error al obtener seguidos" });
  }
};

// Estadísticas rápidas
exports.getFollowStats = async (req, res) => {
  const targetId = req.params.id;
  const myId = req.user?.id;

  try {
    const [followers] = await db.query(
      "SELECT COUNT(*) as total FROM Follows WHERE following_id = ?",
      [targetId]
    );
    const [following] = await db.query(
      "SELECT COUNT(*) as total FROM Follows WHERE follower_id = ?",
      [targetId]
    );

    let amIFollowing = false;
    if (myId) {
      const [check] = await db.query(
        "SELECT * FROM Follows WHERE follower_id = ? AND following_id = ?",
        [myId, targetId]
      );
      amIFollowing = check.length > 0;
    }

    res.json({
      followers: followers[0].total,
      following: following[0].total,
      amIFollowing,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener stats" });
  }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        await db.query(
            "INSERT INTO Password_Requests (email, status) VALUES (?, 'pending')",
            [email]
        );
        res.json({ message: "Solicitud enviada al administrador." });
    } catch (error) {
        res.status(500).json({ error: "Error al enviar solicitud" });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    console.log("== DEBUG RESET PASSWORD ==");
    console.log("Email:", email);
    console.log("Código recibido:", code);

    try {
        // 1. Verificamos si existe la solicitud aprobada con ese código en Password_Requests
        const [request] = await db.query(
            "SELECT * FROM Password_Requests WHERE email = ? AND code = ? AND status = 'completed'",
            [email, code]
        );

        console.log("Solicitud encontrada:", request.length > 0 ? "SÍ" : "NO");

        if (request.length === 0) {
            return res.status(400).json({ error: "Código o email incorrectos o solicitud no aprobada." });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [updateResult] = await db.query(
            "UPDATE Users SET password_hash = ? WHERE email = ?",
            [hashedPassword, email] 
        );

        console.log("Resultado update Users:", updateResult.affectedRows > 0 ? "ÉXITO" : "FALLO (Email no existe en Users)");

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: "No se encontró el usuario para actualizar." });
        }
        await db.query("DELETE FROM Password_Requests WHERE email = ?", [email]);

        res.json({ message: "Contraseña actualizada con éxito." });
    } catch (error) {
        console.error("ERROR CRÍTICO EN RESET:", error);
        res.status(500).json({ error: "Error al actualizar contraseña" });
    }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id; 

    const [rows] = await db.query(
      "SELECT user_id AS id, username, email, avatar_url AS avatar FROM Users WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error de servidor" });
  }
};