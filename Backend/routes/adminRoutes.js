const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

router.get('/data', verifyToken, isAdmin, adminController.getAdminData);
router.post('/approve-reset', verifyToken, isAdmin, adminController.approveReset);
router.delete('/:type/:id', verifyToken, isAdmin, adminController.deleteEntity);

module.exports = router;