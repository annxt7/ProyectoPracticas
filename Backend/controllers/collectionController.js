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
        // 1. Obtener datos de la colección + Datos del Dueño (JOIN)
        // Usamos LEFT JOIN Users para sacar el nombre del creador
        const sqlCollection = `
            SELECT 
                c.*, 
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
        
        // Devolvemos todo mezclado
        res.json({ ...collection, items });

    } catch (error) {
        console.error("Error CRÍTICO en getCollectionDetails:", error);
        res.status(500).json({ error: "Error de servidor al cargar colección" });
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