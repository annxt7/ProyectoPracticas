const db = require("../config/dbconect");

// Crear una colección nueva
exports.createCollection = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Usuario no identificado" });
  }

  const user_id = req.user.id;
  const { 
    name, collection_name, 
    type, collection_type, 
    description, collection_description, 
    is_private, 
    cover_url 
  } = req.body;

  const finalName = collection_name || name || "Mi Nueva Colección";
  const finalType = collection_type || type || 'Otros';
  const finalDesc = collection_description || description || "";
  const finalPrivate = is_private ? 1 : 0;
  const finalCover = cover_url || '';

  try {
    const sql = `
      INSERT INTO Collections 
      (user_id, collection_name, collection_type, collection_description, is_private, cover_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      user_id, 
      finalName, 
      finalType, 
      finalDesc, 
      finalPrivate, 
      finalCover 
    ]);

    res.status(201).json({ 
        success: true,
        message: "Colección creada", 
        collection_id: result.insertId,
        cover_url: finalCover // Devolvemos la imagen generada por si el front la necesita
    });

  } catch (error) {
    console.error("ERROR SQL:", error);
    res.status(500).json({ error: "Error de base de datos" });
  }
};

// Obtener todas las colecciones de un usuario 
exports.getUserCollections = async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = "SELECT * FROM Collections WHERE user_id = ?";
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener colecciones" });
    }
};

// Ver el detalle de una colección 
exports.getCollectionDetails = async (req, res) => {
    const { id } = req.params; 

    try {
        const sqlCollection = `
            SELECT 
                c.collection_id, c.collection_name, c.collection_description, 
                c.collection_type, c.cover_url, c.likes, c.created_at,
                c.user_id,
                u.username AS creator_username, 
                u.avatar_url AS creator_avatar,
                u.user_id AS creator_id
            FROM Collections c
            LEFT JOIN Users u ON c.user_id = u.user_id
            WHERE c.collection_id = ?
        `;

        const [collectionRows] = await db.query(sqlCollection, [id]);
        
        if (collectionRows.length === 0) {
            return res.status(404).json({ error: "Colección no encontrada" });
        }

        const collection = collectionRows[0];
        const itemsSql = `
            SELECT 
                i.item_id, 
                i.item_type, 
                i.custom_description,
                COALESCE(i.custom_title, m.title, b.title, mov.title, s.title, g.title) AS display_title,
                COALESCE(i.custom_subtitle, m.artist, b.author, mov.director, g.developer, 'Varios') AS display_subtitle,
                COALESCE(i.custom_image, m.cover_url, b.cover_url, mov.poster_url, s.poster_url, g.poster_url) AS display_image
            FROM Items i
            LEFT JOIN Catalog_Music m ON i.music_id = m.music_id
            LEFT JOIN Catalog_Books b ON i.book_id = b.book_id
            LEFT JOIN Catalog_Movies mov ON i.movie_id = mov.movie_id
            LEFT JOIN Catalog_Shows s ON i.show_id = s.show_id
            LEFT JOIN Catalog_Games g ON i.game_id = g.game_id
            WHERE i.collection_id = ?
        `;
        
        const [items] = await db.query(itemsSql, [id]);
        
        res.json({ ...collection, items });

    } catch (error) {
        console.error("Error cargando colección:", error);
        res.status(500).json({ error: "Error de servidor", details: error.message });
    }
};

// Añadir un item a la colección
exports.addItemToCollection = async (req, res) => {
  const { collection_id } = req.params;
  const { 
    item_type, 
    reference_id, 
    custom_title, 
    custom_subtitle, 
    custom_description,
    custom_image
  } = req.body;

  const columnMap = {
    'music': 'music_id',
    'books': 'book_id',
    'movies': 'movie_id',
    'shows': 'show_id',
    'games': 'game_id'
  };

  try {
    let sql = "";
    let params = [];

    const typeLower = item_type ? item_type.toLowerCase() : 'custom';
    const colName = columnMap[typeLower];

    if (reference_id && colName) {
        sql = `INSERT INTO Items (collection_id, item_type, ${colName}) VALUES (?, ?, ?)`;
        params = [collection_id, typeLower, reference_id];
    } 
    else {
        sql = `INSERT INTO Items (collection_id, item_type, custom_title, custom_subtitle, custom_description, custom_image) VALUES (?, ?, ?, ?, ?, ?)`;
        params = [collection_id, 'custom', custom_title, custom_subtitle, custom_description || "", custom_image || null];
    }

    const [result] = await db.query(sql, params);
    res.status(201).json({ success: true, itemId: result.insertId });

  } catch (error) {
    console.error("Error añadiendo item:", error);
    res.status(500).json({ error: "Error de base de datos" });
  }
};

//  Borrar un item
exports.deleteItem = async (req, res) => {
    const { itemId } = req.params;

    try {
        const [result] = await db.query("DELETE FROM Items WHERE item_id = ?", [itemId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item no encontrado" });
        }

        res.json({ success: true, message: "Item eliminado correctamente" });

    } catch (error) {
        console.error("Error borrando item:", error);
        res.status(500).json({ error: "Error de base de datos al borrar" });
    }
};
// Borrar una colección
exports.deleteCollection = async (req, res) => {
    const { collectionId } = req.params;
    const userId = req.user.id;

    try {
        const [result] = await db.query("DELETE FROM Collections WHERE collection_id = ? AND user_id = ?", [collectionId, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Colección no encontrada" });
        }

        res.json({ success: true, message: "Colección eliminada correctamente" });

    } catch (error) {
        console.error("Error borrando colección:", error);
        res.status(500).json({ error: "Error de base de datos al borrar" });
    }
};

// Actualizar una colección existente
exports.updateCollection = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; 
    const { collection_name, collection_description, cover_url } = req.body;

    try {
    
        const sql = `
            UPDATE Collections 
            SET 
                collection_name = ?, 
                collection_description = ?,
                cover_url = COALESCE(?, cover_url) -- Si cover_url es null, mantenemos la vieja
            WHERE collection_id = ? AND user_id = ?
        `;

        const [result] = await db.query(sql, [
            collection_name, 
            collection_description, 
            cover_url || null, 
            id, 
            userId
        ]);
        if (result.affectedRows === 0) {
            return res.status(403).json({ error: "No tienes permiso o la colección no existe" });
        }
        res.json({ success: true, message: "Colección actualizada" });
    } catch (error) {
        console.error("Error actualizando colección:", error);
        res.status(500).json({ error: "Error de servidor" });
    }
};

//Guardar colección
exports.saveCollection = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const [exists] = await db.query(
            "SELECT * FROM Saved_Collections WHERE user_id = ? AND collection_id = ?",
            [userId, id]
        );

        if (exists.length > 0) {
            return res.status(400).json({ error: "Ya tienes esta colección guardada" });
        }

        await db.query(
            "INSERT INTO Saved_Collections (user_id, collection_id) VALUES (?, ?)",
            [userId, id]
        );
        res.json({ success: true, message: "Colección guardada" });
    } catch (error) {
        console.error("DETALLE ERROR GUARDAR:", error); 
        res.status(500).json({ error: "Error de servidor al guardar", detail: error.message });
    }
};

//Obtener colecciones guardadas
exports.getSavedCollections = async (req, res) => {
    const userId = req.params.userId || req.user.id; 
    try {
        const sql = `
            SELECT c.* FROM Collections c
            JOIN Saved_Collections sc ON c.collection_id = sc.collection_id
            WHERE sc.user_id = ?
        `;
        const [result] = await db.query(sql, [userId]);
        res.json(result); 
    } catch (error) {
        console.error("Error obteniendo colecciones guardadas:", error);
        res.status(500).json({ error: "Error de servidor" });
    }
};

//Eliminar coleccón de guardadas
exports.deleteSavedCollection = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try{
        const sql = "DELETE FROM Saved_Collections WHERE user_id = ? AND collection_id = ?";
        const [result] = await db.query(sql, [userId, id]);
        res.json({ success: true, message: "Colección eliminada de guardadas" });
    }catch(error){
        console.error('No se ha podido eliminar la colección guardada:', error);
        res.status(500).json({ error: "Error de servidor" });
    };
};