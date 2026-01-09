const express = require("express");
const router = express.Router();
const userController= require('../controllers/userController')
const { registerValidator } = require("../middlewares/userValidations");
const { verifyToken } = require("../middlewares/authMiddleware");

//GETS

router.get("/test-users", userController.getUsers)
router.get("/:id", userController.getUserById);
router.get("/feed/activity",verifyToken, userController.getActivityFeed);

//POSTS

router.post("/register", registerValidator, userController.createUser) 
router.post("/google", userController.googleLogin);
router.post("/login",userController.login)
router.put("/complete-profile",verifyToken, userController.completeProfile);
router.put("/update-profile",verifyToken,userController.updateProfile)


module.exports=router