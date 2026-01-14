const db = require('../config/dbconect'); 

const getNotifications = async (req, res) => {
  try {
    // Sincronizamos con el ID del token para que siempre sea el usuario logueado
    const userId = req.user.id; 

    const [rows] = await db.execute(`
      SELECT n.*, u.username as actorName, u.avatar_url as actorAvatar
      FROM Notifications n
      LEFT JOIN Users u ON n.actor_id = u.user_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `, [userId]);

    const formatted = rows.map(row => ({
      id: row.id,
      // Mapeo de tipos para que el Frontend entienda 'like_collection' como 'interactions'
      type: row.type === 'like_collection' ? 'interactions' : row.type,
      content: row.content,
      // Convertimos el 0/1 de MariaDB a true/false de JS
      read: Boolean(row.is_read), 
      created_at: row.created_at,
      user: {
        name: row.actorName || "Usuario",
        avatar: row.actorAvatar
      }
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Error de sincronización" });
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