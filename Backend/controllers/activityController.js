const db = require('../config/dbconect'); 

const getNotifications = async (req, res) => {
  try {
    // Asumimos que tu middleware de auth guarda el username en req.user.username
    const username = req.user.username || req.user.name; 

    if (!username) {
      return res.status(400).json({ error: "No se identificó el nombre de usuario" });
    }

    console.log("--- DEBUG BACKEND ---");
    console.log("Buscando notificaciones para el username:", username);

    const [rows] = await db.execute(`
      SELECT 
        n.id, n.type, n.content, n.target, n.image, 
        n.comment_snippet as commentSnippet,
        n.is_read as 'is_read', n.created_at,
        u_actor.username as actorName, u_actor.avatar_url as actorAvatar
      FROM Notifications n
      -- JOIN para encontrar al DUEÑO de la notificación por su username
      JOIN Users u_owner ON n.user_id = u_owner.user_id
      -- LEFT JOIN para traer los datos de quien hizo la acción (el actor)
      LEFT JOIN Users u_actor ON n.actor_id = u_actor.user_id
      WHERE u_owner.username = ? 
      ORDER BY n.created_at DESC
    `, [username]);
    
    console.log(`Filas encontradas para ${username}: ${rows.length}`);

    const formatted = rows.map(row => ({
      id: row.id,
      type: row.type,
      content: row.content,
      target: row.target,
      image: row.image,
      commentSnippet: row.commentSnippet,
      read: row.is_read === 1 || row.is_read === true,
      created_at: row.created_at,
      user: {
        name: row.actorName || "Usuario",
        avatar: row.actorAvatar
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error en ActivityController:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await db.execute('UPDATE Notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await db.execute('UPDATE Notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getNotifications, markAllAsRead, markAsRead };