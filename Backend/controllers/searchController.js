const db = require('../config/dbconect');
const logger = require('../config/logger'); // Importamos el logger de Winston


exports.searchTribe = async (req, res, next) => {
  
    const { query } = req.query;
    const searchTerm = query ? `%${query}%` : '%'; 

    try {
        logger.info(`Iniciando búsqueda - Query: "${query || 'general'}" - IP: ${req.ip}`);

        const [users] = await db.query(`
            SELECT 
                user_id AS id, 
                username AS name, 
                CONCAT('@', username) AS handle, 
                bio, 
                avatar_url AS img,
                role,
                FALSE AS isFollowing 
            FROM Users 
            WHERE username LIKE ? and role != 'admin'
            LIMIT 20
        `, [searchTerm]);

        // 2. OBTENER COLECCIONES
       const [collections] = await db.query(`
    SELECT 
        c.collection_id AS id, 
        c.collection_name AS title, 
        c.cover_url AS cover,
        c.user_id, -- <--- AÑADE ESTO AQUÍ
        CONCAT('@', u.username) AS author,
        (SELECT COUNT(*) FROM Items WHERE collection_id = c.collection_id) AS itemsCount
    FROM Collections c
    JOIN Users u ON c.user_id = u.user_id
    WHERE c.collection_name LIKE ? 
    LIMIT 20
`, [searchTerm]);

        res.status(200).json({ 
            success: true,
            users, 
            collections 
        });

    } catch (error) {
        logger.error(`Error en searchController: ${error.message} | Query: ${query}`);
        next(error); 
    }
};

exports.getSuggestedUsers = async (req, res) => {
    const id = req.user.id;
    console.log("ID de usuario para sugerencias:", req.user);
    try {
        const [rows] = await db.query(`
            SELECT 
                user_id AS id, 
                username AS name, 
                CONCAT('@', username) AS handle, 
                avatar_url AS img 
            FROM Users 
            WHERE role != 'admin' and user_id != ?
            ORDER BY RAND() 
            LIMIT 3
        `, [id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener sugerencias reales" });
    }
};