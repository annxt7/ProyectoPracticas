const express = require('express');
const router = express.Router(); 
const searchController = require('../controllers/searchController');
const { verifyToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 * name: Búsqueda
 * description: Endpoints para buscar usuarios y colecciones en la plataforma
 */

/**
 * @swagger
 * /api/search/:
 * get:
 * summary: Búsqueda global de Tribe (Usuarios y Colecciones)
 * description: Busca usuarios y colecciones que coincidan con el término. Si no se envía término, devuelve resultados generales. Esta ruta es pública.
 * tags: [Búsqueda]
 * parameters:
 * - in: query
 * name: query
 * required: false
 * schema:
 * type: string
 * description: Término de búsqueda (ej. "pedro" o "viajes")
 *  * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Búsqueda realizada con éxito
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * users:
 * type: array
 * items:
 * type: object
 * collections:
 * type: array
 * items:
 * type: object
 * 500:
 * description: Error interno del servidor
 */
router.get('/',verifyToken, searchController.searchTribe);

/**
 * @swagger
 * /api/search/suggested:
 * get:
 * summary: Obtener usuarios sugeridos para seguir
 * description: Devuelve una lista aleatoria de 3 usuarios recomendados. Excluye administradores y al propio usuario que hace la petición.
 * tags: [Búsqueda]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Sugerencias obtenidas correctamente
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: integer
 * name:
 * type: string
 * handle:
 * type: string
 * img:
 * type: string
 * 401:
 * description: No autorizado (Falta token o es inválido)
 * 500:
 * description: Error al obtener sugerencias reales
 */
router.get('/suggested', verifyToken, searchController.getSuggestedUsers);

module.exports = router;