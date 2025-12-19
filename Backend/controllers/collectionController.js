const db = require("../config/dbconect");

exports.createCollection = async (req, res) => {
  const { user_id, collection_name, collection_type, collection_description, is_private } = req.body;
  try {
    const sql = `
      INSERT INTO Collections (user_id, collection_name, collection_type, collection_description, is_private)
      VALUES (?, ?, ?, ?, ?)
    `;
    res.status(201).json({ 
        message: "Colección creada", 
        collectionId: result.insertId 
    });
  } catch (error) {
    console.error("Error creando colección:", error);
    res.status(500).json({ error: "Error al crear la colección" });
  }
};

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

exports.getCollectionDetails = async (req, res) => {
    const { id } = req.params; 

    try {
        const [collectionRows] = await db.query("SELECT * FROM Collections WHERE collection_id = ?", [id]);
        if (collectionRows.length === 0) {
            return res.status(404).json({ error: "Colección no encontrada" });
        }
        const collection = collectionRows[0];
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
        res.json({ ...collection, items });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar los items" });
    }
};

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
    //Categoría predefinida
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
    //Item custom
    else {
        sql = `INSERT INTO Items (collection_id, item_type, custom_title, custom_subtitle, custom_description) VALUES (?, ?, ?, ?, ?)`;
        params = [collection_id, item_type, custom_title, custom_subtitle, custom_description];
    }
    await db.query(sql, params);
    res.status(201).json({ message: "Item añadido correctamente" });
  } catch (error) {
    console.error("Error añadiendo item:", error);
    res.status(500).json({ error: "Error al guardar el item" });
  }
};