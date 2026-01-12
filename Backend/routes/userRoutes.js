const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidator } = require("../middlewares/userValidations");
const { verifyToken } = require("../middlewares/authMiddleware");

// GETS
router.get("/test-users", verifyToken, userController.getUsers);
router.get("/feed/activity", verifyToken, userController.getActivityFeed);
router.get("followers/:userId", verifyToken, userController.getFollowers);
router.get("following/:userId", verifyToken, userController.getFollowing);
router.get("/:id", verifyToken, userController.getUserById);


// POSTS
router.post("/register", registerValidator, userController.createUser);
router.post("/google", userController.googleLogin);
router.post("follow/:userId", verifyToken, userController.followUser);
router.post("/login", userController.login);

// PUTS
router.put("/complete-profile", verifyToken, userController.completeProfile);
router.put("/update-profile", verifyToken, userController.updateProfile);
router.put("/change-password", verifyToken, userController.changePassword); 

// DELETES
router.delete("unfollow/:userId", verifyToken, userController.unfollowUser);

module.exports = router;