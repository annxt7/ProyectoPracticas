const db = require('../config/dbconect'); 

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log("DB Query: Buscando notificaciones para User ID:", userId);

    const [rows] = await db.execute(`
      SELECT 
        n.id, n.type, n.content, n.target, n.image, 
        n.comment_snippet as commentSnippet,
        n.is_read as 'isRead', n.created_at,
        u.user_id as actorId, u.username as actorName, u.avatar_url as actorAvatar
      FROM Notifications n 
      LEFT JOIN Users u ON n.actor_id = u.user_id 
      WHERE n.user_id = ? 
      ORDER BY n.created_at DESC
    `, [userId]);
    
    console.log(`DB Query: Se encontraron ${rows.length} filas.`);

    const formatted = rows.map(row => ({
      id: row.id,
      type: row.type,
      content: row.content,
      target: row.target,
      image: row.image,
      commentSnippet: row.commentSnippet,
      read: row.isRead === 1 || row.isRead === true, // Forzamos booleano
      created_at: row.created_at,
      user: {
        id: row.actorId,
        name: row.actorName || "Usuario",
        avatar: row.actorAvatar
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error detallado en ActivityController:", error);
    res.status(500).json({ error: "No se pudo cargar la actividad" });
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