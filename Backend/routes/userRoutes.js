const express = require("express");
const router = express.Router();
const userController= require('../controllers/userController')
const { registerValidator } = require("../middlewares/userValidations");

//GETS

router.get("/test-users", userController.getUsers)

//POSTS

router.post("/register", registerValidator, userController.createUser) 
router.post('/google', userController.googleLogin);
router.get('/check-username/:username', userController.checkUsername);
router.put("/complete-profile", userController.completeProfile);

module.exports=router