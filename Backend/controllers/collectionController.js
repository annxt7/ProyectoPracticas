const db = require("../config/dbconect");

// 1. Crear una colección nueva
exports.createCollection = async (req, res) => {
  console.log("--- INTENTO DE CREAR COLECCIÓN ---");
  
  // 1. Verificar Usuario
  if (!req.user || !req.user.id) {
      console.error("ERROR: No hay usuario en req.user (Falta verifyToken en la ruta)");
      return res.status(401).json({ error: "Usuario no identificado" });
  }
  const user_id = req.user.id;

  // 2. Datos recibidos
  // NOTA: Asegúrate de que el frontend envía 'cover_url', no 'cover' ni 'image'
  const { collection_name, collection_type, collection_description, is_private, cover_url } = req.body;
  
  console.log("Usuario ID:", user_id);
  console.log("Datos:", { collection_name, collection_type, cover_url });

  try {
    // 3. Query SQL
    // IMPORTANTE: Los nombres aquí deben ser EXACTOS a tu base de datos
    const sql = `
      INSERT INTO Collections 
      (user_id, collection_name, collection_type, collection_description, is_private, cover_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // 4. Ejecución
    const [result] = await db.query(sql, [
      user_id, 
      collection_name, 
      collection_type, 
      collection_description, 
      is_private ? 1 : 0, // Convertimos true/false a 1/0 por seguridad
      cover_url || null   // Si llega undefined, ponemos null
    ]);

    console.log("¡ÉXITO! ID Creado:", result.insertId);

    res.status(201).json({ 
        success: true,
        message: "Colección creada", 
        collectionId: result.insertId 
    });

  } catch (error) {
    console.error("ERROR SQL CRÍTICO:", error);
    // Devolvemos el mensaje de SQL para que lo veas en el navegador
    res.status(500).json({ error: "Error de base de datos", sqlMessage: error.message });
  }
};

// 2. Obtener todas las colecciones de un usuario (para el perfil)
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

// 3. Ver el detalle de una colección (y sus items)
exports.getCollectionDetails = async (req, res) => {
    const { id } = req.params; 

    console.log(`--- PETICIÓN DE COLECCIÓN ID: ${id} ---`);

    try {
        const sqlCollection = `
            SELECT 
                c.collection_id, c.collection_name, c.collection_description, 
                c.collection_type, c.cover_url, c.likes, c.created_at,
                c.user_id, -- Necesario para comparar con el usuario logueado
                u.username AS creator_username, 
                u.avatar_url AS creator_avatar,
                u.user_id AS creator_id
            FROM Collections c
            LEFT JOIN Users u ON c.user_id = u.user_id
            WHERE c.collection_id = ?
        `;

        const [collectionRows] = await db.query(sqlCollection, [id]);
        
        if (collectionRows.length === 0) {
            console.log("Error: No existe ese ID en la tabla Collections");
            return res.status(404).json({ error: "Colección no encontrada en la base de datos" });
        }

        const collection = collectionRows[0];
        console.log("Colección encontrada:", collection.collection_name);

        // 2. Obtener los Items
        // ¡OJO! Aquí he quitado 'i.created_at' porque tu tabla Items NO lo tiene.
        const itemsSql = `
            SELECT 
                i.item_id, i.item_type, i.custom_description,
                -- COALESCE busca el primer valor no nulo (Prioridad: Custom -> Catalogo)
                COALESCE(i.custom_title, m.title, b.title, mov.title, s.title, g.title) AS display_title,
                COALESCE(i.custom_subtitle, m.artist, b.author, mov.director, g.developer, 'Varios') AS display_subtitle,
                COALESCE(m.cover_url, b.cover_url, mov.poster_url, s.poster_url, g.poster_url) AS display_image
                
                -- ELIMINADO: i.created_at (No existe en tu tabla Items)
            FROM Items i
            LEFT JOIN Catalog_Music m ON i.music_id = m.music_id
            LEFT JOIN Catalog_Books b ON i.book_id = b.book_id
            LEFT JOIN Catalog_Movies mov ON i.movie_id = mov.movie_id
            LEFT JOIN Catalog_Shows s ON i.show_id = s.show_id
            LEFT JOIN Catalog_Games g ON i.game_id = g.game_id
            WHERE i.collection_id = ?
        `;
        
        const [items] = await db.query(itemsSql, [id]);
        
        // Devolvemos todo junto
        res.json({ ...collection, items });

    } catch (error) {
        console.error("Error CRÍTICO en getCollectionDetails:", error);
        // Enviamos el mensaje exacto de SQL para debuggear si vuelve a fallar
        res.status(500).json({ error: "Error de base de datos", details: error.message });
    }
};

// 4. Añadir un item a la colección
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
    'Music': 'music_id',
    'Books': 'book_id',
    'Movies': 'movie_id',
    'Shows': 'show_id',
    'Games': 'game_id'
  };

  try {
    let sql = "";
    let params = [];

    if (reference_id && item_type !== 'Custom') {
        
        const colName = columnMap[item_type];
        if (!colName) {
            return res.status(400).json({ error: "Tipo de item inválido" });
        }
        sql = `INSERT INTO Items (collection_id, item_type, ${colName}) VALUES (?, ?, ?)`;
        params = [collection_id, item_type, reference_id];
    } 
    else {
        sql = `INSERT INTO Items (collection_id, item_type, custom_title, custom_subtitle, custom_description, custom_image) VALUES (?, ?, ?, ?, ?, ?)`;
        params = [collection_id, 'Custom', custom_title, custom_subtitle, custom_description || "", custom_image || null];
    }
    const [result] = await db.query(sql, params);
    res.status(201).json({ success: true, itemId: result.insertId });

  } catch (error) {
    console.error("Error añadiendo item:", error);
    res.status(500).json({ error: "Error de base de datos" });
  }
};

// 5. Borrar un item
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

// 6. Actualizar una colección existente
exports.updateCollection = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; 
    const { collection_name, collection_description, cover_url } = req.body;

    console.log(`--- ACTUALIZANDO COLECCIÓN ${id} ---`);

    try {
        // Preparamos la query dinámica
        // Solo actualizamos lo que nos envíen
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