const db = require('../config/dbconect');
const logger = require('../config/logger'); // Importamos el logger de Winston

/**
 * Busca usuarios y colecciones basándose en un término de búsqueda.
 * Si no hay término, devuelve los resultados generales (populares o recientes).
 */
exports.searchTribe = async (req, res, next) => {
    // Extraemos el parámetro de búsqueda de la URL (?query=...)
    const { query } = req.query;
    
    // Sanitización básica: si no hay query, usamos '%' para SQL
    // Si hay query, lo envolvemos en '%' para que busque coincidencias parciales
    const searchTerm = query ? `%${query}%` : '%'; 

    try {
        // Registramos en el log combinado quién está buscando qué
        logger.info(`Iniciando búsqueda - Query: "${query || 'general'}" - IP: ${req.ip}`);

        // 1. OBTENER USUARIOS
        // Buscamos por nombre de usuario
        const [users] = await db.query(`
            SELECT 
                user_id AS id, 
                username AS name, 
                CONCAT('@', username) AS handle, 
                bio, 
                avatar_url AS img,
                FALSE AS isFollowing 
            FROM Users 
            WHERE username LIKE ? 
            LIMIT 20
        `, [searchTerm]);

        // 2. OBTENER COLECCIONES
        // Buscamos por nombre de colección y unimos con el creador
        const [collections] = await db.query(`
            SELECT 
                c.collection_id AS id, 
                c.collection_name AS title, 
                c.cover_url AS cover,
                CONCAT('@', u.username) AS author,
                (SELECT COUNT(*) FROM Items WHERE collection_id = c.collection_id) AS itemsCount
            FROM Collections c
            JOIN Users u ON c.user_id = u.user_id
            WHERE c.collection_name LIKE ? 
            LIMIT 20
        `, [searchTerm]);

        // Si todo va bien, enviamos el JSON puro
        // El frontend recibirá un objeto con dos arrays: { users: [], collections: [] }
        res.status(200).json({ 
            success: true,
            users, 
            collections 
        });

    } catch (error) {
        // REGISTRO DE ERROR: Esto irá directamente a logs/error.log
        logger.error(`Error en searchController: ${error.message} | Query: ${query}`);
        
        // Pasamos el error al middleware global (el que creamos anteriormente)
        // Esto evita que el servidor se caiga y envía una respuesta limpia al cliente
        next(error); 
    }
};

exports.getSuggestedUsers = async (req, res) => {
    try {
        const [suggested] = await db.query(`
            SELECT user_id AS id, username AS name, 
            CONCAT('@', username) AS handle, avatar_url AS img 
            FROM Users ORDER BY RAND() LIMIT 3
        `);
        res.json(suggested);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};