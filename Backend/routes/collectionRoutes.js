const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");



// POST 
router.post("/", collectionController.createCollection);
router.post("/:collection_id/items", collectionController.addItemToCollection);


// GET 
router.get("/user/:userId", collectionController.getUserCollections);
router.get("/:id", collectionController.getCollectionDetails);



module.exports = router;