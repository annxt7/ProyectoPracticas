const db = require("../config/dbconect");

// GET: Obtener todos los usuarios y solicitudes pendientes
exports.getAdminData = async (req, res) => {
  try {
    // 1. Obtener Usuarios
    const [users] = await db.query(
      'SELECT user_id as id, username, email, role, avatar_url as avatar, reset_code FROM Users ORDER BY created_at DESC'
    );
    const [collections] = await db.query(`
      SELECT 
        c.collection_id as id, 
        c.collection_name as name, 
        u.username as owner_username, 
        u.avatar_url as owner_avatar
      FROM Collections c
      LEFT JOIN Users u ON c.user_id = u.user_id
      WHERE u.role != 'admin'
      ORDER BY c.created_at DESC
    `);

    // 3. Procesar las solicitudes de pass
    const requests = users
      .filter(u => u.reset_code === 'PENDIENTE')
      .map(u => ({
        id: u.id,
        email: u.email,
        status: 'pending',
        date: 'Reciente' 
      }));

    res.json({ 
      users,
      requests, 
      collections: collections.map(col => ({
        id: col.id,
        name: col.name,
        owner: {
          username: col.owner_username,
          avatar: col.owner_avatar
        }
      }))
    });
  } catch (error) {
    console.error("DETALLE DEL ERROR:", error); 
    res.status(500).json({ 
      error: "Error en el servidor", 
      sqlMessage: error.sqlMessage, 
    });
}
};

// POST: Aprobar reseteo de contraseña (generar código)
exports.approveReset = async (req, res) => {
  const { userId, code } = req.body;
  try {
    await db.query(
      'UPDATE Users SET reset_code = ? WHERE user_id = ?',
      [code, userId]
    );
    res.json({ success: true, message: "Código generado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al generar código" });
  }
};

// DELETE: Eliminar usuario o colección
exports.deleteEntity = async (req, res) => {
  const { type, id } = req.params;
  
  // Normalizamos a minúsculas y aceptamos singular o plural
  const entity = type.toLowerCase();
  const isUser = entity === 'user' || entity === 'users';
  
  const table = isUser ? 'Users' : 'Collections';
  const idField = isUser ? 'user_id' : 'collection_id'; 

  try {
    const [result] = await db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id]);
    
    if (result.affectedRows === 0) {
       return res.status(404).json({ error: "No se encontró el registro en la DB" });
    }

    res.json({ success: true, message: "Eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error de servidor" });
  }
};