const db = require("../config/dbconect");

// GET: Obtener todos los usuarios y solicitudes pendientes
exports.getAdminData = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id as id, username, email, role, avatar_url as avatar, reset_code FROM Users ORDER BY created_at DESC'
    );

    const requests = users
      .filter(u => u.reset_code === 'PENDIENTE')
      .map(u => ({
        id: u.id,
        email: u.email,
        status: 'pending',
        date: 'Reciente' 
      }));

    res.json({ users, requests });
  } catch (error) {
    console.error("Error en getAdminData:", error);
    res.status(500).json({ error: "Error al obtener datos de administración" });
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
  const table = type === 'users' ? 'Users' : 'Collections';
  const idField = type === 'users' ? 'user_id' : 'collection_id'; 

  try {
    await db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id]);
    res.json({ success: true, message: `${type} eliminado correctamente` });
  } catch (error) {
    res.status(500).json({ error: "No se pudo eliminar el elemento" });
  }
};