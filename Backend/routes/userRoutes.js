const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidator } = require("../middlewares/userValidations");
const { verifyToken } = require("../middlewares/authMiddleware");

// GETS
router.get("/test-users", verifyToken, userController.getUsers);
router.get("/feed/activity", verifyToken, userController.getActivityFeed);
router.get("/:id", verifyToken, userController.getUserById);

// POSTS
router.post("/register", registerValidator, userController.createUser);
router.post("/google", userController.googleLogin);
router.post("/login", userController.login);

// PUTS
router.put("/complete-profile", verifyToken, userController.completeProfile);
router.put("/update-profile", verifyToken, userController.updateProfile);
// NUEVA RUTA:
router.put("/change-password", verifyToken, userController.changePassword); 

module.exports = router;