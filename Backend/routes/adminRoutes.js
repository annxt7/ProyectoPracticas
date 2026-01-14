const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Importa tu conexión a MariaDB
// const { verifyToken, isAdmin } = require('../middleware/auth'); // Luego protegeremos esto

// --- 1. OBTENER USUARIOS Y SOLICITUDES ---
router.get('/data', async (req, res) => {
    try {
        // Obtenemos todos los usuarios
        const [users] = await db.promise().query(
            'SELECT user_id as id, username, email, role, avatar_url as avatar, reset_code FROM Users ORDER BY created_at DESC'
        );

        // Separamos los que tienen reset_code "PENDIENTE" para la pestaña de solicitudes
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
        res.status(500).json({ error: error.message });
    }
});

// --- 2. OBTENER COLECCIONES (GENERAL O POR USUARIO) ---
router.get('/collections', async (req, res) => {
    const userId = req.query.userId;
    try {
        let query = `
            SELECT c.*, u.username, u.avatar_url 
            FROM Collections c 
            JOIN Users u ON c.user_id = u.user_id
        `;
        let params = [];

        if (userId) {
            query += ' WHERE c.user_id = ?';
            params.push(userId);
        }

        const [cols] = await db.promise().query(query, params);
        res.json(cols);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 3. GENERAR CÓDIGO DE RECOVERY ---
router.post('/approve-reset', async (req, res) => {
    const { userId, code } = req.body;
    try {
        await db.promise().query(
            'UPDATE Users SET reset_code = ? WHERE user_id = ?',
            [code, userId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 4. ELIMINAR (USUARIO O COLECCIÓN) ---
router.delete('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const table = type === 'users' ? 'Users' : 'Collections';
    const idField = type === 'users' ? 'user_id' : 'id'; // Ajusta según tu tabla de colecciones

    try {
        await db.promise().query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "No se pudo eliminar. Verifica si tiene datos vinculados." });
    }
});

module.exports = router;