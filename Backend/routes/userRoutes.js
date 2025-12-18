const express = require("express");
const router = express.Router();
const userControler= require('../controllers/userController')
const { registerValidator } = require("../middlewares/userValidations");

//GETS

router.get("/test-users", userControler.getUsers)
  

//POSTS

router.post("/register", registerValidator, userControler.createUser) 
router.post("/google", userController.googleLogin);

module.exports=router