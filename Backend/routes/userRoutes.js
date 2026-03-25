const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidator } = require("../middlewares/userValidations");
const { verifyToken } = require("../middlewares/authMiddleware");



// GET


router.get("/feed/activity", verifyToken, userController.getActivityFeed);
router.get("/followers/:id", verifyToken, userController.getFollowers);
router.get("/following/:id", verifyToken, userController.getFollowing);
router.get("/follow-stats/:id", verifyToken, userController.getFollowStats);

// POST

router.post("/register", registerValidator, userController.createUser);
router.post("/google", userController.googleLogin);
router.post("/login", userController.login);
router.post("/forgot-password", userController.requestPasswordReset);
router.post("/follow/:id", verifyToken, userController.followUser);
router.post("/reset-password", userController.resetPassword);
router.delete("/unfollow/:id", verifyToken, userController.unfollowUser);

// PUT
router.put("/complete-profile", verifyToken, userController.completeProfile);
router.put("/change-password", verifyToken, userController.changePassword);
router.put("/update-profile", verifyToken, userController.updateProfile);

// GET
router.get("/me", verifyToken, userController.getMe);
router.get("/:id", verifyToken, userController.getUserById);

module.exports = router;