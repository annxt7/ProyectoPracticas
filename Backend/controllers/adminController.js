const db = require("../config/dbconect");

// GET: Obtener todos los datos del panel con paginación
exports.getAdminData = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        // 1. Usuarios
        const [users] = await db.query(`
            SELECT user_id AS id, username, email, role, avatar_url AS avatar 
            FROM Users
        `);

        // 2. Solicitudes de contraseña
        const [requests] = await db.query(`
            SELECT id, email, status, code AS codeGenerated, 
            DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS date 
            FROM Password_Requests 
            ORDER BY created_at DESC
        `);

        // 3. Colecciones 
        const [collections] = await db.query(`
            SELECT c.collection_id AS id, c.collection_name AS name, c.item_count, 
            u.username AS owner_username, u.avatar_url AS owner_avatar, u.role AS owner_role
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

        const [customCatalog] = await db.query(`
            SELECT custom_id AS id, title, subtitle, category, image_url,
                   DATE_FORMAT(created_at, '%d/%m/%Y') AS date
            FROM Catalog_Custom
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?`, 
            [limit, offset]
        );

        const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM Catalog_Custom`);

        res.json({
            users,
            requests,
            collections: formattedCollections,
            customCatalog,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Error en getAdminData:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// POST: Aprobar reseteo de contraseña
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

// DELETE: Eliminar usando IF / ELSE (Sin break y fácil de entender)
exports.deleteEntity = async (req, res) => {
    const { type, id } = req.params;
    const entity = type.toLowerCase();
    
    let table = '';
    let idField = '';

    if (entity === 'user' || entity === 'users') {
        table = 'Users';
        idField = 'user_id';
    } 
    else if (entity === 'collections') {
        table = 'Collections';
        idField = 'collection_id';
    } 
    else if (entity === 'custom') {
        table = 'Catalog_Custom';
        idField = 'custom_id';
    }
    if (!table) {
        return res.status(400).json({ error: "Tipo de entidad no válido" });
    }

    try {
        const [result] = await db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No se encontró el registro" });
        }

        res.json({ success: true, message: "Eliminado con éxito" });
    } catch (error) {
        console.error("Error al borrar:", error);
        res.status(500).json({ error: "Error de servidor" });
    }
};