const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken: auth } = require('../middlewares/authMiddleware');

router.get('/', auth, activityController.getNotifications);
router.put('/read-all', auth, activityController.markAllAsRead);
router.put('/:id/read', auth, activityController.markAsRead);

module.exports = router;