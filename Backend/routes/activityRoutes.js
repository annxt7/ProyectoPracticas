const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken: auth } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 * name: Actividad
 * description: Endpoints para gestionar las notificaciones y la actividad del usuario
 */

/**
 * @swagger
 * /api/activity/:
 * get:
 * summary: Obtener todas las notificaciones del usuario
 * tags: [Actividad]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Lista de notificaciones obtenida correctamente
 * 401:
 * description: No autorizado, token inválido o faltante
 * 500:
 * description: Error interno del servidor
 */
router.get('/', auth, activityController.getNotifications);

/**
 * @swagger
 * /api/activity/read-all:
 * put:
 * summary: Marcar todas las notificaciones como leídas
 * tags: [Actividad]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Todas las notificaciones fueron marcadas como leídas
 * 401:
 * description: No autorizado
 * 500:
 * description: Error interno del servidor
 */
router.put('/read-all', auth, activityController.markAllAsRead);

/**
 * @swagger
 * /api/activity/{id}/read:
 * put:
 * summary: Marcar una notificación específica como leída
 * tags: [Actividad]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: ID de la notificación a marcar como leída
 * responses:
 * 200:
 * description: Notificación marcada como leída correctamente
 * 401:
 * description: No autorizado
 * 404:
 * description: Notificación no encontrada
 * 500:
 * description: Error interno del servidor
 */
router.put('/:id/read', auth, activityController.markAsRead);

module.exports = router;