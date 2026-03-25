const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const { verifyToken } = require("../middlewares/authMiddleware"); 

/**
 * @swagger
 * tags:
 *   - name: Colecciones
 *     description: Endpoints para gestionar, ver, guardar y dar like a las colecciones de los usuarios
 */

// ==========================================
// POST
// ==========================================

/**
 * @swagger
 * /api/collections/:
 *   post:
 *     summary: Crear una nueva colección
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collection_name:
 *                 type: string
 *                 description: Nombre de la colección (también acepta 'name')
 *               collection_type:
 *                 type: string
 *                 description: Tipo o categoría de la colección (también acepta 'type')
 *               collection_description:
 *                 type: string
 *                 description: Descripción de la colección (también acepta 'description')
 *               is_private:
 *                 type: boolean
 *                 description: Si la colección es privada o pública
 *               cover_url:
 *                 type: string
 *                 description: URL de la imagen de portada
 *     responses:
 *       201:
 *         description: Colección creada exitosamente
 */
router.post("/", verifyToken, collectionController.createCollection);

/**
 * @swagger
 * /api/collections/{collection_id}/items:
 *   post:
 *     summary: Añadir un item a una colección
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_type:
 *                 type: string
 *                 enum: [music, books, movies, shows, games, custom]
 *               reference_id:
 *                 type: integer
 *                 description: ID del catálogo original (si no es custom)
 *               custom_title:
 *                 type: string
 *               custom_subtitle:
 *                 type: string
 *               custom_description:
 *                 type: string
 *               custom_image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item añadido con éxito
 */
router.post("/:collection_id/items", verifyToken, collectionController.addItemToCollection);

/**
 * @swagger
 * /api/collections/save/{id}:
 *   post:
 *     summary: Guardar una colección en favoritos
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Colección guardada
 *       400:
 *         description: Ya tienes esta colección guardada
 */
router.post("/save/:id", verifyToken, collectionController.saveCollection);

/**
 * @swagger
 * /api/collections/like/{id}:
 *   post:
 *     summary: Dar o quitar "Me gusta" a una colección (Toggle)
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado del like actualizado (devuelve si le diste like o lo quitaste)
 */
router.post("/like/:id", verifyToken, collectionController.toggleLikeCollection);

// ==========================================
// DELETE
// ==========================================

/**
 * @swagger
 * /api/collections/items/{itemId}:
 *   delete:
 *     summary: Eliminar un item específico de una colección
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item eliminado correctamente
 *       404:
 *         description: Item no encontrado
 */
router.delete("/items/:itemId", verifyToken, collectionController.deleteItem);

/**
 * @swagger
 * /api/collections/{collection_id}:
 *   delete:
 *     summary: Eliminar una colección entera
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collection_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Colección eliminada correctamente
 */
router.delete("/:collection_id", verifyToken, collectionController.deleteCollection);

/**
 * @swagger
 * /api/collections/saved/{id}:
 *   delete:
 *     summary: Eliminar una colección de tu lista de guardados
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Colección eliminada de guardadas
 */
router.delete("/saved/:id", verifyToken, collectionController.deleteSavedCollection);

// ==========================================
// PUT
// ==========================================

/**
 * @swagger
 * /api/collections/{id}:
 *   put:
 *     summary: Actualizar los datos de una colección existente
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collection_name:
 *                 type: string
 *               collection_description:
 *                 type: string
 *               cover_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Colección actualizada
 *       403:
 *         description: No tienes permiso o la colección no existe
 */
router.put("/:id", verifyToken, collectionController.updateCollection);

// ==========================================
// GET
// ==========================================

/**
 * @swagger
 * /api/collections/user/{userId}:
 *   get:
 *     summary: Obtener todas las colecciones creadas por un usuario
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [recent, oldest, updated, items]
 *         description: Criterio para ordenar las colecciones
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de colecciones del usuario
 */
router.get("/user/:userId", verifyToken, collectionController.getUserCollections);

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     summary: Ver los detalles y los items de una colección
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la colección y sus items
 *       404:
 *         description: Colección no encontrada
 */
router.get("/:id", verifyToken, collectionController.getCollectionDetails);

/**
 * @swagger
 * /api/collections/saved/{userId}:
 *   get:
 *     summary: Obtener las colecciones guardadas (favoritos) de un usuario
 *     tags: [Colecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [recent, updated, items]
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *     responses:
 *       200:
 *         description: Lista de colecciones guardadas
 */
router.get("/saved/:userId", verifyToken, collectionController.getSavedCollections);

module.exports = router;