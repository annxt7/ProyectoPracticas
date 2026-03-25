const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalogController");
const { verifyToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Catálogo
 *     description: Búsqueda y consulta de elementos en el catálogo global (Música, Libros, Películas, etc.)
 */

/**
 * @swagger
 * /api/catalog/search:
 *   get:
 *     summary: Buscar elementos en el catálogo
 *     description: Permite buscar en todo el catálogo o filtrar por una categoría específica. Si no se envía el parámetro 'query', devuelve un array vacío.
 *     tags: [Catálogo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (ej. "Harry Potter", "Inception").
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *           enum: [General, Music, Books, Movies, Shows, Games, Custom]
 *         description: Categoría para filtrar la búsqueda. Si se omite o es 'General', busca en todas las categorías.
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda obtenidos con éxito. El formato de respuesta varía si es una búsqueda general o por categoría.
 *       400:
 *         description: Categoría no válida enviada en los parámetros.
 *       401:
 *         description: No autorizado, falta token o es inválido.
 *       500:
 *         description: Error interno al buscar en el catálogo.
 */
router.get("/search", verifyToken, catalogController.searchCatalog);

module.exports = router;