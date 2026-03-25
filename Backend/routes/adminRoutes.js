const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

/**
 * @swagger
 * tags:
 * name: Admin
 * description: Endpoints exclusivos para administradores del sistema
 */

/**
 * @swagger
 * /api/admin/data:
 * get:
 * summary: Obtener datos para el panel de admini
 * tags: [Admin]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Datos obtenidos correctamente
 * 401:
 * description: No autorizado (Token faltante o inválido)
 * 403:
 * description: Prohibido (El usuario no tiene rol de administrador)
 * 500:
 * description: Error interno del servidor
 */
router.get('/data', verifyToken, isAdmin, adminController.getAdminData);

/**
 * @swagger
 * /api/admin/approve-reset:
 * post:
 * summary: Aprobar el restablecimiento de cuenta o contraseña de un usuario
 * tags: [Admin]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * userId:
 * type: string
 * description: ID del usuario al que se le aprobará el reseteo
 * example: "64a7f9b2c3d4e5f6g7h8i9j0"
 * responses:
 * 200:
 * description: Restablecimiento aprobado correctamente
 * 400:
 * description: Faltan datos en la petición (ej. no se envió el userId)
 * 401:
 * description: No autorizado
 * 403:
 * description: Prohibido (Se requiere rol admin)
 * 500:
 * description: Error interno del servidor
 */
router.post('/approve-reset', verifyToken, isAdmin, adminController.approveReset);

/**
 * @swagger
 * /api/admin/{type}/{id}:
 * delete:
 * summary: Eliminar una entidad específica del sistema (usuarios, colecciones, etc.)
 * tags: [Admin]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: type
 * required: true
 * schema:
 * type: string
 * description: Tipo de entidad a eliminar (ej. 'user', 'collection', 'custom')
 * example: "user"
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: ID único de la entidad a eliminar
 * responses:
 * 200:
 * description: Entidad eliminada correctamente
 * 401:
 * description: No autorizado
 * 403:
 * description: Prohibido (Se requiere rol admin)
 * 404:
 * description: Entidad no encontrada
 * 500:
 * description: Error interno del servidor
 */
router.delete('/:type/:id', verifyToken, isAdmin, adminController.deleteEntity);

module.exports = router;