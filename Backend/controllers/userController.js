const db = require("../config/dbconect");
const bcrypt = require("bcrypt");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const DEFAULT_BANNER = "https://salaocho.com/wp-content/uploads/2025/05/shaolin-soccer-screenshot.jpg";

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
  const { username, email, password, "g-recaptcha-response": captchaToken } = req.body;

  if (!captchaToken) return res.status(400).json({ error: "Captcha requerido" });

  try {
    const params = new URLSearchParams();
    params.append("secret", SECRET_KEY);
    params.append("response", captchaToken);
    const googleResp = await axios.post("https://www.google.com/recaptcha/api/siteverify", params);

    if (!googleResp.data.success) return res.status(403).json({ error: "Captcha fallido" });
    if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos" });

    const [existing] = await db.query("SELECT email FROM Users WHERE email = ? OR username = ?", [email, username]);
    if (existing.length > 0) return res.status(409).json({ error: "Usuario o email ya existen" });

    const passwordHash = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO Users (username, email, password_hash, banner_url) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [username, email, passwordHash, DEFAULT_BANNER]);

    const token = jwt.sign({ id: result.insertId, username }, process.env.JWT_SECRET, { expiresIn: "5h" });

    res.status(201).json({
      success: true,
      token,
      userId: result.insertId, 
      username,
      avatar: null,            
      banner: DEFAULT_BANNER  ,
      bio: 'Hola! Soy nuevo en Tribe.'
    });
  } catch (error) {
    console.error("Error createUser:", error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

// POST: Login (Normalizado)
exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ error: "Faltan datos" });

  try {
    const [users] = await db.query("SELECT * FROM Users WHERE email=? OR username=?", [identifier, identifier]);
    if (users.length === 0) return res.status(401).json({ error: "Credenciales inválidas" });

    const user = users[0];
    if (!user.password_hash) return res.status(400).json({ error: "Usa Google Login" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "5h" });

    res.status(200).json({
      success: true,
      token,
      userId: user.user_id,      
      username: user.username,
      avatar: user.avatar_url,     
      banner: user.banner_url,    
      bio: user.bio
    });

  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// POST: Google Login (Normalizado)
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "No token" });

  try {
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const { email, name, picture, sub: googleId } = googleResponse.data;
    
    const [existing] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
    let user, isNewUser = false;

    if (existing.length > 0) {
      user = existing[0];
    } else {
      const sql = "INSERT INTO Users (username, email, avatar_url, google_id, banner_url) VALUES (?, ?, ?, ?, ?)";
      const [result] = await db.query(sql, [name, email, picture, googleId, DEFAULT_BANNER]);
      user = { user_id: result.insertId, username: name, email, avatar_url: picture, banner_url: DEFAULT_BANNER, bio: null };
      isNewUser = true;
    }

    const appToken = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "5h" });

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
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error Google:", error);
    res.status(401).json({ error: "Error auth" });
  }
};

// PUT: Update Profile 
exports.updateProfile = async (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: "No autorizado" });
  
  const userId = req.user.id;
  const { bio, avatarUrl, bannerUrl } = req.body; // El frontend envía avatarUrl/bannerUrl (nombres de variable)

  try {
    let fields = [], values = [];
    // Mapeamos lo que llega del front a las columnas de la DB
    if (bio !== undefined) { fields.push("bio = ?"); values.push(bio); }
    if (avatarUrl !== undefined) { fields.push("avatar_url = ?"); values.push(avatarUrl); }
    if (bannerUrl !== undefined) { fields.push("banner_url = ?"); values.push(bannerUrl); }

    if (fields.length === 0) return res.status(400).json({ error: "Nada que actualizar" });

    values.push(userId);
    await db.query(`UPDATE Users SET ${fields.join(", ")} WHERE user_id = ?`, values);
    res.json({ 
      success: true, 
      user: { 
        bio, 
        avatar: avatarUrl, 
        banner: bannerUrl  
      } 
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
      const [rows] = await db.query("SELECT * FROM Collections WHERE user_id = ?", [userId]);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: "Error colecciones" });
    }
};

// PUT: Complete Profile (Onboarding)
exports.completeProfile = async (req, res) => {
    const { userId, avatarUrl, interests } = req.body;
    try {
      if (avatarUrl) await db.query("UPDATE Users SET avatar_url = ? WHERE user_id = ?", [avatarUrl, userId]);
      
      if (interests?.length > 0) {
        for (const cat of interests) {
            await db.query("INSERT INTO Collections (user_id, collection_type, collection_name, cover_url) VALUES (?, ?, ?, ?)", 
            [userId, cat, `Mis ${cat}`, null]);
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
        const [rows] = await db.query("SELECT user_id AS userId, username, avatar_url AS avatar FROM Users");
        res.json(rows);
    } catch (e) { res.status(500).json({ error: "Error" }); }
};