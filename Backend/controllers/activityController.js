const db = require('../config/dbconect'); 

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log("--- DEBUG BACKEND ---");
    console.log("Buscando notificaciones para el Usuario ID:", userId);

    const [rows] = await db.execute(`
      SELECT 
        n.id, n.type, n.content, n.target, n.image, 
        n.comment_snippet as commentSnippet,
        n.is_read as 'is_read', n.created_at,
        u.user_id as actorId, u.username as actorName, u.avatar_url as actorAvatar
      FROM Notifications n 
      LEFT JOIN Users u ON n.actor_id = u.user_id 
      WHERE n.user_id = ? 
      ORDER BY n.created_at DESC
    `, [userId]);
    
    console.log(`Filas encontradas en DB: ${rows.length}`);

    const formatted = rows.map(row => ({
      id: row.id,
      type: row.type,
      content: row.content,
      target: row.target,
      image: row.image,
      commentSnippet: row.commentSnippet,
      // Forzamos conversión a booleano para React
      read: row.is_read === 1 || row.is_read === true, 
      created_at: row.created_at,
      user: {
        id: row.actorId,
        name: row.actorName || "Usuario",
        avatar: row.actorAvatar
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error("ERROR CRÍTICO:", error);
    res.status(500).json({ error: "Error interno" });
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