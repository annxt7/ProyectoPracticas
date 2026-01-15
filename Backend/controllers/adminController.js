const db = require("../config/dbconect");

// GET: Obtener todos los usuarios y solicitudes pendientes
exports.getAdminData = async (req, res) => {
    try {
       //Usuarios
        const [users] = await db.query(`
            SELECT 
                user_id AS id, 
                username, 
                email, 
                role, 
                avatar_url AS avatar 
            FROM Users
        `);

        //Solicitudes
        const [requests] = await db.query(`
            SELECT 
                id, 
                email, 
                status, 
                code AS codeGenerated, 
                DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS date 
            FROM Password_Requests 
            ORDER BY created_at DESC
        `);

        // Coleccione
        const [collections] = await db.query(`
            SELECT 
                c.collection_id AS id, 
                c.collection_name AS name, 
                c.item_count, 
                u.username AS owner_username,
                u.avatar_url AS owner_avatar,
                u.role AS owner_role
            FROM Collections c
            LEFT JOIN Users u ON c.user_id = u.user_id
        `);

        const formattedCollections = collections.map(col => ({
            id: col.id,
            name: col.name,
            item_count: col.item_count,
            owner: {
                username: col.owner_username,
                avatar: col.owner_avatar,
                role: col.owner_role
            }
        }));

        res.json({
            users,
            requests,
            collections: formattedCollections
        });

    } catch (error) {
        console.error("Error en getAdminData:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// POST: Aprobar reseteo de contraseña (generar código)
exports.approveReset = async (req, res) => {
  const { requestId, code } = req.body;
  try {
    await db.query(
            "UPDATE Password_Requests SET code = ?, status = 'completed' WHERE id = ?", 
            [code, requestId]
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