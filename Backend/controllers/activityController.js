const db = require('../config/dbconect'); 

const getNotifications = async (req, res) => {
  try {
    // 1. Extraemos los datos del usuario del token
    const userId = req.user.id; 
    const username = req.user.username || req.user.name;

    console.log("======= DEBUG ACTIVIDAD =======");
    console.log("Petición recibida de:", { userId, username });

    // 2. Consulta robusta: Buscamos por ID o por Username para asegurar
    const [rows] = await db.execute(`
      SELECT 
        n.id, n.type, n.content, n.target, n.image, 
        n.comment_snippet as commentSnippet,
        n.is_read as 'is_read', n.created_at,
        u_actor.username as actorName, 
        u_actor.avatar_url as actorAvatar
      FROM Notifications n
      INNER JOIN Users u_owner ON n.user_id = u_owner.user_id
      LEFT JOIN Users u_actor ON n.actor_id = u_actor.user_id
      WHERE u_owner.user_id = ? OR u_owner.username = ?
      ORDER BY n.created_at DESC
    `, [userId, username]);
    
    console.log(`Resultado SQL: ${rows.length} notificaciones encontradas.`);

    // 3. Formateo de datos para el Frontend
    const formatted = rows.map(row => ({
      id: row.id,
      type: row.type,
      content: row.content,
      target: row.target,
      image: row.image,
      commentSnippet: row.commentSnippet,
      // Sincronización de lectura (booleano)
      read: Boolean(row.is_read), 
      created_at: row.created_at,
      user: {
        name: row.actorName || "Usuario",
        avatar: row.actorAvatar
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ ERROR EN ACTIVITY:", error);
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