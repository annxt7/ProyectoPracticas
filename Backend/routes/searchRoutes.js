const express = require('express');
const router = express.Router(); 
const searchController = require('../controllers/searchController');
const { verifyToken } = require("../middlewares/authMiddleware");


router.get('/', verifyToken, searchController.searchTribe);
router.get('/suggested', verifyToken, searchController.getSuggestedUsers);

module.exports = router;