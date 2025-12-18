const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");

// --- RUTAS DE LA COLECCIÓN (CARPETA) ---

// 1. Crear una nueva colección
// POST /api/collections
router.post("/", collectionController.createCollection);

// 2. Obtener todas las colecciones de un usuario (para su perfil)
// GET /api/collections/user/1
router.get("/user/:userId", collectionController.getUserCollections);

// 3. Obtener el DETALLE de una colección (con sus items dentro)
// GET /api/collections/5
router.get("/:id", collectionController.getCollectionDetails);


// --- RUTAS DE LOS ITEMS (CONTENIDO) ---

// 4. Añadir un item a una colección específica
// POST /api/collections/5/items  <-- El 5 es el ID de la colección
router.post("/:collection_id/items", collectionController.addItemToCollection);

module.exports = router;