const db = require('../config/dbconect'); 

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(`
      SELECT n.*, u.username as userName, u.avatar as userAvatar 
      FROM notifications n 
      JOIN users u ON n.actor_id = u.id 
      WHERE n.user_id = ? 
      ORDER BY n.created_at DESC
    `, [userId]);

    // Formateo para el frontend
    const formatted = rows.map(row => ({
      id: row.id,
      type: row.type,
      content: row.content,
      target: row.target,
      image: row.image,
      read: !!row.is_read,
      created_at: row.created_at,
      user: { id: row.actor_id, name: row.userName, avatar: row.userAvatar }
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// EXPORTACIÓN ÚNICA (Revisa que no haya nada debajo de esto)
module.exports = {
  getNotifications,
  markAllAsRead,
  markAsRead
};