const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalogController");
const { verifyToken } = require("../middlewares/authMiddleware");


router.get("/search", verifyToken, catalogController.searchCatalog);

module.exports = router;