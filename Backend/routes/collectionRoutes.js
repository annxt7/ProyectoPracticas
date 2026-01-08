const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const { verifyToken } = require("../middlewares/authMiddleware"); 

// POST 
router.post("/", verifyToken, collectionController.createCollection);
router.post("/:collection_id/items", verifyToken, collectionController.addItemToCollection);
router.delete("/items/:itemId", verifyToken, collectionController.deleteItem);

// GET 
router.get("/user/:userId", collectionController.getUserCollections);
router.get("/:id", collectionController.getCollectionDetails);

module.exports = router;