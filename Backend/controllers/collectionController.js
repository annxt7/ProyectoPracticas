const db = require("../config/dbconect");

// 1. Crear una colección nueva
exports.createCollection = async (req, res) => {
  // Obtenemos el ID del usuario desde el token (más seguro)
  // Si prefieres enviarlo manual, usa req.body.user_id, pero esto es mejor:
  const user_id = req.user ? req.user.id : req.body.user_id; 
  
  const { collection_name, collection_type, collection_description, is_private } = req.body;

  try {
    const sql = `
      INSERT INTO Collections (user_id, collection_name, collection_type, collection_description, is_private, cover_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    // --- AQUÍ ESTABA EL ERROR: Faltaba ejecutar la query ---
    const [result] = await db.query(sql, [
      user_id, 
      collection_name, 
      collection_type, 
      collection_description, 
      is_private || 0, // Por defecto false si no se envía
      cover_url || null
    ]);

    res.status(201).json({ 
        success: true,
        message: "Colección creada", 
        collectionId: result.insertId 
    });

  } catch (error) {
    console.error("Error creando colección:", error);
    res.status(500).json({ error: "Error al crear la colección" });
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

    try {
        // A. Primero obtenemos la info de la colección (nombre, desc...)
        const [collectionRows] = await db.query("SELECT * FROM Collections WHERE collection_id = ?", [id]);
        
        if (collectionRows.length === 0) {
            return res.status(404).json({ error: "Colección no encontrada" });
        }
        const collection = collectionRows[0];

        // B. Ahora la magia: Obtenemos los items uniendo tablas
        // COALESCE sirve para decir: "Si no hay título custom, coge el de la peli, o el del libro..."
        const itemsSql = `
            SELECT 
                i.item_id, i.item_type, i.custom_description,
                COALESCE(i.custom_title, m.title, b.title, mov.title, s.title, g.title) AS display_title,
                COALESCE(i.custom_subtitle, m.artist, b.author, mov.director, g.developer, 'Varios') AS display_subtitle,
                COALESCE(m.cover_url, b.cover_url, mov.poster_url, s.poster_url, g.poster_url) AS display_image,
                i.created_at
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
        console.error("Error en getCollectionDetails:", error);
        res.status(500).json({ error: "Error al cargar los items" });
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
    custom_description 
  } = req.body;

  try {
    let sql = "";
    let params = [];

    // CASO A: Es un item de la base de datos (Ej: Una película que ya existe en Catalog_Movies)
    if (reference_id && item_type !== 'Custom') {
        let colName = "";
        switch (item_type) {
            case 'Music': colName = 'music_id'; break;
            case 'Books': colName = 'book_id'; break;
            case 'Movies': colName = 'movie_id'; break;
            case 'Shows': colName = 'show_id'; break;
            case 'Games': colName = 'game_id'; break;
            default: return res.status(400).json({ error: "Tipo inválido" });
        }
        
        sql = `INSERT INTO Items (collection_id, item_type, ${colName}) VALUES (?, ?, ?)`;
        params = [collection_id, item_type, reference_id];
    } 
    // CASO B: Es un item manual (Custom) que el usuario escribe a mano
    else {
        sql = `INSERT INTO Items (collection_id, item_type, custom_title, custom_subtitle, custom_description) VALUES (?, ?, ?, ?, ?)`;
        params = [collection_id, item_type, custom_title, custom_subtitle, custom_description];
    }

    await db.query(sql, params);
    res.status(201).json({ success: true, message: "Item añadido correctamente" });

  } catch (error) {
    console.error("Error añadiendo item:", error);
    res.status(500).json({ error: "Error al guardar el item" });
  }
};