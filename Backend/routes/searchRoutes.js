const express = require('express');
const router = express.Router(); // <--- IMPORTANTE: Define el router
const searchController = require('../controllers/searchController');


router.get('/', searchController.searchTribe);

module.exports = router;