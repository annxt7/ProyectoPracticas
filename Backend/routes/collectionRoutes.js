const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const { verifyToken } = require("../middlewares/authMiddleware"); 

// POST 
router.post("/", verifyToken, collectionController.createCollection);
router.post("/:collection_id/items", verifyToken, collectionController.addItemToCollection);
router.post("/save/:id", verifyToken, collectionController.saveCollection);

//DELETE
router.delete("/items/:itemId", verifyToken, collectionController.deleteItem);
router.delete("/:collectionId", verifyToken, collectionController.deleteCollection);
router.delete("/saved/:id", verifyToken, collectionController.deleteSavedCollection);

//PUT
router.put("/:id", verifyToken, collectionController.updateCollection);

// GET 
router.get("/user/:userId",verifyToken, collectionController.getUserCollections);
router.get("/:id",verifyToken, collectionController.getCollectionDetails);
router.get("/saved/:userId",verifyToken, collectionController.getSavedCollections);

module.exports = router;
