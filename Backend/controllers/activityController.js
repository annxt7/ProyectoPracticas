const db = require("../config/dbconect");

// GET: Obtener todas las notificaciones del usuario
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT 
        n.id, 
        n.type, 
        n.content, 
        n.is_read, 
        n.created_at,
        u.username AS actorName,
        u.avatar_url AS actorAvatar
      FROM Notifications n
      LEFT JOIN Users u ON n.actor_id = u.user_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `;

    const [rows] = await db.query(sql, [userId]);

  const formattedNotifications = rows.map(n => {
  // 1. Limpiamos el texto: minúsculas y sin tildes básicas
  const rawContent = (n.content || "").toLowerCase();
  console.log("Procesando notificación ID:", n.id, "Texto:", rawContent); 

  let contentKey = "unknown";

  // 2. Buscamos por palabras clave raíz (sin importar el resto de la frase)
  if (rawContent.includes("gusta") || rawContent.includes("like")) {
    contentKey = "liked_collection";
  } 
  else if (rawContent.includes("siguiendo") || rawContent.includes("seguirte") || rawContent.includes("follow")) {
    contentKey = "started_following";
  } 
  else if (rawContent.includes("añadió") || rawContent.includes("added") || rawContent.includes("item")) {
    contentKey = "added_item";
  } 
  else if (rawContent.includes("creó") || rawContent.includes("created")) {
    contentKey = "created_collection";
  } 
  else if (rawContent.includes("comentó") || rawContent.includes("comment")) {
    contentKey = "comment";
  }

  return {
    id: n.id,
    type: n.type,
    content_key: contentKey, // Esta es la que lee t(`notifications.${content_key}`)
    read: n.is_read === 1,
    created_at: n.created_at,
    user: {
      name: n.actorName || "Usuario",
      avatar: n.actorAvatar
    }
  };
});

    console.log(`Sincronizado: ${formattedNotifications.length} notificaciones para ID ${userId}`);
    res.json(formattedNotifications);
  } catch (error) {
    console.error("Error en getNotifications:", error);
    res.status(500).json({ error: "Error al sincronizar notificaciones" });
  }
};

// PUT: Marcar una notificación como leída
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {

    const [result] = await db.query(
      "UPDATE Notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notificación no encontrada o no autorizada" });
    }

    res.json({ success: true, message: "Notificación actualizada" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar" });
  }
};

// PUT: Marcar todas como leídas
exports.markAllAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.query(
      "UPDATE Notifications SET is_read = 1 WHERE user_id = ?",
      [userId]
    );
    res.json({ success: true, message: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar todas" });
  }
};