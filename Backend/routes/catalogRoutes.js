const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalogController");


router.get("/search", catalogController.searchCatalog);

module.exports = router;