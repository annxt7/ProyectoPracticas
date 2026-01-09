const express = require('express');
const router = express.Router(); // <--- IMPORTANTE: Define el router
const searchController = require('../controllers/searchController');
import { verifyToken } from '../middlewares/authMiddleware';


router.get('/', verifyToken, searchController.searchTribe);
router.get('/suggested', verifyToken, searchController.getSuggestedUsers);

module.exports = router;